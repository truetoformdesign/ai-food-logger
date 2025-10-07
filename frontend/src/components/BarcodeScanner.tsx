import React, { useState, useRef, useEffect } from 'react';
import { BrowserMultiFormatReader, DecodeHintType, BarcodeFormat } from '@zxing/library';
import { motion } from 'framer-motion';
import { Camera, X, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface BarcodeScannerProps {
  onScan: (barcode: string) => void;
  onClose: () => void;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scannedCode, setScannedCode] = useState<string | null>(null);
  const [manualInput, setManualInput] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const readerRef = useRef<BrowserMultiFormatReader | null>(null);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (readerRef.current) {
        readerRef.current.reset();
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);
      
      // Configure reader with specific barcode formats for better detection
      const hints = new Map();
      hints.set(DecodeHintType.POSSIBLE_FORMATS, [
        BarcodeFormat.EAN_13,
        BarcodeFormat.EAN_8,
        BarcodeFormat.UPC_A,
        BarcodeFormat.UPC_E,
        BarcodeFormat.CODE_128,
        BarcodeFormat.CODE_39,
        BarcodeFormat.CODE_93,
        BarcodeFormat.CODABAR,
        BarcodeFormat.ITF,
        BarcodeFormat.RSS_14,
        BarcodeFormat.RSS_EXPANDED,
        BarcodeFormat.QR_CODE,
        BarcodeFormat.DATA_MATRIX,
        BarcodeFormat.AZTEC,
        BarcodeFormat.PDF_417
      ]);
      hints.set(DecodeHintType.TRY_HARDER, true);
      
      const reader = new BrowserMultiFormatReader(hints);
      readerRef.current = reader;

      // Get available video devices
      const videoInputDevices = await reader.listVideoInputDevices();
      
      if (videoInputDevices.length === 0) {
        throw new Error('No camera found. Please ensure you have a camera connected.');
      }

      // Use the first available camera (usually the back camera on mobile)
      const selectedDevice = videoInputDevices[0];
      
      // Start decoding from video with better error handling
      await reader.decodeFromVideoDevice(selectedDevice.deviceId, videoRef.current!, (result, error) => {
        if (result) {
          const code = result.getText();
          setScannedCode(code);
          setIsScanning(false);
          reader.reset();
          
          toast.success(`Barcode detected: ${code}`, {
            icon: '📱',
            duration: 3000,
          });
          
          // Call the parent's onScan callback
          onScan(code);
        }
        
        if (error) {
          // Only show errors that aren't "not found" (which is normal during scanning)
          if (error.name !== 'NotFoundException' && error.name !== 'ChecksumException') {
            console.error('Barcode scanning error:', error);
            setError(`Scanning error: ${error.message}`);
          }
        }
      });

    } catch (err) {
      console.error('Camera access error:', err);
      setError(err instanceof Error ? err.message : 'Failed to access camera');
      setIsScanning(false);
    }
  };

  const stopScanning = () => {
    if (readerRef.current) {
      readerRef.current.reset();
    }
    setIsScanning(false);
    setScannedCode(null);
  };

  const handleClose = () => {
    stopScanning();
    onClose();
  };

  const handleManualSubmit = () => {
    if (manualInput.trim()) {
      onScan(manualInput.trim());
      setManualInput('');
      setShowManualInput(false);
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-2xl p-6 mx-4 max-w-md w-full"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Camera className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Scan Barcode</h3>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Scanner Area */}
        <div className="relative bg-gray-100 rounded-xl overflow-hidden mb-4">
          <video
            ref={videoRef}
            className="w-full h-64 object-cover"
            playsInline
            muted
          />
          
          {/* Scanning Overlay */}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Scanning...</span>
              </div>
            </div>
          )}

          {/* Success Overlay */}
          {scannedCode && (
            <div className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center">
              <div className="text-white text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-2" />
                <p className="font-semibold">Barcode Scanned!</p>
                <p className="text-sm opacity-90">{scannedCode}</p>
              </div>
            </div>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800">Camera Error</p>
              <p className="text-xs text-red-600 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>How to scan:</strong>
          </p>
          <ul className="text-xs text-blue-700 mt-1 space-y-1">
            <li>• Point your camera at the barcode</li>
            <li>• Ensure good lighting</li>
            <li>• Hold steady until detected</li>
            <li>• Or enter barcode manually below</li>
          </ul>
        </div>

        {/* Manual Input */}
        <div className="mb-4">
          <button
            onClick={() => setShowManualInput(!showManualInput)}
            className="w-full text-sm text-blue-600 hover:text-blue-700 underline"
          >
            {showManualInput ? 'Hide' : 'Enter barcode manually'}
          </button>
          
          {showManualInput && (
            <div className="mt-3 space-y-2">
              <input
                type="text"
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                placeholder="Enter barcode number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleManualSubmit}
                disabled={!manualInput.trim()}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Product
              </button>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex space-x-3">
          {!isScanning ? (
            <button
              onClick={startScanning}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <Camera className="w-4 h-4" />
              <span>Start Scanning</span>
            </button>
          ) : (
            <button
              onClick={stopScanning}
              className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-lg font-medium transition-colors"
            >
              Stop Scanning
            </button>
          )}
          
          <button
            onClick={handleClose}
            className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BarcodeScanner;
