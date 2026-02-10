import React from "react";
import Loading from "./Loading";

const ImagePreview = (props) => {
  return (
    <div className="mt-8 grid grid-cols-2 md:grid-col-2 gap-6 w-full max-w-4xl">
      <div className="shadow-lg rounded-xl overflow-hidden">
        <h2 className="text-xl font-semibold text-center bg-gray-800 text-white py-2">
          Original Image
        </h2>
        {props.uploaded && (
          <img
            src={props.uploaded}
            alt=""
            className="w-full h-full object-contain"
          />
        )}
        <div className="font-semibold flex items-center justify-center h-80 bg-white">
          No Image selected
        </div>
      </div>

      <div className=" shadow-lg rounded-xl overflow-hidden">
        <h2 className="text-xl font-semibold text-center bg-gray-800 text-white py-2">
          Enhanced Image
        </h2>

        {props.enhanced && !props.loading && (
          <img src={props.enhanced} alt="" className="w-full h-full object-contain" />
        )}

        {props.loading ? (
          <Loading />
        ) : (
          <div className="font-semibold flex items-center justify-center h-80 bg-white">
            No Enhanced image
          </div>
        )}
        
      </div>
    </div>
  );
};

export default ImagePreview;
