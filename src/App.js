import React, { useState } from "react";
import clsx from "clsx";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import ProGalleryViewer from "./ProGalleryViewer";
import "./Painter/Painter.scss";
import "./App.scss";
import ReactPainter from "./Painter/ReactPainter";
import ToolbarButtons from "./ToolbarButtons";
import LinearProgress from "@material-ui/core/LinearProgress";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(["width", "margin"], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 36,
  },
  hide: {
    display: "none",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
    whiteSpace: "nowrap",
  },
  drawerOpen: {
    width: drawerWidth,
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerClose: {
    transition: theme.transitions.create("width", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    overflowX: "hidden",
    width: theme.spacing(7) + 1,
    [theme.breakpoints.up("sm")]: {
      width: theme.spacing(9) + 1,
    },
  },
  toolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: theme.spacing(0, 1),
    // necessary for content to be below app bar
    ...theme.mixins.toolbar,
  },
  content: {
    flexGrow: 1,
    padding: theme.spacing(3),
  },
}));

const images = [
  "pexels-david-savochka-192384.jpg",
  "pexels-evg-culture-1170986.jpg",
  "pexels-lina-kivaka-1741205.jpg",
  "pexels-marko-blazevic-774731.jpg",
  "pexels-mati-mango-4734723.jpg",
  "pexels-александар-цветановић-1560424.jpg",
].map((imgName) => "./images/" + imgName);

const onPainterRender = (renderProps, state) => {
  const { drawable } = state;
  const { canvas } = renderProps;
  return (
    <div
      className="canvasContainer"
      style={{ cursor: drawable ? "crosshair" : "default" }}
    >
      <div class="canvas">{canvas}</div>
    </div>
  );
};

function App() {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = useState(false);

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const [imageUrl, setImageUrl] = useState("");
  const [showGallery, setGalleryShown] = useState(true);
  const openGallery = () => {
    setImageUrl(images[Math.floor(Math.random() * 3)]);
    setGalleryShown(!showGallery);
  };
  const onImageSelected = (url) => {
    setImageUrl(url);
    setGalleryShown(false);
  };

  const [drawable, setDrawable] = useState(false);
  const [shouldAssist, setAssist] = useState(false);
  const painterRef = React.createRef();
  const painterState = {
    drawable,
    setDrawable,
    uploadFn: openGallery,
    shouldAssist,
    setAssist,
    handleSave: () => painterRef.current.handleSaveAnnotation(),
    handleLoad: (filePath) => painterRef.current.handleLoadAnnotation(filePath),
    handleUndo: () => painterRef.current.handleUndo(),
    canUndo: () => painterRef.current?.canUndo(),
    handleRedo: () => painterRef.current.handleRedo(),
    canRedo: () => painterRef.current?.canRedo(),
    showAnnotation: () => painterRef.current?.showAnnotation(),
  };
  return (
    <div className="App">
      <header className="App-header">
        <div className={classes.root}>
          <CssBaseline />
          <AppBar
            position="fixed"
            className={clsx(classes.appBar, {
              [classes.appBarShift]: !showGallery && open,
            })}
          >
            <Toolbar>
              {!showGallery && (
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleDrawerOpen}
                  edge="start"
                  className={clsx(classes.menuButton, {
                    [classes.hide]: open,
                  })}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Typography variant="h4" noWrap>
                Polygon Annotation Editor
              </Typography>
            </Toolbar>
            {loading && <LinearProgress />}
          </AppBar>
          {!showGallery && (
            <Drawer
              variant="permanent"
              className={clsx(classes.drawer, {
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open,
              })}
              classes={{
                paper: clsx({
                  [classes.drawerOpen]: open,
                  [classes.drawerClose]: !open,
                }),
              }}
            >
              <div className={classes.toolbar}>
                <IconButton onClick={handleDrawerClose}>
                  {theme.direction === "rtl" ? (
                    <ChevronRightIcon />
                  ) : (
                    <ChevronLeftIcon />
                  )}
                </IconButton>
              </div>
              <Divider />
              <ToolbarButtons painterState={painterState} />
            </Drawer>
          )}
          <main className={classes.content}>
            <div className={classes.toolbar} />
            {showGallery ? (
              <ProGalleryViewer
                images={images.map((url) => ({ img: url }))}
                onImageSelected={onImageSelected}
              />
            ) : (
              <ReactPainter
                key={imageUrl}
                ref={painterRef}
                width={1280}
                isDrawable={drawable}
                onSave={(blob) => console.log(blob)}
                render={(renderProps) =>
                  onPainterRender(renderProps, painterState)
                }
                setLoading={setLoading}
                image={imageUrl}
                initialLineJoin={"round"}
              />
            )}
          </main>
        </div>
      </header>
    </div>
  );
}

export default App;
