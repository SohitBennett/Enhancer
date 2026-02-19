import React, { useState } from "react";
import ImageUpload from "./ImageUpload";
import ImagePreview from "./ImagePreview";
import BeforeAfterSlider from "./BeforeAfterSlider";
import FormatConverter from "./FormatConverter";
import ProgressIndicator from "./ProgressIndicator";
import ImageMetadata from "./ImageMetadata";
import ImageGallery from "./ImageGallery";
import { enhancedImageAPI } from "../utils/enhanceImageApi";

const Home = () => {
  const [uploadImage, setuploadImage] = useState(null);
  const [enhancedImage, setenhancedImage] = useState(null);
  const [loading, setloading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processingStartTime, setProcessingStartTime] = useState(null);

  const UploadImageHandler = async (file) => {
    setuploadImage(URL.createObjectURL(file));
    setUploadedFileName(file.name);
    setUploadedFile(file);
    setloading(true);
    setProcessingStartTime(Date.now());
    
    //call api to enhance image
    try{
        const enhancedURL = await enhancedImageAPI(file);
        setenhancedImage(enhancedURL);
        setloading(false);
    } catch (error) {
        console.log(error);
        alert("Error while enhacning the image");
        setloading(false);
    }
  };

  const resetHandler = () => {
    setuploadImage(null);
    setenhancedImage(null);
    setloading(false);
    setUploadedFileName("");
    setUploadedFile(null);
    setProcessingStartTime(null);
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
      
      {/* Progress Indicator - Show during processing and after completion */}
      {(loading || enhancedImage) && uploadedFile && (
        <ProgressIndicator 
          isProcessing={loading}
          originalFile={uploadedFile}
          enhancedImage={enhancedImage?.image}
          startTime={processingStartTime}
        />
      )}

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

      {/* Image Metadata - Show when image is uploaded */}
      {uploadedFile && uploadImage && (
        <ImageMetadata 
          imageFile={uploadedFile}
          imageUrl={uploadImage}
        />
      )}

      {/* Image Gallery/History - Always visible once any image has been enhanced */}
      <ImageGallery
        newEnhancedImage={enhancedImage?.image || null}
        newFileName={uploadedFileName || "enhanced-image"}
      />
    </div>
  );
};

export default Home;

