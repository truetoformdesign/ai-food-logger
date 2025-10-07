import React, { useState, useRef, useEffect } from 'react';
import Quagga from 'quagga';
import { motion } from 'framer-motion';
import { Camera, X, CheckCircle, RotateCcw } from 'lucide-react';
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
  const [cameraFacing, setCameraFacing] = useState<'environment' | 'user'>('environment');
  const scannerRef = useRef<HTMLDivElement>(null);
  const isInitialized = useRef(false);

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (isInitialized.current) {
        Quagga.stop();
        isInitialized.current = false;
      }
    };
  }, []);

  const startScanning = async () => {
    try {
      setError(null);
      setIsScanning(true);
      
      if (!scannerRef.current) {
        throw new Error('Scanner container not found');
      }

      // Configure Quagga for optimal barcode detection
      const config = {
        inputStream: {
          name: "Live",
          type: "LiveStream",
          target: scannerRef.current,
          constraints: {
            width: 640,
            height: 480,
            facingMode: cameraFacing, // Use back camera by default
          },
        },
        locator: {
          patchSize: "medium",
          halfSample: true,
        },
        numOfWorkers: 2,
        frequency: 10,
        decoder: {
          readers: [
            "code_128_reader",
            "ean_reader",
            "ean_8_reader",
            "code_39_reader",
            "code_39_vin_reader",
            "codabar_reader",
            "upc_reader",
            "upc_e_reader",
            "i2of5_reader"
          ],
        },
        locate: true,
      };

      // Initialize Quagga
      await new Promise<void>((resolve, reject) => {
        Quagga.init(config, (err) => {
          if (err) {
            reject(err);
            return;
          }
          isInitialized.current = true;
          Quagga.start();
          resolve();
        });
      });

      // Listen for successful barcode detection
      Quagga.onDetected((result) => {
        const code = result.codeResult.code;
        setScannedCode(code);
        setIsScanning(false);
        Quagga.stop();
        
        toast.success(`Barcode detected: ${code}`, {
          icon: '📱',
          duration: 3000,
        });
        
        // Call the parent's onScan callback
        onScan(code);
      });

      // Listen for errors
      Quagga.onProcessed((result) => {
        if (result && result.boxes) {
          const drawingCtx = Quagga.canvas.ctx.overlay;
          const drawingCanvas = Quagga.canvas.dom.overlay;
          
          if (result.boxes) {
            const width = drawingCanvas.getAttribute("width");
            const height = drawingCanvas.getAttribute("height");
            if (width && height) {
              drawingCtx.clearRect(0, 0, parseInt(width), parseInt(height));
            }
            result.boxes.filter((box) => box !== result.box).forEach((box) => {
              Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
            });
          }
          
          if (result.box) {
            Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
          }
          
          if (result.codeResult && result.codeResult.code) {
            Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
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
    if (isInitialized.current) {
      Quagga.stop();
      isInitialized.current = false;
    }
    setIsScanning(false);
    setScannedCode(null);
  };

  const switchCamera = () => {
    const newFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    setCameraFacing(newFacing);
    if (isScanning) {
      stopScanning();
      setTimeout(() => startScanning(), 500);
    }
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 p-4"
    >
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        className="relative bg-white rounded-lg shadow-xl w-full max-w-md p-6"
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 z-10"
        >
          <X size={24} />
        </button>
        <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">Scan Barcode</h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {/* Scanner Container */}
        <div className="relative w-full h-64 bg-gray-200 rounded-lg overflow-hidden mb-4">
          <div ref={scannerRef} className="w-full h-full"></div>
          {!isScanning && !scannedCode && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-75 text-white text-center p-4">
              <div className="text-center">
                <Camera size={48} className="mx-auto mb-2" />
                <p>Tap "Start Scanning" to activate camera</p>
              </div>
            </div>
          )}
          {scannedCode && (
            <div className="absolute inset-0 flex items-center justify-center bg-green-800 bg-opacity-75 text-white text-center p-4">
              <CheckCircle size={48} className="mb-2" />
              <p className="text-lg font-semibold">Scanned: {scannedCode}</p>
            </div>
          )}
        </div>

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
        <div className="flex space-x-2">
          {!isScanning ? (
            <button
              onClick={startScanning}
              className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-blue-700 transition-colors"
            >
              <Camera size={20} />
              <span>Start</span>
            </button>
          ) : (
            <button
              onClick={stopScanning}
              className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg flex items-center justify-center space-x-2 hover:bg-red-600 transition-colors"
            >
              <X size={20} />
              <span>Stop</span>
            </button>
          )}
          <button
            onClick={switchCamera}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors flex items-center justify-center"
            title="Switch camera"
          >
            <RotateCcw size={20} />
          </button>
          <button
            onClick={handleClose}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default BarcodeScanner;