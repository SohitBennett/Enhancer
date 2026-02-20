import React, { useState, useRef, useCallback } from "react";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif", "image/gif", "image/bmp"];
const MAX_SIZE_MB = 20;

const ImageUpload = ({ UploadImageHandler, fileInputRef: externalRef }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragError, setDragError]   = useState("");
  const [preview, setPreview]       = useState(null);
  const [previewName, setPreviewName] = useState("");
  const [previewSize, setPreviewSize] = useState(0);
  const internalRef = useRef(null);
  const inputRef = externalRef || internalRef; // prefer the forwarded ref
  const dragCounter = useRef(0); // track nested dragenter/leave

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  const processFile = useCallback((file) => {
    setDragError("");

    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setDragError(`❌ Unsupported format: ${file.type || "unknown"}. Use JPG, PNG, WebP, AVIF, GIF or BMP.`);
      return;
    }

    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setDragError(`❌ File too large (${formatSize(file.size)}). Maximum is ${MAX_SIZE_MB} MB.`);
      return;
    }

    // Show thumbnail preview
    const url = URL.createObjectURL(file);
    setPreview(url);
    setPreviewName(file.name);
    setPreviewSize(file.size);

    UploadImageHandler(file);
  }, [UploadImageHandler]);

  // ── Drag handlers ────────────────────────────────────────────────────────
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = "copy";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    dragCounter.current = 0;
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleInputChange = (e) => {
    processFile(e.target.files[0]);
    // reset input so the same file can be re-selected
    e.target.value = "";
  };

  const handleClick = () => inputRef.current?.click();

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 w-full">
      {/* Header */}
      <div className="bg-purple-600 border-2 border-black px-4 py-2 mb-6 flex items-center justify-between">
        <h3 className="text-white font-black text-lg uppercase">📁 File Upload</h3>
        <div className="flex gap-1">
          {["JPG","PNG","WebP","AVIF","GIF"].map(f => (
            <span key={f} className="bg-purple-300 border border-black px-2 py-0.5 text-xs font-black text-purple-900">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onClick={handleClick}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`
          w-full cursor-pointer border-4 border-dashed border-black p-12 text-center
          transition-all duration-150 select-none
          ${isDragging
            ? "bg-gradient-to-br from-yellow-300 to-amber-400 scale-[1.01] shadow-[0_0_0_4px_rgba(0,0,0,0.15)]"
            : "bg-gradient-to-br from-cyan-300 to-blue-400 hover:from-cyan-400 hover:to-blue-500"
          }
        `}
      >
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={handleInputChange}
          accept={ACCEPTED_TYPES.join(",")}
        />

        <div className="flex flex-col items-center gap-4 pointer-events-none">
          <div className="text-6xl transition-transform duration-150"
            style={{ transform: isDragging ? "scale(1.2) rotate(-5deg)" : "scale(1)" }}>
            {isDragging ? "📂" : "🖼️"}
          </div>

          <span className="text-2xl font-black text-black uppercase tracking-wide">
            {isDragging ? "Drop it here!" : "Click or Drag & Drop"}
          </span>

          <span className="text-sm font-bold text-gray-800 bg-yellow-300 border-2 border-black px-4 py-2">
            {isDragging
              ? "✨ Release to upload your image"
              : `Supports JPG, PNG, WebP, AVIF, GIF · Max ${MAX_SIZE_MB} MB`}
          </span>
        </div>
      </div>

      {/* Error message */}
      {dragError && (
        <div className="mt-4 bg-red-500 border-4 border-black px-4 py-3 flex items-center gap-3">
          <span className="text-white font-black text-sm">{dragError}</span>
          <button
            onClick={() => setDragError("")}
            className="ml-auto bg-white border-2 border-black px-2 py-0.5 font-black text-red-600 text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Thumbnail preview (shows right after file picked, before enhancement finishes) */}
      {preview && !dragError && (
        <div className="mt-4 border-4 border-black bg-gray-50 flex items-center gap-4 p-3">
          <img
            src={preview}
            alt="preview"
            className="w-16 h-16 object-cover border-2 border-black flex-shrink-0"
          />
          <div className="flex flex-col gap-1 min-w-0">
            <span className="font-black text-sm text-gray-800 truncate">{previewName}</span>
            <span className="text-xs font-bold text-gray-500">{formatSize(previewSize)}</span>
          </div>
          <span className="ml-auto bg-green-500 border-2 border-black px-2 py-1 text-white font-black text-xs whitespace-nowrap">
            ✅ Uploaded
          </span>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;

