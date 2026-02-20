import React, { useState, useRef } from "react";
import ImageUpload from "./ImageUpload";
import ImagePreview from "./ImagePreview";
import BeforeAfterSlider from "./BeforeAfterSlider";
import FormatConverter from "./FormatConverter";
import ProgressIndicator from "./ProgressIndicator";
import ImageMetadata from "./ImageMetadata";
import ImageGallery from "./ImageGallery";
import ManualAdjustments from "./ManualAdjustments";
import ShareExport from "./ShareExport";
import ZoomPan from "./ZoomPan";
import KeyboardShortcuts from "./KeyboardShortcuts";
import { enhancedImageAPI } from "../utils/enhanceImageApi";

const Home = () => {
  const [uploadImage, setuploadImage] = useState(null);
  const [enhancedImage, setenhancedImage] = useState(null);
  const [loading, setloading] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [processingStartTime, setProcessingStartTime] = useState(null);

  // Ref forwarded to ImageUpload so keyboard shortcut U can trigger it
  const fileInputRef = useRef(null);

  const UploadImageHandler = async (file) => {
    setuploadImage(URL.createObjectURL(file));
    setUploadedFileName(file.name);
    setUploadedFile(file);
    setloading(true);
    setProcessingStartTime(Date.now());
    try {
      const enhancedURL = await enhancedImageAPI(file);
      setenhancedImage(enhancedURL);
      setloading(false);
    } catch (error) {
      console.log(error);
      alert("Error while enhancing the image");
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
      <ImageUpload
        UploadImageHandler={UploadImageHandler}
        fileInputRef={fileInputRef}
      />
      <ImagePreview
        loading={loading}
        uploaded={uploadImage}
        enhanced={enhancedImage?.image}
        onReset={resetHandler}
      />

      {/* Progress Indicator */}
      {(loading || enhancedImage) && uploadedFile && (
        <ProgressIndicator
          isProcessing={loading}
          originalFile={uploadedFile}
          enhancedImage={enhancedImage?.image}
          startTime={processingStartTime}
        />
      )}

      {/* Before/After Slider */}
      {uploadImage && enhancedImage?.image && !loading && (
        <div className="mt-8 w-full">
          <BeforeAfterSlider
            beforeImage={uploadImage}
            afterImage={enhancedImage.image}
          />
        </div>
      )}

      {/* Zoom & Pan */}
      <div id="zoom-section" className="w-full">
        {enhancedImage?.image && !loading && (
          <ZoomPan
            imageUrl={enhancedImage.image}
            altText={uploadedFileName || "Enhanced image"}
          />
        )}
      </div>

      {/* Share & Export */}
      {uploadImage && enhancedImage?.image && !loading && (
        <ShareExport
          originalImage={uploadImage}
          enhancedImage={enhancedImage.image}
          fileName={uploadedFileName || "image"}
        />
      )}

      {/* Format Converter */}
      {enhancedImage?.image && !loading && (
        <div className="mt-8 w-full">
          <FormatConverter
            sourceImage={enhancedImage.image}
            sourceImageName={uploadedFileName || "enhanced-image"}
          />
        </div>
      )}

      {/* Manual Adjustments */}
      {enhancedImage?.image && !loading && (
        <ManualAdjustments
          sourceImage={enhancedImage.image}
          sourceImageName={uploadedFileName || "enhanced-image"}
        />
      )}

      {/* Image Metadata */}
      <div id="metadata-section" className="w-full">
        {uploadedFile && uploadImage && (
          <ImageMetadata
            imageFile={uploadedFile}
            imageUrl={uploadImage}
          />
        )}
      </div>

      {/* Image Gallery */}
      <div id="gallery-section" className="w-full">
        <ImageGallery
          newEnhancedImage={enhancedImage?.image || null}
          newFileName={uploadedFileName || "enhanced-image"}
        />
      </div>

      {/* Keyboard Shortcuts — floating button + modal, always mounted */}
      <KeyboardShortcuts
        onUpload={() => fileInputRef.current?.click()}
        onReset={uploadImage ? resetHandler : null}
        hasEnhanced={enhancedImage?.image || null}
      />
    </div>
  );
};

export default Home;
