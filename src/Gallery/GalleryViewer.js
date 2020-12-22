import { ProGallery } from "pro-gallery";
import "pro-gallery/dist/statics/main.css";

export default function GalleryViewer({ images, onImageSelected }) {
  const items = images.map((url, index) => ({
    itemId: "sample-" + index,
    mediaUrl: url,
    metaData: {
      type: "image",
      width: 200,
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
        onImageSelected(eData.url);
        break;
      default:
        break;
    }
  };

  return (
    <ProGallery
      domId={"asd"}
      items={items}
      options={options}
      container={container}
      scrollingElement={() => document.getElementById("gallery") || window}
      eventsListener={listener}
    />
  );
}
