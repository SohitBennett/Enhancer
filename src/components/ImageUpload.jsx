import React from "react";

const ImageUpload = (props) => {

  const ShowImageHandler = (e) => {
    const file = e.target.files[0];
    if(file){
        props.UploadImageHandler(file);
    }
  };

  return (
    <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 w-full">
      <div className="bg-purple-600 border-2 border-black px-4 py-2 mb-6">
        <h3 className="text-white font-bold text-lg">📁 FILE UPLOAD</h3>
      </div>
      
      <label
        htmlFor="fileInput"
        className="block w-full cursor-pointer border-4 border-dashed border-black bg-gradient-to-br from-cyan-300 to-blue-400 p-12 text-center hover:from-cyan-400 hover:to-blue-500 transition-all"
      >
        <input
          type="file"
          id="fileInput"
          className="hidden"
          onChange={ShowImageHandler}
          accept="image/*"
        />
        <div className="flex flex-col items-center gap-4">
          <div className="text-6xl">🖼️</div>
          <span className="text-2xl font-black text-black uppercase tracking-wide">
            Click to Upload Image
          </span>
          <span className="text-sm font-bold text-gray-800 bg-yellow-300 border-2 border-black px-4 py-2">
            Drag & Drop or Click to Browse
          </span>
        </div>
      </label>
    </div>
  );
};

export default ImageUpload;
