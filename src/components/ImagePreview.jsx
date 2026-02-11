import React from "react";
import Loading from "./Loading";

const ImagePreview = (props) => {
  // Function to download the enhanced image
  const handleDownload = () => {
    if (!props.enhanced) return;
    
    // Create a temporary link element
    const link = document.createElement('a');
    link.href = props.enhanced;
    link.download = `enhanced-image-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
      {/* Original Image Window */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 border-b-4 border-black px-4 py-3 flex items-center gap-2">
          <div className="w-3 h-3 bg-white border-2 border-black"></div>
          <div className="w-3 h-3 bg-white border-2 border-black"></div>
          <div className="w-3 h-3 bg-white border-2 border-black"></div>
          <h2 className="text-lg font-black text-white uppercase ml-2">
            📷 Original Image
          </h2>
        </div>
        
        <div className="bg-pink-100 border-4 border-pink-300 m-4 min-h-[320px] flex items-center justify-center">
          {props.uploaded ? (
            <img
              src={props.uploaded}
              alt="Original"
              className="w-full h-full object-contain"
            />
          ) : (
            <div className="text-center p-8">
              <div className="text-6xl mb-4">📁</div>
              <div className="font-black text-xl text-gray-700 uppercase">
                No Image Selected
              </div>
            </div>
          )}
        </div>

        {/* Reset Button - Only shown when image is uploaded */}
        {props.uploaded && (
          <div className="m-4 mt-0">
            <button
              onClick={props.onReset}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-all px-6 py-4 font-black text-white uppercase text-lg tracking-wide flex items-center justify-center gap-3"
            >
              <span className="text-2xl">🔄</span>
              Reset & Upload New Image
            </button>
          </div>
        )}
      </div>

      {/* Enhanced Image Window */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        <div className="bg-gradient-to-r from-green-500 to-emerald-500 border-b-4 border-black px-4 py-3 flex items-center gap-2">
          <div className="w-3 h-3 bg-white border-2 border-black"></div>
          <div className="w-3 h-3 bg-white border-2 border-black"></div>
          <div className="w-3 h-3 bg-white border-2 border-black"></div>
          <h2 className="text-lg font-black text-white uppercase ml-2">
            ✨ Enhanced Image
          </h2>
        </div>
        
        <div className="bg-green-100 border-4 border-green-300 m-4 min-h-[320px] flex items-center justify-center">
          {props.loading ? (
            <Loading />
          ) : props.enhanced ? (
            <img 
              src={props.enhanced} 
              alt="Enhanced" 
              className="w-full h-full object-contain" 
            />
          ) : (
            <div className="text-center p-8">
              <div className="text-6xl mb-4">⏳</div>
              <div className="font-black text-xl text-gray-700 uppercase">
                No Enhanced Image
              </div>
            </div>
          )}
        </div>

        {/* Download Button - Only shown when enhanced image exists */}
        {props.enhanced && !props.loading && (
          <div className="m-4 mt-0">
            <button
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] active:translate-x-[4px] active:translate-y-[4px] transition-all px-6 py-4 font-black text-white uppercase text-lg tracking-wide flex items-center justify-center gap-3"
            >
              <span className="text-2xl">⬇️</span>
              Download Enhanced Image
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePreview;
