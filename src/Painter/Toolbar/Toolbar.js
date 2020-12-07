import React from "react";
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
import "./Toolbar.scss";

export default function Toolbar({ toolbarState }) {
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
  } = toolbarState;
  return (
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
        <Button
          variant="contained"
          color={!shouldAssist ? "primary" : "secondary"}
          onClick={() => setAssist(!shouldAssist)}
        >
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
  );
}
