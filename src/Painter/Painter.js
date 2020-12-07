import React, { useState } from "react";
// import { ReactPainter } from "react-painter";
import { ReactPainter } from "./ReactPainter";
import { Button } from "@material-ui/core";
import CreateIcon from "@material-ui/icons/Create";
import DeleteIcon from "@material-ui/icons/Delete";
import UndoIcon from "@material-ui/icons/Undo";
import SaveIcon from "@material-ui/icons/Save";
import GestureIcon from "@material-ui/icons/Gesture";
import PhotoSizeSelectActualIcon from "@material-ui/icons/PhotoSizeSelectActual";
import Divider from "@material-ui/core/Divider";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import "./Painter.scss";

const onRender = (renderProps, state) => {
  const { triggerSave, canvas } = renderProps;
  const { drawable, setDrawable, uploadFn, handleUndo } = state;
  return (
    <div className="canvasContainer">
      <div class="canvas">{canvas}</div>
      <Card className="card">
        <CardContent className="toolBox">
          <Button
            onClick={() => setDrawable(!drawable)}
            variant={drawable ? "outlined" : "contained"}
            color="primary"
          >
            <CreateIcon fontSize="large" />
          </Button>
          <Button variant="contained" color="primary">
            <DeleteIcon fontSize="large" />
          </Button>
          <Button variant="contained" color="primary">
            <UndoIcon fontSize="large" onClick={handleUndo} />
          </Button>
          <Button onClick={triggerSave} variant="contained" color="primary">
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
  const painterRef = React.createRef();
  const state = {
    drawable,
    setDrawable,
    uploadFn,
    handleUndo: () => painterRef.current.handleUndo(),
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
