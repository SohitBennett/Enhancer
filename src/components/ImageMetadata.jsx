import React, { useState, useEffect } from "react";

const ImageMetadata = ({ imageFile, imageUrl }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [metadata, setMetadata] = useState({
    fileName: "",
    fileSize: 0,
    fileType: "",
    lastModified: null,
    dimensions: { width: 0, height: 0 },
    aspectRatio: "",
    megapixels: 0,
    colorDepth: 24,
  });

  useEffect(() => {
    if (imageFile && imageUrl) {
      loadMetadata();
    }
  }, [imageFile, imageUrl]);

  const loadMetadata = async () => {
    // Load basic file metadata
    const img = new Image();
    img.onload = () => {
      const width = img.width;
      const height = img.height;
      const aspectRatio = (width / height).toFixed(2);
      const megapixels = ((width * height) / 1000000).toFixed(2);

      setMetadata({
        fileName: imageFile.name,
        fileSize: imageFile.size,
        fileType: imageFile.type,
        lastModified: new Date(imageFile.lastModified),
        dimensions: { width, height },
        aspectRatio,
        megapixels,
        colorDepth: 24, // Default assumption
      });
    };
    img.src = imageUrl;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  if (!imageFile) {
    return null;
  }

  return (
    <div className="mt-8 w-full">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {/* Header with Toggle */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full bg-gradient-to-r from-orange-500 to-red-500 border-b-4 border-black px-4 py-3 flex items-center justify-between hover:from-orange-600 hover:to-red-600 transition-colors"
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white border-2 border-black"></div>
            <div className="w-3 h-3 bg-white border-2 border-black"></div>
            <div className="w-3 h-3 bg-white border-2 border-black"></div>
            <h2 className="text-lg font-black text-white uppercase ml-2">
              📋 Image Metadata
            </h2>
          </div>
          <div className="text-white font-black text-2xl">
            {isExpanded ? "▼" : "▶"}
          </div>
        </button>

        {/* Expandable Content */}
        {isExpanded && (
          <div className="p-6 space-y-6">
            {/* File Information */}
            <div>
              <div className="bg-orange-600 border-2 border-black px-4 py-2 mb-3">
                <h3 className="text-white font-black text-sm uppercase">
                  📁 File Information
                </h3>
              </div>

              <div className="bg-orange-100 border-4 border-black p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">File Name:</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-orange-500 border-2 border-black px-3 py-1 font-black text-white text-sm max-w-xs truncate">
                      {metadata.fileName}
                    </span>
                    <button
                      onClick={() => copyToClipboard(metadata.fileName)}
                      className="bg-gray-700 hover:bg-gray-800 border-2 border-black px-2 py-1 font-black text-white text-xs"
                      title="Copy to clipboard"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">File Size:</span>
                  <span className="bg-orange-500 border-2 border-black px-3 py-1 font-black text-white text-sm">
                    {formatFileSize(metadata.fileSize)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">File Type:</span>
                  <span className="bg-orange-500 border-2 border-black px-3 py-1 font-black text-white text-sm">
                    {metadata.fileType || "Unknown"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Last Modified:</span>
                  <span className="bg-orange-500 border-2 border-black px-3 py-1 font-black text-white text-sm">
                    {formatDate(metadata.lastModified)}
                  </span>
                </div>
              </div>
            </div>

            {/* Image Dimensions */}
            <div>
              <div className="bg-indigo-600 border-2 border-black px-4 py-2 mb-3">
                <h3 className="text-white font-black text-sm uppercase">
                  📐 Dimensions & Resolution
                </h3>
              </div>

              <div className="bg-indigo-100 border-4 border-black p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Resolution:</span>
                  <div className="flex items-center gap-2">
                    <span className="bg-indigo-500 border-2 border-black px-3 py-1 font-black text-white text-sm">
                      {metadata.dimensions.width} × {metadata.dimensions.height}
                    </span>
                    <button
                      onClick={() =>
                        copyToClipboard(
                          `${metadata.dimensions.width}×${metadata.dimensions.height}`
                        )
                      }
                      className="bg-gray-700 hover:bg-gray-800 border-2 border-black px-2 py-1 font-black text-white text-xs"
                      title="Copy to clipboard"
                    >
                      📋
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Aspect Ratio:</span>
                  <span className="bg-indigo-500 border-2 border-black px-3 py-1 font-black text-white text-sm">
                    {metadata.aspectRatio}:1
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Megapixels:</span>
                  <span className="bg-indigo-500 border-2 border-black px-3 py-1 font-black text-white text-sm">
                    {metadata.megapixels} MP
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Orientation:</span>
                  <span className="bg-indigo-500 border-2 border-black px-3 py-1 font-black text-white text-sm">
                    {metadata.dimensions.width > metadata.dimensions.height
                      ? "Landscape"
                      : metadata.dimensions.width < metadata.dimensions.height
                      ? "Portrait"
                      : "Square"}
                  </span>
                </div>
              </div>
            </div>

            {/* Technical Details */}
            <div>
              <div className="bg-teal-600 border-2 border-black px-4 py-2 mb-3">
                <h3 className="text-white font-black text-sm uppercase">
                  🔧 Technical Details
                </h3>
              </div>

              <div className="bg-teal-100 border-4 border-black p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Format:</span>
                  <span className="bg-teal-500 border-2 border-black px-3 py-1 font-black text-white text-sm">
                    {metadata.fileType.split("/")[1]?.toUpperCase() || "Unknown"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Color Depth:</span>
                  <span className="bg-teal-500 border-2 border-black px-3 py-1 font-black text-white text-sm">
                    {metadata.colorDepth} bits
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Color Space:</span>
                  <span className="bg-teal-500 border-2 border-black px-3 py-1 font-black text-white text-sm">
                    sRGB
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-700">Compression:</span>
                  <span className="bg-teal-500 border-2 border-black px-3 py-1 font-black text-white text-sm">
                    {metadata.fileType.includes("jpeg") ? "Lossy" : "Lossless"}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Note */}
            <div className="bg-yellow-300 border-4 border-black p-4">
              <div className="flex items-start gap-3">
                <div className="text-2xl">💡</div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-gray-800">
                    <strong>Note:</strong> This displays basic file metadata. EXIF data
                    (camera settings, GPS, etc.) may be stripped during upload for
                    privacy. Click the 📋 icon to copy values to clipboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageMetadata;
