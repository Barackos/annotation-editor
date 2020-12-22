import React from "react";
import { fetchImages } from "../utils/storage";
import GalleryViewer from "./GalleryViewer";
import GalleryViewerFallback from "./GalleryViewerFallback";

interface GalleryProps {
  onImageSelected?: (url: string) => void;
}

interface GalleryState {
  images: string[];
  maxToShow: number;
}

class Gallery extends React.Component<GalleryProps, GalleryState> {
  static defaultProps: Partial<GalleryProps> = {
    onImageSelected: (url) => console.log("Image Selected", url),
  };

  state: GalleryState = {
    images: [],
    maxToShow: 20,
  };

  scrollListener = () => {
    const { innerHeight, scrollY } = window;
    if (innerHeight + scrollY >= document.body.offsetHeight - 200) {
      this.needMoreImages();
    }
  };

  componentDidMount() {
    fetchImages().then((images) => this.setState({ images }));
    window.addEventListener("scroll", this.scrollListener);
  }

  componentWillUnmount() {
    window.removeEventListener("scroll", this.scrollListener);
  }

  needMoreImages = () =>
    this.setState({ maxToShow: this.state.maxToShow + 20 });

  render() {
    const { onImageSelected } = this.props;
    const { images, maxToShow } = this.state;
    return images.length ? (
      <GalleryViewer
        images={images.slice(0, maxToShow)}
        onImageSelected={onImageSelected}
      />
    ) : (
      <GalleryViewerFallback />
    );
  }
}

export default Gallery;
