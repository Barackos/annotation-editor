import { FunctionComponent } from "react";
import { ProGallery } from "pro-gallery";
import { OnImageSelected } from "./types";
import "pro-gallery/dist/statics/main.css";
import { blobToFile } from "../utils/general";

interface Props {
  images: string[];
  onImageSelected?: OnImageSelected;
}

const GalleryViewer: FunctionComponent<Props> = ({
  images,
  onImageSelected,
}) => {
  const items = images.map((url, index) => ({
    itemId: "sample-" + index,
    mediaUrl: url,
    metaData: {
      type: "image",
      width: 100,
      height: 100,
      title: "sample-title",
      description: "sample-description",
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

  const listener = (eName, eData) => {
    // console.log({ eName, eData });
    switch (eName) {
      case "ITEM_CLICKED":
        fetch(eData.url).then(async (value) => {
          const blob = await value.blob();
          const imageName = eData.url
            .substr(eData.url.lastIndexOf("/") + 1)
            .replaceAll(/([._])/g, "-");
          onImageSelected(blobToFile(blob, imageName));
        });
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
