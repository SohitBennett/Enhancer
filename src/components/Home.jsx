import React, { useState } from "react";
import ImageUpload from "./ImageUpload";
import ImagePreview from "./ImagePreview";
import BeforeAfterSlider from "./BeforeAfterSlider";
import FormatConverter from "./FormatConverter";
import { enhancedImageAPI } from "../utils/enhanceImageApi";

const Home = () => {
  const [uploadImage, setuploadImage] = useState(null);
  const [enhancedImage, setenhancedImage] = useState(null);
  const [loading, setloading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");

  const UploadImageHandler = async (file) => {
    setuploadImage(URL.createObjectURL(file));
    setUploadedFileName(file.name);
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
    setUploadedFileName("");
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
      
      {/* Before/After Slider - Only show when both images are available */}
      {uploadImage && enhancedImage?.image && !loading && (
        <div className="mt-8 w-full">
          <BeforeAfterSlider 
            beforeImage={uploadImage} 
            afterImage={enhancedImage.image} 
          />
        </div>
      )}

      {/* Format Converter - Show when enhanced image is available */}
      {enhancedImage?.image && !loading && (
        <div className="mt-8 w-full">
          <FormatConverter 
            sourceImage={enhancedImage.image}
            sourceImageName={uploadedFileName || "enhanced-image"}
          />
        </div>
      )}
    </div>
  );
};

export default Home;
