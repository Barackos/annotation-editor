import React, { Suspense, useEffect, useState } from "react";
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
import "./Painter/Painter.scss";
import "./App.scss";
import ReactPainter from "./Painter/ReactPainter";
import ToolbarButtons from "./ToolbarButtons";
import LinearProgress from "@material-ui/core/LinearProgress";
import OpenCvSnack from "./OpenCvSnack";
import loadOpenCv from "./utils/loadOpenCv";
import GalleryViewerFallback from "./GalleryViewer/GalleryViewerFallback";

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
  "02d8190f899602ed63f2192e0afe097c.jpg",
  "438373-2.jpg",
  "geometric-shapes-prism-art-black-line-prism-decorative-art-prints-for-living-room-wallpaper-prints.jpg",
  "Shapes.jpg",
].map((imgName) => "./images/" + imgName);

const GalleryViewer = React.lazy(() =>
  import(/* webpackChunkName: "GalleryViewer" */ `./GalleryViewer`)
);

const onPainterRender = (renderProps, state) => {
  const { drawable } = state;
  const { canvas } = renderProps;
  return (
    <div
      className="canvasContainer"
      style={{ cursor: drawable ? "crosshair" : "default" }}
    >
      <div className="canvas">{canvas}</div>
    </div>
  );
};

function App() {
  const classes = useStyles();
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [loading, setLoading] = useState(false);
  const [snackMessage, setSnackMessage] = useState({
    message: "OpenCV is loading...",
    severity: "info",
  });
  const [opencv, setOpenCv] = useState(undefined);

  const onOpenCvLoad = () => {
    setOpenCv(window.cv);
    setSnackMessage({ message: "OpenCV Loaded!", severity: "success" });
  };

  useEffect(() => {
    loadOpenCv(onOpenCvLoad);
  }, []);

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
    isOpenCvLoaded: !!opencv,
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
            {(loading || !opencv) && <LinearProgress />}
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
            <div
              style={{
                height: !showGallery ? "calc(100vh - 112px)" : undefined,
              }}
            >
              {showGallery ? (
                <>
                  <Typography gutterBottom variant="h3">
                    Pick an Image:
                  </Typography>
                  <Suspense fallback={<GalleryViewerFallback />}>
                    <GalleryViewer
                      images={images.map((url) => ({ img: url }))}
                      onImageSelected={onImageSelected}
                    />
                  </Suspense>
                </>
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
            </div>
          </main>
        </div>
        <OpenCvSnack messageData={snackMessage} />
      </header>
    </div>
  );
}

export default App;
