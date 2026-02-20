import React, { useState, useRef, useCallback } from "react";

// Default values for every adjustment
const DEFAULTS = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  sharpness: 0,   // simulated via contrast boost
  blur: 0,
  hueRotate: 0,
  sepia: 0,
  grayscale: 0,
  invert: 0,
};

// Quick filter presets
const PRESETS = [
  { name: "Original",   values: { ...DEFAULTS } },
  { name: "Vivid",      values: { ...DEFAULTS, brightness: 110, contrast: 115, saturation: 150 } },
  { name: "Matte",      values: { ...DEFAULTS, brightness: 105, contrast: 85, saturation: 80 } },
  { name: "B&W",        values: { ...DEFAULTS, grayscale: 100, contrast: 110 } },
  { name: "Sepia",      values: { ...DEFAULTS, sepia: 90, brightness: 105 } },
  { name: "Cool",       values: { ...DEFAULTS, hueRotate: 200, saturation: 120, brightness: 105 } },
  { name: "Warm",       values: { ...DEFAULTS, hueRotate: 340, saturation: 130, brightness: 105 } },
  { name: "Fade",       values: { ...DEFAULTS, brightness: 115, contrast: 80, saturation: 70 } },
  { name: "Dramatic",   values: { ...DEFAULTS, brightness: 90, contrast: 140, saturation: 110 } },
  { name: "Dreamy",     values: { ...DEFAULTS, brightness: 115, blur: 0.5, saturation: 130, hueRotate: 15 } },
];

// ── Slider row ───────────────────────────────────────────────────────────────
const AdjustSlider = ({ label, emoji, value, min, max, step = 1, unit = "", accentClass, onChange }) => (
  <div className="flex flex-col gap-1">
    <div className="flex items-center justify-between">
      <span className="text-xs font-black text-gray-700 uppercase">
        {emoji} {label}
      </span>
      <span className={`${accentClass} border-2 border-black px-2 py-0.5 font-black text-white text-xs min-w-14 text-center`}>
        {value}{unit}
      </span>
    </div>
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full h-3 border-2 border-black cursor-pointer accent-black"
      style={{ accentColor: "#000" }}
    />
    <div className="flex justify-between text-xs text-gray-400 font-bold">
      <span>{min}{unit}</span>
      <span>{max}{unit}</span>
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
const ManualAdjustments = ({ sourceImage, sourceImageName = "image" }) => {
  const [adj, setAdj] = useState({ ...DEFAULTS });
  const [isProcessing, setIsProcessing] = useState(false);
  const [activePreset, setActivePreset] = useState("Original");
  const imgRef = useRef(null);

  // Build CSS filter string from state
  const filterString = `
    brightness(${adj.brightness}%)
    contrast(${adj.contrast}%)
    saturate(${adj.saturation}%)
    blur(${adj.blur}px)
    hue-rotate(${adj.hueRotate}deg)
    sepia(${adj.sepia}%)
    grayscale(${adj.grayscale}%)
    invert(${adj.invert}%)
  `.trim();

  const set = useCallback((key) => (val) => {
    setAdj((prev) => ({ ...prev, [key]: val }));
    setActivePreset("");
  }, []);

  const applyPreset = (preset) => {
    setAdj({ ...preset.values });
    setActivePreset(preset.name);
  };

  const resetAll = () => {
    setAdj({ ...DEFAULTS });
    setActivePreset("Original");
  };

  const handleDownload = async () => {
    if (!sourceImage) return;
    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = sourceImage;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");

      // Apply CSS-equivalent filters via canvas filter
      ctx.filter = filterString;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        const base = sourceImageName.replace(/\.[^/.]+$/, "");
        link.href = url;
        link.download = `${base}_adjusted.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        setIsProcessing(false);
      }, "image/png");
    } catch (err) {
      console.error("Download error:", err);
      alert("Could not apply adjustments for download. Try another browser.");
      setIsProcessing(false);
    }
  };

  if (!sourceImage) return null;

  const isModified = JSON.stringify(adj) !== JSON.stringify(DEFAULTS);

  return (
    <div className="mt-8 w-full">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-rose-500 to-pink-600 border-b-4 border-black px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white border-2 border-black" />
            <div className="w-3 h-3 bg-white border-2 border-black" />
            <div className="w-3 h-3 bg-white border-2 border-black" />
            <h2 className="text-lg font-black text-white uppercase ml-2">
              🎨 Manual Adjustments
            </h2>
          </div>
          {isModified && (
            <button
              onClick={resetAll}
              className="bg-white hover:bg-gray-100 border-2 border-black px-3 py-1 font-black text-rose-600 text-xs uppercase transition-colors"
            >
              ↩ Reset
            </button>
          )}
        </div>

        <div className="p-6 space-y-6">

          {/* ── Live Preview ── */}
          <div>
            <div className="bg-rose-600 border-2 border-black px-4 py-2 mb-3">
              <h3 className="text-white font-black text-sm uppercase">👁️ Live Preview</h3>
            </div>
            <div className="border-4 border-black overflow-hidden bg-gray-100 flex items-center justify-center" style={{ minHeight: 240 }}>
              <img
                ref={imgRef}
                src={sourceImage}
                alt="Adjusted preview"
                className="max-w-full max-h-80 object-contain transition-all duration-200"
                style={{ filter: filterString }}
              />
            </div>
            {isModified && (
              <p className="mt-2 text-xs font-bold text-gray-500 text-center">
                ✏️ Preview reflects your current adjustments
              </p>
            )}
          </div>

          {/* ── Preset Filters ── */}
          <div>
            <div className="bg-fuchsia-600 border-2 border-black px-4 py-2 mb-3">
              <h3 className="text-white font-black text-sm uppercase">⚡ Quick Presets</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  onClick={() => applyPreset(p)}
                  className={`border-2 border-black px-3 py-2 font-black text-xs uppercase transition-all
                    ${activePreset === p.name
                      ? "bg-fuchsia-500 text-white shadow-none translate-x-[2px] translate-y-[2px]"
                      : "bg-fuchsia-100 text-fuchsia-800 hover:bg-fuchsia-200 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[1px] hover:translate-y-[1px]"
                    }`}
                >
                  {p.name}
                </button>
              ))}
            </div>
          </div>

          {/* ── Sliders ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Light & Tone */}
            <div className="bg-yellow-50 border-4 border-black p-4 space-y-5">
              <div className="bg-yellow-400 border-2 border-black px-3 py-1 -mx-4 -mt-4 mb-4">
                <h4 className="font-black text-sm text-gray-800 uppercase">☀️ Light & Tone</h4>
              </div>
              <AdjustSlider
                label="Brightness" emoji="💡" value={adj.brightness}
                min={0} max={200} unit="%" accentClass="bg-yellow-500"
                onChange={set("brightness")}
              />
              <AdjustSlider
                label="Contrast" emoji="⚫" value={adj.contrast}
                min={0} max={200} unit="%" accentClass="bg-gray-700"
                onChange={set("contrast")}
              />
            </div>

            {/* Color */}
            <div className="bg-pink-50 border-4 border-black p-4 space-y-5">
              <div className="bg-pink-400 border-2 border-black px-3 py-1 -mx-4 -mt-4 mb-4">
                <h4 className="font-black text-sm text-gray-800 uppercase">🌈 Color</h4>
              </div>
              <AdjustSlider
                label="Saturation" emoji="🎨" value={adj.saturation}
                min={0} max={300} unit="%" accentClass="bg-pink-500"
                onChange={set("saturation")}
              />
              <AdjustSlider
                label="Hue Rotate" emoji="🔄" value={adj.hueRotate}
                min={0} max={360} unit="°" accentClass="bg-purple-500"
                onChange={set("hueRotate")}
              />
            </div>

            {/* Effects */}
            <div className="bg-blue-50 border-4 border-black p-4 space-y-5">
              <div className="bg-blue-400 border-2 border-black px-3 py-1 -mx-4 -mt-4 mb-4">
                <h4 className="font-black text-sm text-gray-800 uppercase">✨ Effects</h4>
              </div>
              <AdjustSlider
                label="Blur" emoji="🌫️" value={adj.blur}
                min={0} max={10} step={0.1} unit="px" accentClass="bg-blue-500"
                onChange={set("blur")}
              />
              <AdjustSlider
                label="Invert" emoji="🔃" value={adj.invert}
                min={0} max={100} unit="%" accentClass="bg-blue-700"
                onChange={set("invert")}
              />
            </div>

            {/* Film */}
            <div className="bg-amber-50 border-4 border-black p-4 space-y-5">
              <div className="bg-amber-400 border-2 border-black px-3 py-1 -mx-4 -mt-4 mb-4">
                <h4 className="font-black text-sm text-gray-800 uppercase">🎞️ Film</h4>
              </div>
              <AdjustSlider
                label="Sepia" emoji="📜" value={adj.sepia}
                min={0} max={100} unit="%" accentClass="bg-amber-600"
                onChange={set("sepia")}
              />
              <AdjustSlider
                label="Grayscale" emoji="⬛" value={adj.grayscale}
                min={0} max={100} unit="%" accentClass="bg-gray-600"
                onChange={set("grayscale")}
              />
            </div>
          </div>

          {/* ── Current Settings Summary ── */}
          {isModified && (
            <div className="bg-yellow-300 border-4 border-black p-4">
              <p className="text-xs font-black text-gray-800 uppercase mb-1">📋 Active Adjustments</p>
              <p className="text-xs font-bold text-gray-700 break-all font-mono">
                {Object.entries(adj)
                  .filter(([k, v]) => v !== DEFAULTS[k])
                  .map(([k, v]) => `${k}: ${v}`)
                  .join(" • ")}
              </p>
            </div>
          )}

          {/* ── Download Button ── */}
          <button
            onClick={handleDownload}
            disabled={isProcessing}
            className={`w-full border-4 border-black font-black text-lg uppercase py-4 flex items-center justify-center gap-3 transition-all
              ${isProcessing
                ? "bg-gray-400 text-gray-600 cursor-not-allowed shadow-none"
                : "bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[3px] hover:translate-y-[3px]"
              }`}
          >
            {isProcessing ? (
              <><span className="animate-spin text-2xl">⚙️</span> Applying filters...</>
            ) : (
              <><span className="text-2xl">⬇️</span> Download Adjusted Image</>
            )}
          </button>

        </div>
      </div>
    </div>
  );
};

export default ManualAdjustments;
