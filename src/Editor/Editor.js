import Painter from "../Painter";
import { useState } from "react";
import ProGalleryViewer from "../ProGalleryViewer";
import firebase from "firebase/app";
import "firebase/storage";
import MiniDrawer from "../Drawer";

const images = [
  "pexels-david-savochka-192384.jpg",
  "pexels-evg-culture-1170986.jpg",
  "pexels-lina-kivaka-1741205.jpg",
  "pexels-marko-blazevic-774731.jpg",
  "pexels-mati-mango-4734723.jpg",
  "pexels-александар-цветановић-1560424.jpg",
].map((imgName) => "./images/" + imgName);

function App() {
  const [imageUrl, setImageUrl] = useState("");
  const [showGallery, setGalleryShown] = useState(true);
  const openGallery = () => {
    console.log(firebase);
    setImageUrl(images[Math.floor(Math.random() * 3)]);
    setGalleryShown(!showGallery);
  };
  const onImageSelected = (url) => {
    setImageUrl(url);
    setGalleryShown(false);
  };
  return (
    <MiniDrawer>
      {showGallery ? (
        <ProGalleryViewer
          images={images.map((url) => ({ img: url }))}
          onImageSelected={onImageSelected}
        />
      ) : (
        <Painter imgUrl={imageUrl} uploadFn={openGallery} />
      )}
    </MiniDrawer>
  );
}

export default App;
