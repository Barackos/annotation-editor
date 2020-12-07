import React, { useState } from "react";
// import { ReactPainter } from "react-painter";
import { ReactPainter } from "./ReactPainter";
import { Button } from "@material-ui/core";
import CreateIcon from "@material-ui/icons/Create";
import UndoIcon from "@material-ui/icons/Undo";
import RedoIcon from "@material-ui/icons/Redo";
import SaveIcon from "@material-ui/icons/Save";
import GestureIcon from "@material-ui/icons/Gesture";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import PhotoSizeSelectActualIcon from "@material-ui/icons/PhotoSizeSelectActual";
import Divider from "@material-ui/core/Divider";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import "./Painter.scss";

const onRender = (renderProps, state) => {
  const { canvas } = renderProps;
  const {
    drawable,
    setDrawable,
    uploadFn,
    handleUndo,
    handleRedo,
    handleSave,
    canUndo,
    canRedo,
    shouldAssist,
    setAssist,
  } = state;
  return (
    <div className="canvasContainer">
      <div class="canvas">{canvas}</div>
      <Card className="card">
        <CardContent className="toolBox">
          <Button
            onClick={() => setDrawable(!drawable)}
            variant="contained"
            color={!drawable ? "primary" : "secondary"}
          >
            <CreateIcon fontSize="large" />
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUndo}
            disabled={!canUndo()}
          >
            <UndoIcon fontSize="large" />
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleRedo}
            disabled={!canRedo()}
          >
            <RedoIcon fontSize="large" />
          </Button>
          <Button variant="contained" color={!shouldAssist ? "primary" : "secondary"} onClick={() => setAssist(!shouldAssist)}>
            {shouldAssist ? (
              <VisibilityOffIcon fontSize="large" />
            ) : (
              <VisibilityIcon fontSize="large" />
            )}
          </Button>
          {/* <Button onClick={triggerSave} variant="contained" color="primary"> */}
          <Button onClick={handleSave} variant="contained" color="primary">
            <SaveIcon fontSize="large" />
          </Button>
          <Button variant="contained" color="primary">
            <GestureIcon fontSize="large" />
          </Button>
          <Divider className="divider" />
          <Button variant="contained" color="secondary" onClick={uploadFn}>
            <PhotoSizeSelectActualIcon fontSize="large" />
          </Button>
        </CardContent>
      </Card>
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
