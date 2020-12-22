import React from "react";
import GalleryViewer from "./GalleryViewer";
import { isDevMode } from "../utils/general";
import firebase from "firebase/app";
import "firebase/storage";
import GalleryViewerFallback from "./GalleryViewerFallback";

interface GalleryProps {
  onImageSelected?: (url: string) => void;
}

interface GalleryState {
  images: string[];
  maxToShow: number;
}

const imgUrl = (imageName: string) =>
  isDevMode() ? localUrl(imageName) : remoteUrl(imageName);
const localUrl = (imageName: string) => `images/dataset/${imageName}`;
const remoteUrl = (imageName: string) =>
  `https://firebasestorage.googleapis.com/v0/b/annotation-editor-bgu.appspot.com/o/images%2F${imageName}?alt=media`;

class Gallery extends React.Component<GalleryProps, GalleryState> {
  static defaultProps: Partial<GalleryProps> = {
    onImageSelected: (url) => console.log("Image Selected", url),
  };

  state: GalleryState = {
    images: [],
    maxToShow: 20,
  };

  fetchImages = () => {
    const storage: firebase.storage.Storage = (window as any).storage;
    storage
      .ref("images")
      .listAll()
      .then(
        (listResult) => {
          const names = listResult.items.map((value) => value.name);
          const images = names.map(imgUrl);
          this.setState({ images });
        },
        (rejectReason) => console.log(rejectReason)
      );
  };

  scrollListener = () => {
    const { innerHeight, scrollY } = window;
    if (innerHeight + scrollY >= document.body.offsetHeight - 200) {
      this.needMoreImages();
    }
  };

  componentDidMount() {
    this.fetchImages();
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
