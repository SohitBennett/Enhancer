import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const GALLERY_KEY = "enhancer_gallery";
const MAX_GALLERY_ITEMS = 12;

// Utility: load gallery from localStorage
const loadGallery = () => {
  try {
    const stored = localStorage.getItem(GALLERY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
};

// Utility: save gallery to localStorage
const saveGallery = (items) => {
  try {
    localStorage.setItem(GALLERY_KEY, JSON.stringify(items));
  } catch {
    // localStorage might be full; silently fail
  }
};

// ─── Main Component ───────────────────────────────────────────────────────────
const ImageGallery = ({ newEnhancedImage, newFileName }) => {
  const [gallery, setGallery] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [justAdded, setJustAdded] = useState(null);

  // Load gallery from localStorage on mount
  useEffect(() => {
    setGallery(loadGallery());
  }, []);

  // When a new enhanced image arrives, add it to the gallery
  useEffect(() => {
    if (!newEnhancedImage) return;

    setGallery((prev) => {
      // Avoid duplicates (same image URL in the same session)
      if (prev.length > 0 && prev[0].imageUrl === newEnhancedImage) return prev;

      const newItem = {
        id: Date.now(),
        imageUrl: newEnhancedImage,
        fileName: newFileName || "enhanced-image",
        enhancedAt: new Date().toISOString(),
      };

      const updated = [newItem, ...prev].slice(0, MAX_GALLERY_ITEMS);
      saveGallery(updated);
      setJustAdded(newItem.id);
      setTimeout(() => setJustAdded(null), 2000);
      return updated;
    });
  }, [newEnhancedImage]);

  const handleDownload = (item) => {
    const link = document.createElement("a");
    link.href = item.imageUrl;
    const baseName = item.fileName.replace(/\.[^/.]+$/, "");
    link.download = `${baseName}_enhanced.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = (id) => {
    setGallery((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      saveGallery(updated);
      return updated;
    });
    if (selectedItem?.id === id) setSelectedItem(null);
  };

  const handleClearAll = () => {
    if (!window.confirm("Clear all gallery history? This cannot be undone.")) return;
    localStorage.removeItem(GALLERY_KEY);
    setGallery([]);
    setSelectedItem(null);
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString() + " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  if (gallery.length === 0) return null;

  return (
    <div className="mt-8 w-full">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-violet-600 to-fuchsia-600 border-b-4 border-black px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-white border-2 border-black" />
            <div className="w-3 h-3 bg-white border-2 border-black" />
            <div className="w-3 h-3 bg-white border-2 border-black" />
            <h2 className="text-lg font-black text-white uppercase ml-2">
              🖼️ Enhancement Gallery
            </h2>
            <span className="bg-white border-2 border-black px-2 py-0.5 text-xs font-black text-violet-700">
              {gallery.length}/{MAX_GALLERY_ITEMS}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleClearAll}
              className="bg-red-500 hover:bg-red-600 border-2 border-black px-3 py-1 font-black text-white text-xs uppercase transition-colors"
            >
              🗑️ Clear All
            </button>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="bg-white hover:bg-gray-100 border-2 border-black px-3 py-1 font-black text-violet-700 text-lg transition-colors"
            >
              {isExpanded ? "▼" : "▶"}
            </button>
          </div>
        </div>

        {/* ── Body ── */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="p-6">
                {/* ── Thumbnail Grid ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {gallery.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{
                        scale: 1,
                        opacity: 1,
                        outline:
                          justAdded === item.id
                            ? "3px solid #22c55e"
                            : "3px solid transparent",
                      }}
                      exit={{ scale: 0.8, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`relative border-4 border-black cursor-pointer group
                        ${selectedItem?.id === item.id
                          ? "shadow-[4px_4px_0px_0px_rgba(139,92,246,1)]"
                          : "shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"}
                        transition-shadow`}
                      onClick={() => setSelectedItem(item.id === selectedItem?.id ? null : item)}
                    >
                      {/* Thumbnail image */}
                      <div className="aspect-square overflow-hidden bg-gray-100">
                        <img
                          src={item.imageUrl}
                          alt={item.fileName}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      {/* "NEW" badge */}
                      {justAdded === item.id && (
                        <div className="absolute top-1 left-1 bg-green-500 border-2 border-black px-1 py-0.5 text-white text-xs font-black">
                          NEW
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 p-1">
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDownload(item); }}
                          className="w-full bg-cyan-400 border-2 border-black py-1 text-xs font-black text-black hover:bg-cyan-300"
                        >
                          ⬇ Save
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDelete(item.id); }}
                          className="w-full bg-red-500 border-2 border-black py-1 text-xs font-black text-white hover:bg-red-400"
                        >
                          ✕ Delete
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* ── Selected Item Detail Panel ── */}
                <AnimatePresence>
                  {selectedItem && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.2 }}
                      className="mt-6 border-4 border-black bg-violet-50"
                    >
                      {/* Panel header */}
                      <div className="bg-violet-600 border-b-4 border-black px-4 py-2 flex items-center justify-between">
                        <span className="font-black text-white text-sm uppercase">
                          🔍 Preview — {selectedItem.fileName}
                        </span>
                        <button
                          onClick={() => setSelectedItem(null)}
                          className="bg-white border-2 border-black w-6 h-6 font-black text-violet-700 text-xs flex items-center justify-center hover:bg-gray-100"
                        >
                          ✕
                        </button>
                      </div>

                      <div className="p-4 flex flex-col md:flex-row gap-6">
                        {/* Large preview */}
                        <div className="flex-1 border-4 border-black overflow-hidden bg-gray-100 max-h-72 flex items-center justify-center">
                          <img
                            src={selectedItem.imageUrl}
                            alt={selectedItem.fileName}
                            className="max-w-full max-h-72 object-contain"
                          />
                        </div>

                        {/* Info + actions */}
                        <div className="flex flex-col gap-3 min-w-48">
                          <div className="bg-white border-4 border-black p-4 space-y-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-black text-gray-500 uppercase">File Name</span>
                              <span className="font-bold text-sm text-gray-800 break-all">{selectedItem.fileName}</span>
                            </div>
                            <div className="border-t-2 border-gray-200 pt-2 flex flex-col gap-1">
                              <span className="text-xs font-black text-gray-500 uppercase">Enhanced At</span>
                              <span className="font-bold text-sm text-gray-800">{formatDate(selectedItem.enhancedAt)}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDownload(selectedItem)}
                            className="bg-cyan-400 hover:bg-cyan-300 border-4 border-black px-4 py-3 font-black text-black text-sm uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                          >
                            ⬇️ Download
                          </button>

                          <button
                            onClick={() => handleDelete(selectedItem.id)}
                            className="bg-red-500 hover:bg-red-600 border-4 border-black px-4 py-3 font-black text-white text-sm uppercase shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                          >
                            🗑️ Remove
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Footer note ── */}
                <div className="mt-4 bg-yellow-300 border-4 border-black p-3 flex items-center gap-3">
                  <span className="text-lg">💡</span>
                  <p className="text-xs font-bold text-gray-800">
                    Gallery saves the last <strong>{MAX_GALLERY_ITEMS} enhanced images</strong> in your browser. Hover a thumbnail for quick actions. Click to preview.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ImageGallery;
