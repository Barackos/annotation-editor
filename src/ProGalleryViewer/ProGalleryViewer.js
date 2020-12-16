import React from "react";
import { Typography } from "@material-ui/core";
import { ProGallery } from "pro-gallery";
import "pro-gallery/dist/statics/main.css";

export default function ProGalleryViewer({ images, onImageSelected }) {
  const items = images.map((image, index) => ({
    itemId: "sample-" + index,
    mediaUrl: image.img,
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
    width: 1000,
  };

  const options = {
    itemClick: "expand",
    overlayBackground: "rgba(8,8,8,0.35)",
  };

  const listener = (eName, eData) => {
    // console.log({ eName, eData });
    if (eName === "ITEM_CLICKED") onImageSelected(eData.url);
  };

  return (
    <>
      <Typography gutterBottom variant="h3">
        Pick an Image:
      </Typography>
      <ProGallery
        domId={"asd"}
        items={items}
        options={options}
        container={container}
        scrollingElement={() => document.getElementById("gallery") || window}
        eventsListener={listener}
      />
    </>
  );
}
