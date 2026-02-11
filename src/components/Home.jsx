import React, { useState } from "react";
import ImageUpload from "./ImageUpload";
import ImagePreview from "./ImagePreview";
import { enhancedImageAPI } from "../utils/enhanceImageApi";

const Home = () => {
  const [uploadImage, setuploadImage] = useState(null);
  const [enhancedImage, setenhancedImage] = useState(null);
  const [loading, setloading] = useState(false);

  const UploadImageHandler = async (file) => {
    setuploadImage(URL.createObjectURL(file));
    setloading(true);
    //call api to enhance image
    try{
        const enhancedURL = await enhancedImageAPI(file);
        setenhancedImage(enhancedURL);
        setloading(false);
    } catch (error) {
        console.log(error);
        alert("Error while enhacning the image");
    }
  };

  const resetHandler = () => {
    setuploadImage(null);
    setenhancedImage(null);
    setloading(false);
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <ImageUpload UploadImageHandler={UploadImageHandler}/>
      <ImagePreview
        loading={loading}
        uploaded={uploadImage}
        enhanced={enhancedImage?.image}
        onReset={resetHandler}
      />
    </div>
  );
};

export default Home;
