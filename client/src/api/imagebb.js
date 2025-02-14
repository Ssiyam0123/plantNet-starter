import axios from "axios";

const imagebb = async (imageData) => {
  const response = await axios.post(
    `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMBB_KEY}`,
    imageData
  );

  const imageLink = response.data.data.url;
  console.log(imageLink)

  return imageLink;
};

export default imagebb;
