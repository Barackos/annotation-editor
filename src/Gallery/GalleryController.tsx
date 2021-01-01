import { FunctionComponent, useCallback, useEffect, useState } from "react";
import { OnImageSelected } from "./types";
import GalleryViewer from "./GalleryViewer";
import GalleryViewerFallback from "./GalleryViewerFallback";
import { GalleryImage } from "../utils/types";

const interval = 20;
interface GalleryProps {
  onImageSelected?: OnImageSelected;
  images?: GalleryImage[];
}

const Gallery: FunctionComponent<GalleryProps> = ({
  onImageSelected,
  images,
}) => {
  const [boundary, setBoundary] = useState(interval);

  const scrollListener = useCallback(() => {
    const { innerHeight, scrollY } = window;
    if (innerHeight + scrollY >= document.body.offsetHeight - 400) {
      setBoundary(boundary + interval);
    }
  }, [boundary]);

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
