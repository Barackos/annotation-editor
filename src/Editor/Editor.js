import Painter from "../Painter";
import { useState } from "react";
import GalleryViewer from "../GalleryViewer";

const images = [
  "https://images-na.ssl-images-amazon.com/images/I/61qNHbx9LDL._AC_SL1200_.jpg",
  "https://images-na.ssl-images-amazon.com/images/I/91tCuetFu6L._AC_SL1500_.jpg",
  "https://images-na.ssl-images-amazon.com/images/I/71Oy%2BEllDAL._AC_SL1024_.jpg",
];

function App() {
  const [imageUrl, setImageUrl] = useState("");
  const [showGallery, setGalleryShown] = useState(true);
  const openGallery = () => {
    setImageUrl(images[Math.floor(Math.random() * 3)]);
    setGalleryShown(!showGallery);
  };
  const onImageSelected = (url) => {
    setImageUrl(url);
    setGalleryShown(false);
  }
  return (
    <>
      {showGallery ? (
        <GalleryViewer images={images.map((url) => ({ img: url }))} onImageSelected={onImageSelected} />
      ) : (
        <Painter imgUrl={imageUrl} uploadFn={openGallery} />
      )}
    </>
  );
}

export default App;
