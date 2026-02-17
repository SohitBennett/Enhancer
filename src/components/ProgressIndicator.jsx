import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const ProgressIndicator = ({ 
  isProcessing, 
  originalFile, 
  enhancedImage,
  startTime 
}) => {
  const [progress, setProgress] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentStatus, setCurrentStatus] = useState("Initializing...");
  const [originalSize, setOriginalSize] = useState(0);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [enhancedSize, setEnhancedSize] = useState(0);

  // Status messages for different progress stages
  const statusMessages = [
    { threshold: 0, message: "🔍 Analyzing image..." },
    { threshold: 20, message: "🎨 Preparing enhancement..." },
    { threshold: 40, message: "✨ Applying AI enhancement..." },
    { threshold: 60, message: "🔧 Processing details..." },
    { threshold: 80, message: "🎯 Finalizing enhancement..." },
    { threshold: 95, message: "✅ Almost done..." },
    { threshold: 100, message: "🎉 Enhancement complete!" }
  ];

  // Simulate progress (since we don't have real progress from API)
  useEffect(() => {
    if (isProcessing) {
      setProgress(0);
      setElapsedTime(0);
      
      // Progress simulation
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev; // Stop at 95% until actually complete
          return prev + Math.random() * 15; // Random increment for realistic feel
        });
      }, 300);

      // Timer
      const timerInterval = setInterval(() => {
        setElapsedTime(prev => prev + 0.1);
      }, 100);

      return () => {
        clearInterval(progressInterval);
        clearInterval(timerInterval);
      };
    } else if (!isProcessing && enhancedImage) {
      // Complete the progress when done
      setProgress(100);
    }
  }, [isProcessing, enhancedImage]);

  // Update status message based on progress
  useEffect(() => {
    const currentMessage = [...statusMessages]
      .reverse()
      .find(status => progress >= status.threshold);
    
    if (currentMessage) {
      setCurrentStatus(currentMessage.message);
    }
  }, [progress]);

  // Get original file info
  useEffect(() => {
    if (originalFile) {
      setOriginalSize(originalFile.size);
      
      // Get image dimensions
      const img = new Image();
      img.onload = () => {
        setOriginalDimensions({ width: img.width, height: img.height });
      };
      img.src = URL.createObjectURL(originalFile);
    }
  }, [originalFile]);

  // Get enhanced image size
  useEffect(() => {
    if (enhancedImage) {
      // Estimate enhanced size from base64 or blob
      fetch(enhancedImage)
        .then(res => res.blob())
        .then(blob => {
          setEnhancedSize(blob.size);
        })
        .catch(() => {
          // If fetch fails, estimate from base64
          const base64Length = enhancedImage.length - 'data:image/png;base64,'.length;
          const estimatedSize = (base64Length * 3) / 4;
          setEnhancedSize(estimatedSize);
        });
    }
  }, [enhancedImage]);

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Calculate size reduction
  const sizeReduction = originalSize && enhancedSize 
    ? ((originalSize - enhancedSize) / originalSize * 100).toFixed(1)
    : 0;

  if (!isProcessing && !enhancedImage) {
    return null;
  }

  return (
    <div className="mt-8 w-full">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 border-b-4 border-black px-4 py-3 flex items-center gap-2">
          <div className="w-3 h-3 bg-white border-2 border-black"></div>
          <div className="w-3 h-3 bg-white border-2 border-black"></div>
          <div className="w-3 h-3 bg-white border-2 border-black"></div>
          <h2 className="text-lg font-black text-white uppercase ml-2">
            {isProcessing ? "⚙️ Processing..." : "✅ Enhancement Complete"}
          </h2>
        </div>

        <div className="p-6 space-y-6">
          {/* Status Message */}
          <div className="bg-yellow-300 border-4 border-black p-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={isProcessing ? { rotate: 360 } : {}}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="text-2xl"
              >
                {isProcessing ? "⚙️" : "✅"}
              </motion.div>
              <div className="flex-1">
                <p className="font-black text-lg text-gray-800">
                  {currentStatus}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="bg-blue-600 border-2 border-black px-4 py-2 mb-3">
              <h3 className="text-white font-black text-sm uppercase">
                📊 Progress
              </h3>
            </div>

            <div className="bg-blue-100 border-4 border-black p-6">
              {/* Progress percentage */}
              <div className="flex items-center justify-between mb-4">
                <span className="font-black text-gray-800">Enhancement Progress</span>
                <span className="bg-blue-500 border-2 border-black px-4 py-2 font-black text-white text-xl">
                  {Math.round(progress)}%
                </span>
              </div>

              {/* Retro Windows-style progress bar */}
              <div className="bg-white border-4 border-black p-2">
                <div className="relative h-8 bg-gray-200 border-2 border-gray-400">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.3 }}
                    className="h-full bg-gradient-to-r from-blue-500 to-blue-600 relative overflow-hidden"
                  >
                    {/* Retro stripes pattern */}
                    <div className="absolute inset-0 flex">
                      {Array.from({ length: 20 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex-1 border-r-2 border-blue-400"
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>

              {/* Time elapsed */}
              <div className="mt-4 flex items-center justify-between text-sm font-bold text-gray-700">
                <span>⏱️ Time Elapsed: {elapsedTime.toFixed(1)}s</span>
                {isProcessing && progress < 95 && (
                  <span>⏳ Estimated: ~{(10 - elapsedTime).toFixed(0)}s remaining</span>
                )}
              </div>
            </div>
          </div>

          {/* Statistics Grid */}
          <div>
            <div className="bg-purple-600 border-2 border-black px-4 py-2 mb-3">
              <h3 className="text-white font-black text-sm uppercase">
                📈 Image Statistics
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* File Size */}
              <div className="bg-purple-100 border-4 border-black p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">💾</span>
                  <h4 className="font-black text-sm text-gray-800 uppercase">File Size</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">Original:</span>
                    <span className="bg-pink-500 border-2 border-black px-3 py-1 font-black text-white text-sm">
                      {formatFileSize(originalSize)}
                    </span>
                  </div>
                  {enhancedSize > 0 && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-gray-600">Enhanced:</span>
                        <span className="bg-green-500 border-2 border-black px-3 py-1 font-black text-white text-sm">
                          {formatFileSize(enhancedSize)}
                        </span>
                      </div>
                      <div className="mt-2 pt-2 border-t-2 border-black">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-gray-800">Reduction:</span>
                          <span className={`border-2 border-black px-3 py-1 font-black text-white text-sm ${
                            sizeReduction > 0 ? 'bg-green-500' : 'bg-orange-500'
                          }`}>
                            {sizeReduction > 0 ? `↓ ${sizeReduction}%` : `↑ ${Math.abs(sizeReduction)}%`}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Dimensions */}
              <div className="bg-purple-100 border-4 border-black p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">📐</span>
                  <h4 className="font-black text-sm text-gray-800 uppercase">Dimensions</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">Resolution:</span>
                    <span className="bg-indigo-500 border-2 border-black px-3 py-1 font-black text-white text-sm">
                      {originalDimensions.width} × {originalDimensions.height}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">Aspect Ratio:</span>
                    <span className="bg-indigo-500 border-2 border-black px-3 py-1 font-black text-white text-sm">
                      {originalDimensions.width && originalDimensions.height
                        ? (originalDimensions.width / originalDimensions.height).toFixed(2)
                        : "N/A"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">Megapixels:</span>
                    <span className="bg-indigo-500 border-2 border-black px-3 py-1 font-black text-white text-sm">
                      {((originalDimensions.width * originalDimensions.height) / 1000000).toFixed(2)} MP
                    </span>
                  </div>
                </div>
              </div>

              {/* Processing Info */}
              <div className="bg-purple-100 border-4 border-black p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">⚡</span>
                  <h4 className="font-black text-sm text-gray-800 uppercase">Processing</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">Status:</span>
                    <span className={`border-2 border-black px-3 py-1 font-black text-white text-sm ${
                      isProcessing ? 'bg-orange-500' : 'bg-green-500'
                    }`}>
                      {isProcessing ? "Processing" : "Complete"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">Time Taken:</span>
                    <span className="bg-cyan-500 border-2 border-black px-3 py-1 font-black text-white text-sm">
                      {elapsedTime.toFixed(2)}s
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">Method:</span>
                    <span className="bg-cyan-500 border-2 border-black px-3 py-1 font-black text-white text-sm">
                      AI Enhanced
                    </span>
                  </div>
                </div>
              </div>

              {/* Quality Info */}
              <div className="bg-purple-100 border-4 border-black p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">✨</span>
                  <h4 className="font-black text-sm text-gray-800 uppercase">Quality</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">Enhancement:</span>
                    <span className="bg-yellow-500 border-2 border-black px-3 py-1 font-black text-white text-sm">
                      AI Powered
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">Output:</span>
                    <span className="bg-yellow-500 border-2 border-black px-3 py-1 font-black text-white text-sm">
                      High Quality
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-600">Format:</span>
                    <span className="bg-yellow-500 border-2 border-black px-3 py-1 font-black text-white text-sm">
                      PNG/JPEG
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Success Message (only when complete) */}
          {!isProcessing && enhancedImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-400 border-4 border-black p-6"
            >
              <div className="flex items-center gap-4">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 10 }}
                  className="text-5xl"
                >
                  🎉
                </motion.div>
                <div className="flex-1">
                  <h3 className="font-black text-xl text-gray-800 uppercase mb-2">
                    Enhancement Successful!
                  </h3>
                  <p className="text-sm font-bold text-gray-700">
                    Your image has been enhanced and is ready to download or convert to different formats.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressIndicator;
