import Painter from "../Painter";
import { useState } from "react";
import GalleryViewer from "../GalleryViewer";
import { makeStyles } from "@material-ui/core/styles";
import firebase from "firebase/app";
import "firebase/storage";

const images = [
  "pexels-david-savochka-192384.jpg",
  "pexels-evg-culture-1170986.jpg",
  "pexels-lina-kivaka-1741205.jpg",
  "pexels-marko-blazevic-774731.jpg",
  "pexels-mati-mango-4734723.jpg",
  "pexels-александар-цветановић-1560424.jpg",
].map((imgName) => "./images/" + imgName);

const useStyles = makeStyles((theme) => ({
  gallery: {
    width: 800,
  },
}));

function App() {
  const classes = useStyles();
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
    <>
      {showGallery ? (
        <GalleryViewer
          className={classes.gallery}
          images={images.map((url) => ({ img: url }))}
          onImageSelected={onImageSelected}
        />
      ) : (
        <Painter imgUrl={imageUrl} uploadFn={openGallery} />
      )}
    </>
  );
}

export default App;
