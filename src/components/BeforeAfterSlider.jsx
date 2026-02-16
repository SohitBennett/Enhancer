import React, { useState, useRef, useEffect } from "react";

const BeforeAfterSlider = ({ beforeImage, afterImage }) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);

  const handleMove = (clientX) => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = (x / rect.width) * 100;

    // Clamp between 0 and 100
    const clampedPercentage = Math.min(Math.max(percentage, 0), 100);
    setSliderPosition(clampedPercentage);
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    handleMove(e.touches[0].clientX);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove);
      document.addEventListener("touchend", handleMouseUp);

      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
        document.removeEventListener("touchmove", handleTouchMove);
        document.removeEventListener("touchend", handleMouseUp);
      };
    }
  }, [isDragging, sliderPosition]);

  if (!beforeImage || !afterImage) {
    return null;
  }

  return (
    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-500 border-b-4 border-black px-4 py-3 flex items-center gap-2">
        <div className="w-3 h-3 bg-white border-2 border-black"></div>
        <div className="w-3 h-3 bg-white border-2 border-black"></div>
        <div className="w-3 h-3 bg-white border-2 border-black"></div>
        <h2 className="text-lg font-black text-white uppercase ml-2">
          🔄 Before/After Comparison
        </h2>
      </div>

      {/* Comparison Container */}
      <div className="p-4">
        <div
          ref={containerRef}
          className="relative w-full overflow-hidden border-4 border-black cursor-ew-resize select-none"
          style={{ aspectRatio: "16/9" }}
          onMouseDown={handleMouseDown}
          onTouchStart={handleMouseDown}
        >
          {/* After Image (Background) */}
          <div className="absolute inset-0">
            <img
              src={afterImage}
              alt="Enhanced"
              className="w-full h-full object-contain bg-green-100"
              draggable={false}
            />
            {/* Enhanced Label */}
            <div className="absolute top-4 right-4 bg-green-500 border-2 border-black px-3 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-white font-black text-sm uppercase">
                ✨ Enhanced
              </span>
            </div>
          </div>

          {/* Before Image (Clipped) */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
          >
            <img
              src={beforeImage}
              alt="Original"
              className="w-full h-full object-contain bg-pink-100"
              draggable={false}
            />
            {/* Original Label */}
            <div className="absolute top-4 left-4 bg-pink-500 border-2 border-black px-3 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <span className="text-white font-black text-sm uppercase">
                📷 Original
              </span>
            </div>
          </div>

          {/* Slider Line and Handle */}
          <div
            className="absolute top-0 bottom-0 w-1 bg-black"
            style={{ left: `${sliderPosition}%` }}
          >
            {/* Slider Handle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
              <div className="relative">
                {/* Handle Circle */}
                <div className="w-12 h-12 bg-white border-4 border-black rounded-full shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                  <div className="flex gap-0.5">
                    <div className="w-1 h-4 bg-black"></div>
                    <div className="w-1 h-4 bg-black"></div>
                  </div>
                </div>

                {/* Arrows */}
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-black flex items-center justify-center">
                  <span className="text-xs font-black">◀</span>
                </div>
                <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-black flex items-center justify-center">
                  <span className="text-xs font-black">▶</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-4 bg-yellow-300 border-4 border-black p-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">👆</div>
            <div>
              <p className="font-black text-sm uppercase text-gray-800">
                Drag the slider to compare images
              </p>
              <p className="text-xs font-bold text-gray-700 mt-1">
                Slide left to see original • Slide right to see enhanced
              </p>
            </div>
          </div>
        </div>

        {/* Quick Jump Buttons */}
        <div className="mt-4 grid grid-cols-3 gap-2">
          <button
            onClick={() => setSliderPosition(0)}
            className="bg-pink-500 hover:bg-pink-600 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-all px-4 py-3 font-black text-white uppercase text-sm"
          >
            📷 Original
          </button>
          <button
            onClick={() => setSliderPosition(50)}
            className="bg-indigo-500 hover:bg-indigo-600 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-all px-4 py-3 font-black text-white uppercase text-sm"
          >
            🔄 50/50
          </button>
          <button
            onClick={() => setSliderPosition(100)}
            className="bg-green-500 hover:bg-green-600 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-all px-4 py-3 font-black text-white uppercase text-sm"
          >
            ✨ Enhanced
          </button>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
