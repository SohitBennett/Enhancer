import axios from "axios";

const API_KEY = "wx8ludgbadw8e1e32";
const BASE_URL = "https://techhk.aoscdn.com/";

export const enhancedImageAPI = async (file) => {
  try {
    const taskId = await uploadImage(file);
    console.log("Image uploaded sucessfully, Task ID: ", taskId);

    //pooling --- dont run code until you get status : 5 instead of status: 4(loading)
    // PoolForEnhancedImage function.
    //fetch  enchanced image
    const enchancedImageData = await PoolForEnhancedImage(taskId);
    console.log("Enhanced image data: ", enchancedImageData);

    return enchancedImageData;

  } catch (error) {
    console.log("error: ", error.message);
  }
};

const uploadImage = async (file) => {
  //   "/api/tasks/visula/scale";

  const formData = new FormData();
  formData.append("image_file", file);

  const { data } = await axios.post(
    `${BASE_URL}/api/tasks/visual/scale`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
        "X-API-KEY": API_KEY,
      },
    }
  );

  if (!data?.data?.task_id) {
    throw new Error("Failed to upload image!");
  }

  return data.data.task_id;
};

const fetchEnhancedImage = async (taskId) => {
//   "/api/tasks/visual/scale/{task_id}";
  const { data } = await axios.get(
    `${BASE_URL}/api/tasks/visual/scale/${taskId}`,
    {
        headers: {
            "X-API-KEY": API_KEY,
        }
    }
  );

  if (!data?.data) {
    throw new Error("Failed to fetch enhanced image.");
  }

  return data.data;
};

const PoolForEnhancedImage = async (taskId, retries = 0) => {
    const result = await fetchEnhancedImage(taskId);
    
    if(result.state === 4){
        console.log("Processing...");

        if(retries >= 20){
            throw new Error("max tries reached, Error");
        }

        await new Promise((resolve) => setTimeout(resolve, 2000));

        return PoolForEnhancedImage(taskId, retries + 1);
    }

    return result;
}
