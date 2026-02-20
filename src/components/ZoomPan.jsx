import React, { useState, useRef, useCallback, useEffect } from "react";

const MIN_ZOOM = 1;
const MAX_ZOOM = 8;
const ZOOM_STEP = 0.5;

const ZoomPan = ({ imageUrl, altText = "Image" }) => {
  const [zoom, setZoom]       = useState(1);
  const [offset, setOffset]   = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const containerRef = useRef(null);
  const lastPointer  = useRef(null);

  // Reset pan when zoom goes back to 1
  useEffect(() => {
    if (zoom === 1) setOffset({ x: 0, y: 0 });
  }, [zoom]);

  const clampZoom = (z) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z));

  const zoomIn  = () => setZoom((z) => clampZoom(+(z + ZOOM_STEP).toFixed(1)));
  const zoomOut = () => setZoom((z) => clampZoom(+(z - ZOOM_STEP).toFixed(1)));
  const reset   = () => { setZoom(1); setOffset({ x: 0, y: 0 }); };

  // ── Wheel zoom ──────────────────────────────────────────────────────────
  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
    setZoom((z) => clampZoom(+(z + delta).toFixed(1)));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    el.addEventListener("wheel", handleWheel, { passive: false });
    return () => el.removeEventListener("wheel", handleWheel);
  }, [handleWheel]);

  // ── Pointer drag (mouse + touch) ────────────────────────────────────────
  const handlePointerDown = (e) => {
    if (zoom <= 1) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setIsPanning(true);
    lastPointer.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerMove = (e) => {
    if (!isPanning || !lastPointer.current) return;
    const dx = e.clientX - lastPointer.current.x;
    const dy = e.clientY - lastPointer.current.y;
    lastPointer.current = { x: e.clientX, y: e.clientY };
    setOffset((prev) => ({ x: prev.x + dx, y: prev.y + dy }));
  };

  const handlePointerUp = () => {
    setIsPanning(false);
    lastPointer.current = null;
  };

  // ── Double-click quick zoom ─────────────────────────────────────────────
  const handleDoubleClick = () => {
    if (zoom > 1) reset();
    else setZoom(2);
  };

  if (!imageUrl) return null;

  const zoomPct = Math.round(zoom * 100);

  return (
    <div className="mt-8 w-full">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">

        {/* ── Header ── */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 border-b-4 border-black px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-white border-2 border-black" />
            <div className="w-3 h-3 bg-white border-2 border-black" />
            <div className="w-3 h-3 bg-white border-2 border-black" />
            <h2 className="text-lg font-black text-white uppercase ml-2">
              🔍 Zoom & Inspect
            </h2>
          </div>
          <button
            onClick={() => { setIsExpanded(!isExpanded); reset(); }}
            className="bg-white hover:bg-gray-100 border-2 border-black px-3 py-1 font-black text-emerald-700 text-lg transition-colors"
          >
            {isExpanded ? "▼" : "▶"}
          </button>
        </div>

        {isExpanded && (
          <>
            {/* ── Toolbar ── */}
            <div className="border-b-4 border-black bg-gray-100 px-4 py-3 flex items-center gap-3 flex-wrap">
              {/* Zoom controls */}
              <div className="flex items-center gap-0">
                <button
                  onClick={zoomOut}
                  disabled={zoom <= MIN_ZOOM}
                  className="bg-white border-2 border-black w-9 h-9 font-black text-xl flex items-center justify-center
                    hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed
                    shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
                    hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                >
                  −
                </button>
                <div className="bg-emerald-500 border-y-2 border-black px-4 h-9 flex items-center font-black text-white text-sm min-w-[72px] justify-center">
                  {zoomPct}%
                </div>
                <button
                  onClick={zoomIn}
                  disabled={zoom >= MAX_ZOOM}
                  className="bg-white border-2 border-black w-9 h-9 font-black text-xl flex items-center justify-center
                    hover:bg-gray-200 disabled:opacity-30 disabled:cursor-not-allowed
                    shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
                    hover:translate-x-[1px] hover:translate-y-[1px] transition-all"
                >
                  +
                </button>
              </div>

              {/* Preset zoom buttons */}
              {[1, 2, 4, 8].map((z) => (
                <button
                  key={z}
                  onClick={() => { setZoom(z); setOffset({ x: 0, y: 0 }); }}
                  className={`border-2 border-black px-3 py-1 font-black text-sm
                    shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]
                    hover:translate-x-[1px] hover:translate-y-[1px] transition-all
                    ${zoom === z ? "bg-emerald-500 text-white" : "bg-white text-black hover:bg-gray-200"}`}
                >
                  {z}×
                </button>
              ))}

              {/* Reset */}
              <button
                onClick={reset}
                disabled={zoom === 1 && offset.x === 0 && offset.y === 0}
                className="ml-auto bg-red-500 hover:bg-red-600 border-2 border-black px-3 py-1 font-black text-white text-sm
                  disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                ↩ Reset
              </button>

              {/* Hint */}
              <span className="text-xs font-bold text-gray-500 hidden sm:block">
                {zoom > 1 ? "🖱 Drag to pan" : "Scroll or click + / − to zoom • Double-click for 2×"}
              </span>
            </div>

            {/* ── Canvas ── */}
            <div
              ref={containerRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onDoubleClick={handleDoubleClick}
              className="relative overflow-hidden bg-[repeating-conic-gradient(#e5e7eb_0%_25%,#f9fafb_0%_50%)] bg-[length:20px_20px]"
              style={{
                height: 400,
                cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "zoom-in",
                userSelect: "none",
              }}
            >
              <img
                src={imageUrl}
                alt={altText}
                draggable={false}
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: `translate(-50%, -50%) translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                  transformOrigin: "center center",
                  transition: isPanning ? "none" : "transform 0.15s ease",
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  pointerEvents: "none",
                }}
              />

              {/* Zoom badge overlay */}
              {zoom > 1 && (
                <div className="absolute top-3 right-3 bg-black/70 border-2 border-white px-3 py-1 font-black text-white text-sm pointer-events-none">
                  🔍 {zoomPct}%
                </div>
              )}

              {/* Double-click hint when at 1× */}
              {zoom === 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 border-2 border-white px-4 py-2 font-bold text-white text-xs pointer-events-none whitespace-nowrap">
                  Double-click to zoom • Scroll to zoom
                </div>
              )}
            </div>

            {/* ── Zoom slider ── */}
            <div className="border-t-4 border-black bg-gray-50 px-4 py-3 flex items-center gap-4">
              <span className="text-xs font-black text-gray-500 uppercase w-6">1×</span>
              <input
                type="range"
                min={MIN_ZOOM}
                max={MAX_ZOOM}
                step={ZOOM_STEP}
                value={zoom}
                onChange={(e) => { setZoom(+e.target.value); setOffset({ x: 0, y: 0 }); }}
                className="flex-1 h-3 border-2 border-black cursor-pointer"
              />
              <span className="text-xs font-black text-gray-500 uppercase w-6">{MAX_ZOOM}×</span>
              <span className="bg-emerald-500 border-2 border-black px-3 py-1 font-black text-white text-xs min-w-14 text-center">
                {zoomPct}%
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ZoomPan;
