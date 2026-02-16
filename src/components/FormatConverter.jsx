import React, { useState, useRef } from "react";

const FormatConverter = ({ sourceImage, sourceImageName = "image" }) => {
  const [selectedFormat, setSelectedFormat] = useState("png");
  const [quality, setQuality] = useState(90);
  const [resizeEnabled, setResizeEnabled] = useState(false);
  const [width, setWidth] = useState("");
  const [height, setHeight] = useState("");
  const [maintainAspectRatio, setMaintainAspectRatio] = useState(true);
  const [originalDimensions, setOriginalDimensions] = useState({ width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef(null);

  // Format options with descriptions
  const formats = [
    { value: "png", label: "PNG", emoji: "🖼️", desc: "Lossless, supports transparency" },
    { value: "jpeg", label: "JPG", emoji: "📸", desc: "Smaller size, no transparency" },
    { value: "webp", label: "WebP", emoji: "🌐", desc: "Modern, smaller size" },
    { value: "avif", label: "AVIF", emoji: "⚡", desc: "Best compression, cutting-edge" },
  ];

  // Preset dimension options
  const presets = [
    { name: "Instagram Square", width: 1080, height: 1080 },
    { name: "Instagram Portrait", width: 1080, height: 1350 },
    { name: "Twitter Post", width: 1200, height: 675 },
    { name: "Facebook Cover", width: 820, height: 312 },
    { name: "YouTube Thumbnail", width: 1280, height: 720 },
    { name: "HD (1080p)", width: 1920, height: 1080 },
    { name: "4K", width: 3840, height: 2160 },
  ];

  // Load image and get original dimensions
  const loadImageDimensions = () => {
    if (!sourceImage) return;
    
    const img = new Image();
    img.onload = () => {
      setOriginalDimensions({ width: img.width, height: img.height });
      setWidth(img.width.toString());
      setHeight(img.height.toString());
    };
    img.src = sourceImage;
  };

  // Load dimensions when component mounts or image changes
  React.useEffect(() => {
    loadImageDimensions();
  }, [sourceImage]);

  // Handle width change with aspect ratio
  const handleWidthChange = (newWidth) => {
    setWidth(newWidth);
    if (maintainAspectRatio && originalDimensions.width > 0 && newWidth) {
      const aspectRatio = originalDimensions.height / originalDimensions.width;
      const newHeight = Math.round(parseInt(newWidth) * aspectRatio);
      setHeight(newHeight.toString());
    }
  };

  // Handle height change with aspect ratio
  const handleHeightChange = (newHeight) => {
    setHeight(newHeight);
    if (maintainAspectRatio && originalDimensions.height > 0 && newHeight) {
      const aspectRatio = originalDimensions.width / originalDimensions.height;
      const newWidth = Math.round(parseInt(newHeight) * aspectRatio);
      setWidth(newWidth.toString());
    }
  };

  // Apply preset dimensions
  const applyPreset = (preset) => {
    setWidth(preset.width.toString());
    setHeight(preset.height.toString());
    setResizeEnabled(true);
  };

  // Convert and download image
  const handleConvert = async () => {
    if (!sourceImage) return;

    setIsProcessing(true);

    try {
      // Create image element
      const img = new Image();
      img.crossOrigin = "anonymous";
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = sourceImage;
      });

      // Create canvas
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set canvas dimensions
      if (resizeEnabled && width && height) {
        canvas.width = parseInt(width);
        canvas.height = parseInt(height);
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      // Draw image on canvas
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Convert to blob with specified format and quality
      const mimeType = selectedFormat === "jpeg" ? "image/jpeg" : 
                       selectedFormat === "png" ? "image/png" :
                       selectedFormat === "webp" ? "image/webp" :
                       "image/avif";

      const qualityValue = selectedFormat === "png" ? 1 : quality / 100;

      canvas.toBlob(
        (blob) => {
          if (blob) {
            // Create download link
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            const fileName = `${sourceImageName.replace(/\.[^/.]+$/, "")}_converted.${selectedFormat === "jpeg" ? "jpg" : selectedFormat}`;
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            setIsProcessing(false);
          }
        },
        mimeType,
        qualityValue
      );
    } catch (error) {
      console.error("Conversion error:", error);
      alert("Error converting image. Please try again.");
      setIsProcessing(false);
    }
  };

  if (!sourceImage) {
    return null;
  }

  return (
    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-500 to-blue-500 border-b-4 border-black px-4 py-3 flex items-center gap-2">
        <div className="w-3 h-3 bg-white border-2 border-black"></div>
        <div className="w-3 h-3 bg-white border-2 border-black"></div>
        <div className="w-3 h-3 bg-white border-2 border-black"></div>
        <h2 className="text-lg font-black text-white uppercase ml-2">
          🔄 Format Converter & Resizer
        </h2>
      </div>

      <div className="p-6 space-y-6">
        {/* Format Selection */}
        <div>
          <div className="bg-cyan-600 border-2 border-black px-4 py-2 mb-4">
            <h3 className="text-white font-black text-sm uppercase">📁 Output Format</h3>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {formats.map((format) => (
              <button
                key={format.value}
                onClick={() => setSelectedFormat(format.value)}
                className={`border-4 border-black p-4 font-black uppercase transition-all ${
                  selectedFormat === format.value
                    ? "bg-cyan-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] translate-x-0 translate-y-0"
                    : "bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                }`}
              >
                <div className="text-3xl mb-2">{format.emoji}</div>
                <div className="text-sm mb-1">{format.label}</div>
                <div className="text-xs font-normal normal-case text-gray-700">
                  {format.desc}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quality Slider (not for PNG) */}
        {selectedFormat !== "png" && (
          <div>
            <div className="bg-orange-600 border-2 border-black px-4 py-2 mb-4">
              <h3 className="text-white font-black text-sm uppercase">⚙️ Quality Settings</h3>
            </div>
            
            <div className="bg-orange-100 border-4 border-black p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="font-black text-gray-800">Compression Quality</span>
                <span className="bg-orange-500 border-2 border-black px-4 py-2 font-black text-white text-xl">
                  {quality}%
                </span>
              </div>
              
              <input
                type="range"
                min="10"
                max="100"
                value={quality}
                onChange={(e) => setQuality(parseInt(e.target.value))}
                className="w-full h-4 border-2 border-black cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #f97316 0%, #f97316 ${quality}%, #fff ${quality}%, #fff 100%)`,
                }}
              />
              
              <div className="flex justify-between mt-2 text-xs font-bold text-gray-600">
                <span>Lower Size</span>
                <span>Higher Quality</span>
              </div>
              
              <div className="mt-4 bg-yellow-300 border-2 border-black p-3">
                <p className="text-xs font-bold text-gray-800">
                  💡 <strong>Tip:</strong> Lower quality = smaller file size. 
                  {quality >= 90 ? " Excellent quality for printing." : 
                   quality >= 70 ? " Good balance for web use." : 
                   " Smaller size, may show artifacts."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Resize Options */}
        <div>
          <div className="bg-purple-600 border-2 border-black px-4 py-2 mb-4 flex items-center justify-between">
            <h3 className="text-white font-black text-sm uppercase">📐 Resize Image</h3>
            <button
              onClick={() => setResizeEnabled(!resizeEnabled)}
              className={`px-4 py-1 border-2 border-black font-black text-xs uppercase transition-all ${
                resizeEnabled
                  ? "bg-green-400 text-black"
                  : "bg-white text-gray-700"
              }`}
            >
              {resizeEnabled ? "✓ Enabled" : "Disabled"}
            </button>
          </div>

          {resizeEnabled && (
            <div className="space-y-4">
              {/* Original Dimensions Info */}
              <div className="bg-purple-100 border-4 border-black p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-black text-sm text-gray-800">Original Size:</span>
                  <span className="bg-purple-500 border-2 border-black px-3 py-1 font-black text-white text-sm">
                    {originalDimensions.width} × {originalDimensions.height}
                  </span>
                </div>
              </div>

              {/* Dimension Inputs */}
              <div className="bg-purple-100 border-4 border-black p-6">
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block font-black text-sm text-gray-800 mb-2">
                      Width (px)
                    </label>
                    <input
                      type="number"
                      value={width}
                      onChange={(e) => handleWidthChange(e.target.value)}
                      className="w-full border-4 border-black px-4 py-3 font-bold text-lg focus:outline-none focus:ring-4 focus:ring-purple-400"
                      placeholder="Width"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-sm text-gray-800 mb-2">
                      Height (px)
                    </label>
                    <input
                      type="number"
                      value={height}
                      onChange={(e) => handleHeightChange(e.target.value)}
                      className="w-full border-4 border-black px-4 py-3 font-bold text-lg focus:outline-none focus:ring-4 focus:ring-purple-400"
                      placeholder="Height"
                    />
                  </div>
                </div>

                {/* Aspect Ratio Toggle */}
                <button
                  onClick={() => setMaintainAspectRatio(!maintainAspectRatio)}
                  className={`w-full border-4 border-black px-4 py-3 font-black uppercase transition-all ${
                    maintainAspectRatio
                      ? "bg-purple-400 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]"
                  }`}
                >
                  {maintainAspectRatio ? "🔗 Aspect Ratio Locked" : "🔓 Aspect Ratio Unlocked"}
                </button>
              </div>

              {/* Preset Dimensions */}
              <div>
                <div className="bg-pink-500 border-2 border-black px-4 py-2 mb-3">
                  <h4 className="text-white font-black text-xs uppercase">⚡ Quick Presets</h4>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {presets.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className="bg-white hover:bg-pink-200 border-2 border-black px-3 py-2 font-bold text-xs uppercase transition-all shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                    >
                      <div className="font-black">{preset.name}</div>
                      <div className="text-gray-600 text-[10px]">
                        {preset.width}×{preset.height}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Convert Button */}
        <div className="pt-4">
          <button
            onClick={handleConvert}
            disabled={isProcessing}
            className={`w-full border-4 border-black px-8 py-6 font-black text-white uppercase text-xl tracking-wide transition-all ${
              isProcessing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[4px] hover:translate-y-[4px] active:translate-x-[8px] active:translate-y-[8px]"
            }`}
          >
            {isProcessing ? (
              <span className="flex items-center justify-center gap-3">
                <span className="animate-spin">⚙️</span>
                Processing...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-3">
                <span>⬇️</span>
                Convert & Download {selectedFormat.toUpperCase()}
              </span>
            )}
          </button>
        </div>

        {/* Info Box */}
        <div className="bg-yellow-300 border-4 border-black p-4">
          <div className="flex items-start gap-3">
            <div className="text-2xl">ℹ️</div>
            <div className="flex-1">
              <p className="font-black text-sm uppercase text-gray-800 mb-2">
                Current Settings:
              </p>
              <ul className="text-xs font-bold text-gray-700 space-y-1">
                <li>• Format: <strong>{selectedFormat.toUpperCase()}</strong></li>
                {selectedFormat !== "png" && (
                  <li>• Quality: <strong>{quality}%</strong></li>
                )}
                {resizeEnabled && width && height && (
                  <li>• Dimensions: <strong>{width} × {height} pixels</strong></li>
                )}
                {!resizeEnabled && (
                  <li>• Dimensions: <strong>Original ({originalDimensions.width} × {originalDimensions.height})</strong></li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FormatConverter;
