import React from "react";
import Home from "./components/Home";

const App = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 px-4 py-8">
      {/* Header Section with Windows-inspired styling */}
      <header className="max-w-6xl mx-auto mb-12">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-3 h-3 bg-red-500 border-2 border-black"></div>
            <div className="w-3 h-3 bg-yellow-400 border-2 border-black"></div>
            <div className="w-3 h-3 bg-green-500 border-2 border-black"></div>
            <div className="flex-1 bg-gradient-to-r from-blue-600 to-blue-400 border-2 border-black px-4 py-1">
              <span className="text-white font-bold text-sm">AI Image Enhancer v1.0</span>
            </div>
          </div>
          
          <div className="text-center">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-pink-500 mb-3 tracking-tight">
              AI Image Enhancer
            </h1>
            <p className="text-xl text-gray-700 font-semibold">
              Upload your image and let AI enhance it for you.
            </p>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto">
        <div className="bg-yellow-300 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
          <Home />
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto mt-8">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 border-2 border-black"></div>
              <span className="text-sm font-bold text-gray-800">Made by @Sohit</span>
            </div>
            <div className="flex gap-2">
              <div className="px-4 py-2 bg-gray-200 border-2 border-black font-bold text-xs hover:bg-gray-300 transition-colors">
                HELP
              </div>
              <div className="px-4 py-2 bg-gray-200 border-2 border-black font-bold text-xs hover:bg-gray-300 transition-colors">
                ABOUT
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
