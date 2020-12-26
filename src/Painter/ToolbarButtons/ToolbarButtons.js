import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import CreateIcon from "@material-ui/icons/Create";
import UndoIcon from "@material-ui/icons/Undo";
import RedoIcon from "@material-ui/icons/Redo";
import SaveIcon from "@material-ui/icons/Save";
import PublishIcon from "@material-ui/icons/Publish";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import PhotoSizeSelectActualIcon from "@material-ui/icons/PhotoSizeSelectActual";
import Divider from "@material-ui/core/Divider";

function ToolbarButtons({ painterState }) {
  const {
    drawable,
    isOpenCvLoaded,
    setDrawable,
    pickNewImg,
    handleUndo,
    handleRedo,
    handleSave,
    handleLoad,
    showAnnotation,
    canUndo,
    canRedo,
    shouldAssist,
    setAssist,
  } = painterState;
  const toggleVisibility = () => {
    showAnnotation(!shouldAssist);
    setAssist(!shouldAssist);
  };
  return (
    <>
      <List>
        <ListItem
          button
          selected={drawable}
          disabled={!isOpenCvLoaded}
          key={"Draw"}
          onClick={() => setDrawable(!drawable)}
        >
          <ListItemIcon>
            <CreateIcon
              fontSize="large"
              color={drawable ? "secondary" : "action"}
            />
          </ListItemIcon>
          <ListItemText primary={"Draw"} />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button key={"Undo"} onClick={handleUndo}>
          <ListItemIcon>
            <UndoIcon
              fontSize="large"
              color={canUndo() ? "secondary" : "action"}
            />
          </ListItemIcon>
          <ListItemText primary={"Undo"} />
        </ListItem>
        <ListItem button key={"Redo"} onClick={handleRedo}>
          <ListItemIcon>
            <RedoIcon
              fontSize="large"
              color={canRedo() ? "secondary" : "action"}
            />
          </ListItemIcon>
          <ListItemText primary={"Redo"} />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button key={"Load"} onClick={handleLoad}>
          <ListItemIcon>
            <PublishIcon fontSize="large" />
          </ListItemIcon>
          <ListItemText primary={"Load Annotation"} />
        </ListItem>
        <ListItem button key={"Save"} onClick={handleSave}>
          <ListItemIcon>
            <SaveIcon fontSize="large" />
          </ListItemIcon>
          <ListItemText primary={"Save Annotation"} />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button key={"Visibility"} onClick={toggleVisibility}>
          <ListItemIcon>
            {shouldAssist ? (
              <VisibilityOffIcon
                fontSize="large"
                color={!shouldAssist ? "primary" : "secondary"}
              />
            ) : (
              <VisibilityIcon
                fontSize="large"
                color={!shouldAssist ? "primary" : "secondary"}
              />
            )}
          </ListItemIcon>
          <ListItemText primary={"Visibility"} />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button key={"PickNewImage"} onClick={pickNewImg}>
          <ListItemIcon>
            <PhotoSizeSelectActualIcon fontSize="large" />
          </ListItemIcon>
          <ListItemText primary={"New Image"} />
        </ListItem>
      </List>
    </>
  );
}

export default ToolbarButtons;
