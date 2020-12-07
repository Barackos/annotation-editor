import React from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import CreateIcon from "@material-ui/icons/Create";
import UndoIcon from "@material-ui/icons/Undo";
import RedoIcon from "@material-ui/icons/Redo";
import SaveIcon from "@material-ui/icons/Save";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import PhotoSizeSelectActualIcon from "@material-ui/icons/PhotoSizeSelectActual";
import Divider from "@material-ui/core/Divider";

export default function ToolbarButtons({ painterState }) {
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
  } = painterState;
  return (
    <>
      <List>
        <ListItem
          button
          selected={drawable}
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
        <ListItem
          button
          key={"Visibility"}
          onClick={() => setAssist(!shouldAssist)}
        >
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
        <ListItem button key={"Save"} onClick={handleSave}>
          <ListItemIcon>
            <SaveIcon fontSize="large" />
          </ListItemIcon>
          <ListItemText primary={"Save"} />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem button key={"PickNewImage"} onClick={uploadFn}>
          <ListItemIcon>
            <PhotoSizeSelectActualIcon fontSize="large" />
          </ListItemIcon>
          <ListItemText primary={"PickNewImage"} />
        </ListItem>
      </List>
    </>
  );
}
