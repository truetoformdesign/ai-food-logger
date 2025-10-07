import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Keyboard, Loader2, CheckCircle, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { FoodItem, VoiceLogResponse } from '../types';
import BarcodeScanner from './BarcodeScanner';
import EditableFoodItem from './EditableFoodItem';
import { barcodeService } from '../services/barcodeService';

interface FoodLogInterfaceProps {
  onVoiceLog: (audioBlob: Blob) => Promise<VoiceLogResponse>;
  onBarcodeScan: (foodItem: FoodItem) => void;
  onUpdateItem: (index: number, updatedItem: FoodItem) => void;
  onDeleteItem: (index: number) => void;
  isLoading: boolean;
  foodEntries: FoodItem[];
  totalCalories: number;
}

const FoodLogInterface: React.FC<FoodLogInterfaceProps> = ({
  onVoiceLog,
  onBarcodeScan,
  onUpdateItem,
  onDeleteItem,
  isLoading,
  foodEntries,
  totalCalories
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/m4a' });
        
        try {
          const result = await onVoiceLog(audioBlob);
          toast.success(`Logged ${result.items.length} food items!`);
        } catch (error) {
          toast.error('Failed to process voice recording. Please try again.');
        }
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);
      
      // Start duration counter
      intervalRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);

    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Microphone access denied. Please allow microphone access and try again.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim()) return;
    
    try {
      // Use Netlify Functions
      const response = await fetch('/.netlify/functions/log-text', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: textInput }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Call the parent's voice log handler with the same data structure
      onVoiceLog(data);
      
      toast.success(`Successfully logged ${data.items.length} food items!`, {
        icon: '✅',
      });
      
      setTextInput('');
      setShowTextInput(false);
    } catch (error) {
      console.error('Error processing text input:', error);
      toast.error('Failed to process text input. Please try again.', {
        icon: '❌',
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBarcodeScan = async (barcode: string) => {
    try {
      toast.loading('Looking up product...', { id: 'barcode-lookup' });
      
      const foodItem = await barcodeService.lookupProduct(barcode);
      
      if (foodItem) {
        onBarcodeScan(foodItem);
        toast.success(`Added ${foodItem.name} to your log!`, {
          id: 'barcode-lookup',
          icon: '📱',
        });
        setShowBarcodeScanner(false);
      } else {
        toast.error('Product not found. Please try again.', {
          id: 'barcode-lookup',
          icon: '❌',
        });
      }
    } catch (error) {
      console.error('Barcode scan error:', error);
      toast.error('Failed to process barcode. Please try again.', {
        id: 'barcode-lookup',
        icon: '❌',
      });
    }
  };


  return (
    <div className="space-y-6">
      {/* Main Input Area */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
        <div className="text-center space-y-4">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-gray-900">
              What have you eaten today?
            </h2>
            <p className="text-sm text-gray-500">
              Just say what you've eaten today, type it out, or scan a barcode
            </p>
          </div>

          {/* Input Methods */}
          <div className="flex justify-center space-x-4">
            {/* Voice Recording Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isLoading}
              className={`
                relative flex items-center justify-center w-16 h-16 rounded-full transition-all duration-200
                ${isRecording 
                  ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/30' 
                  : 'bg-primary-500 hover:bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                }
                ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {isLoading ? (
                <Loader2 className="w-6 h-6 animate-spin" />
              ) : isRecording ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
              
              {isRecording && (
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-red-500"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </motion.button>

            {/* Text Input Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowTextInput(!showTextInput)}
              className="flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-all duration-200"
            >
              <Keyboard className="w-6 h-6" />
            </motion.button>

            {/* Barcode Scanner Button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowBarcodeScanner(true)}
              className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 hover:bg-green-200 text-green-600 transition-all duration-200"
            >
              <Camera className="w-6 h-6" />
            </motion.button>
          </div>

          {/* Recording Status */}
          {isRecording && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-2"
            >
              <p className="text-sm text-red-600 font-medium">
                Recording... {formatDuration(recordingDuration)}
              </p>
              <p className="text-xs text-gray-500">
                Tap the microphone to stop
              </p>
            </motion.div>
          )}

          {/* Text Input */}
          <AnimatePresence>
            {showTextInput && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <textarea
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type what you ate..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  rows={3}
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleTextSubmit}
                    className="flex-1 bg-primary-500 text-white px-4 py-2 rounded-lg hover:bg-primary-600 transition-colors"
                  >
                    Submit
                  </button>
                  <button
                    onClick={() => setShowTextInput(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Helper Text */}
          <p className="text-xs text-gray-500">
            You can just type, talk or scan barcodes
          </p>
        </div>
      </div>

      {/* Food Entries */}
      <AnimatePresence>
        {foodEntries.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <h3 className="text-lg font-semibold text-gray-900">Today's Food</h3>
            
            {foodEntries.map((item, index) => (
              <EditableFoodItem
                key={`${item.name}-${index}`}
                item={item}
                index={index}
                onUpdate={onUpdateItem}
                onDelete={onDeleteItem}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {foodEntries.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No food logged yet</h3>
          <p className="text-gray-500 text-sm">
            Start by recording what you ate today
          </p>
        </motion.div>
      )}

      {/* Barcode Scanner Modal */}
      <AnimatePresence>
        {showBarcodeScanner && (
          <BarcodeScanner
            onScan={handleBarcodeScan}
            onClose={() => setShowBarcodeScanner(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default FoodLogInterface;
