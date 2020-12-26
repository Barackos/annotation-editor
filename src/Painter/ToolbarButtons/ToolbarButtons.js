import React, { useState } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import CreateIcon from "@material-ui/icons/Create";
import UndoIcon from "@material-ui/icons/Undo";
import RedoIcon from "@material-ui/icons/Redo";
import SaveIcon from "@material-ui/icons/Save";
import PublishIcon from "@material-ui/icons/Publish";
import VisibilityIcon from "@material-ui/icons/Visibility";
import VisibilityOffIcon from "@material-ui/icons/VisibilityOff";
import PhotoSizeSelectActualIcon from "@material-ui/icons/PhotoSizeSelectActual";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import Divider from "@material-ui/core/Divider";

function ToolbarButtons({ painterState, onMouseOver, onMouseOut }) {
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
    user,
    signOut,
  } = painterState;
  const [anchorEl, setAnchorEl] = useState(null);
  const handleAnchorClick = (event) => setAnchorEl(event.currentTarget);
  const handleAnchorClose = (shouldSignOut) => {
    setAnchorEl(null);
    if (shouldSignOut) {
      signOut();
    }
  };
  const toggleVisibility = () => {
    showAnnotation(!shouldAssist);
    setAssist(!shouldAssist);
  };
  return (
    <div onMouseOver={onMouseOver} onMouseOut={onMouseOut}>
      {user && [
        <List key="AccountAvatar">
          <ListItem button key={"Account"} onClick={handleAnchorClick}>
            <ListItemIcon>
              <Avatar alt={user.displayName} src={user.photoURL}>
                {!user.photoURL && user.displayName.charAt(0)}
              </Avatar>
            </ListItemIcon>
            <ListItemText primary={user.displayName} />
          </ListItem>
        </List>,
        <Divider key="AccountDivider" />,
      ]}
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
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => handleAnchorClose(false)}
      >
        <MenuItem onClick={() => handleAnchorClose(true)}>Sign Out</MenuItem>
      </Menu>
    </div>
  );
}

export default ToolbarButtons;
