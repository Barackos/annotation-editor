import { GalleryImage } from "./types";
import firebaseTypes from "firebase/index";
import { isDevMode } from "../utils/general";

const imgUrl = (imageName: string) =>
  isDevMode() ? localUrl(imageName) : remoteUrl(imageName);
const localUrl = (imageName: string) => `images/dataset/${imageName}`;
const remoteUrl = (imageName: string) =>
  `https://firebasestorage.googleapis.com/v0/b/annotation-editor-bgu.appspot.com/o/images%2F${imageName}?alt=media`;

const storage: firebaseTypes.storage.Storage = (window as any).storage;

export const fetchImages = (): Promise<GalleryImage[]> =>
  storage
    .ref("images")
    .listAll()
    .then(
      (listResult) =>
        listResult.items.map(({ name }) => ({ name, url: imgUrl(name) })),
      (rejectReason) => {
        console.log(rejectReason);
        return [];
      }
    );
