import React, { useState } from "react";
// import { ReactPainter } from "react-painter";
import { ReactPainter } from "./ReactPainter";
import "./Painter.scss";
import Toolbar from "./Toolbar";

const onRender = (renderProps, state) => {
  const { canvas } = renderProps;
  return (
    <div className="canvasContainer">
      <div class="canvas">{canvas}</div>
      <Toolbar toolbarState={state} />
    </div>
  );
};

function Painter({ imgUrl, uploadFn }) {
  const [drawable, setDrawable] = useState(false);
  const [shouldAssist, setAssist] = useState(false);
  const painterRef = React.createRef();
  const state = {
    drawable,
    setDrawable,
    uploadFn,
    shouldAssist,
    setAssist,
    handleSave: () => painterRef.current.handleSave(),
    handleUndo: () => painterRef.current.handleUndo(),
    canUndo: () => painterRef.current?.canUndo(),
    handleRedo: () => painterRef.current.handleRedo(),
    canRedo: () => painterRef.current?.canRedo(),
  };
  return (
    <ReactPainter
      key={imgUrl}
      ref={painterRef}
      width={1280}
      isDrawable={drawable}
      onSave={(blob) => console.log(blob)}
      render={(renderProps) => onRender(renderProps, state)}
      image={imgUrl}
      initialLineJoin={"round"}
    />
  );
}

export default Painter;
