import { blobToFile } from "../utils/general";
import { FunctionComponent } from "react";
import { GalleryImage } from "../utils/types";
import { OnImageSelected } from "./types";
import { ProGallery } from "pro-gallery";
import "pro-gallery/dist/statics/main.css";

interface Props {
  images: GalleryImage[];
  onImageSelected?: OnImageSelected;
}

const GalleryViewer: FunctionComponent<Props> = ({
  images,
  onImageSelected,
}) => {
  const items = images.map(({ name, url }, index) => ({
    itemId: name,
    mediaUrl: url,
    metaData: {
      type: "image",
      width: 100,
      height: 100,
      title: name,
      description: url,
      focalPoint: [0, 0],
    },
  }));

  const container = {
    width: window.innerWidth - 118,
  };

  const options = {
    itemClick: "expand",
    overlayBackground: "rgba(8,8,8,0.35)",
  };

  const listener = (eName: string, { id: name, url }) => {
    // console.log({ eName, eData });
    switch (eName) {
      case "ITEM_CLICKED":
        fetch(url).then(async (value) =>
          onImageSelected(
            blobToFile(await value.blob(), name.replaceAll(/([._])/g, "-"))
          )
        );
        break;
      default:
        break;
    }
  };

  return (
    <ProGallery
      items={items}
      options={options}
      container={container}
      scrollingElement={() => document.getElementById("gallery") || window}
      eventsListener={listener}
    />
  );
};

export default GalleryViewer;
