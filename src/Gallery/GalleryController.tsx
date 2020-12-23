import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { fetchImages } from "../utils/storage";
import { OnImageSelected } from "./types";
import GalleryViewer from "./GalleryViewer";
import GalleryViewerFallback from "./GalleryViewerFallback";

const interval = 20;
interface GalleryProps {
  onImageSelected?: OnImageSelected;
}

const Gallery: FunctionComponent<GalleryProps> = ({ onImageSelected }) => {
  const [images, setImages] = useState([]);
  const [boundary, setBoundary] = useState(interval);

  const scrollListener = useCallback(() => {
    const { innerHeight, scrollY } = window;
    if (innerHeight + scrollY >= document.body.offsetHeight - 400) {
      setBoundary(boundary + interval);
    }
  }, [boundary]);

  useEffect(() => {
    fetchImages().then(setImages);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", scrollListener);
    return () => window.removeEventListener("scroll", scrollListener);
  }, [scrollListener]);

  return images.length ? (
    <GalleryViewer
      images={images.slice(0, boundary)}
      onImageSelected={onImageSelected}
    />
  ) : (
    <GalleryViewerFallback />
  );
};

export default Gallery;
