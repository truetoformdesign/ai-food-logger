import React, { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import FoodLogInterface from './components/FoodLogInterface';
import ErrorMonitor from './components/ErrorMonitor';
import { FoodItem, VoiceLogResponse } from './types';
import { errorLogger } from './utils/errorLogger';
import './index.css';

function App() {
  const [foodEntries, setFoodEntries] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentDate] = useState(new Date());
  const [showErrorMonitor, setShowErrorMonitor] = useState(false);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleVoiceLog = async (audioBlob: Blob) => {
    setIsLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'voice-recording.m4a');

      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3000';
      const response = await fetch(`${apiUrl}/api/log/voice`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        errorLogger.log('error', `API Error: ${response.status} - ${errorText}`, 'handleVoiceLog');
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: VoiceLogResponse = await response.json();
      
      // Add the new food items to our entries
      setFoodEntries(prev => [...prev, ...data.items]);
      
      errorLogger.log('info', `Successfully logged ${data.items.length} food items`, 'handleVoiceLog');
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      errorLogger.log('error', `Voice logging failed: ${errorMessage}`, 'handleVoiceLog', error instanceof Error ? error.stack : undefined);
      console.error('Error logging food:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const totalCalories = foodEntries.reduce((sum, item) => sum + item.estimatedCalories, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Toaster 
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1f2937',
            color: '#fff',
            borderRadius: '12px',
            padding: '16px',
            fontSize: '14px',
            fontWeight: '500',
          },
        }}
      />
      
      <div className="max-w-md mx-auto bg-white min-h-screen shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Food Log</h1>
              <p className="text-blue-100 mt-1">{formatDate(currentDate)}</p>
            </div>
            <button
              onClick={() => setShowErrorMonitor(!showErrorMonitor)}
              className="px-3 py-1.5 text-xs bg-white/20 hover:bg-white/30 rounded-full transition-colors backdrop-blur-sm"
            >
              {showErrorMonitor ? 'Hide' : 'Show'} Monitor
            </button>
          </div>
        </div>

        {/* Error Monitor */}
        {showErrorMonitor && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <ErrorMonitor />
          </div>
        )}


        {/* Main Content */}
        <div className="flex-1 px-6 py-6">
          <FoodLogInterface 
            onVoiceLog={handleVoiceLog}
            isLoading={isLoading}
            foodEntries={foodEntries}
            totalCalories={totalCalories}
          />
        </div>

        {/* Footer Stats */}
        {foodEntries.length > 0 && (
          <div className="bg-gray-50 border-t border-gray-200 px-6 py-4">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-600">Total Calories</p>
                <p className="text-2xl font-bold text-gray-900">{totalCalories}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Items Logged</p>
                <p className="text-lg font-semibold text-gray-900">{foodEntries.length}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
