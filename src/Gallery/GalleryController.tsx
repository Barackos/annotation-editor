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
}

const remoteUrl = (imageName: string) =>
  `https://firebasestorage.googleapis.com/v0/b/annotation-editor-bgu.appspot.com/o/images%2F${imageName}?alt=media`;
const localUrl = (imageName: string) => `images/dataset/${imageName}`;
const imgUrl = (imageName: string) =>
  isDevMode() ? localUrl(imageName) : remoteUrl(imageName);

class Gallery extends React.Component<GalleryProps, GalleryState> {
  static defaultProps: Partial<GalleryProps> = {
    onImageSelected: (url) => console.log("Image Selected", url),
  };

  state: GalleryState = {
    images: [],
  };

  componentDidMount() {
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
  }

  render() {
    const { onImageSelected } = this.props;
    const { images } = this.state;
    return images.length ? (
      <GalleryViewer
        images={images.slice(0, 20)}
        onImageSelected={onImageSelected}
      />
    ) : (
      <GalleryViewerFallback />
    );
  }
}

export default Gallery;
