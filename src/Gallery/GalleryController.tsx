import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { fetchImages } from "../utils/storage";
import GalleryViewer from "./GalleryViewer";
import GalleryViewerFallback from "./GalleryViewerFallback";

interface GalleryProps {
  onImageSelected?: (image: string | File) => void;
}

const Gallery: FunctionComponent<GalleryProps> = ({ onImageSelected }) => {
  const [images, setImages] = useState([]);
  const [boundary, setBoundary] = useState(20);

  const scrollListener = useCallback(() => {
    const { innerHeight, scrollY } = window;
    if (innerHeight + scrollY >= document.body.offsetHeight - 200) {
      setBoundary(boundary + 20);
    }
  }, [boundary]);

  useEffect(() => {
    fetchImages().then(setImages);
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
