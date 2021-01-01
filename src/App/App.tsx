import React, { Suspense, useEffect, useState } from "react";
import clsx from "clsx";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import Drawer from "@material-ui/core/Drawer";
import CssBaseline from "@material-ui/core/CssBaseline";
import Typography from "@material-ui/core/Typography";
import Divider from "@material-ui/core/Divider";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeftIcon from "@material-ui/icons/ChevronLeft";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import "./App.scss";
import ReactPainter from "../Painter";
import ToolbarButtons from "../Painter/ToolbarButtons";
import OpenCvSnack from "../OpenCvSnack";
import loadOpenCv from "../utils/loadOpenCv";
import { GalleryFallback } from "../Gallery";
import Login from "../Login";
import { observeUser, signOut } from "../utils/auth";
import { loadAnnotation, saveAnnotation } from "../utils/realtimeDb";
import firebaseTypes from "firebase/index";
import TopBar from "./TopBar";
import { fetchImages } from "../utils/storage";

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
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

const Gallery = React.lazy(
  () => import(/* webpackChunkName: "Gallery" */ `../Gallery`)
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
  const [drawerOpened, setDrawerOpened] = React.useState(false);
  const [isLoading, setLoading] = useState(false);
  const [snackMessage, setSnackMessage] = useState({
    message: "OpenCV is loading...",
    severity: "info",
  });
  const [opencv, setOpenCv] = useState(undefined);
  const [authOpen, showAuth] = useState(false);
  const [image, setImage] = useState(undefined);
  const [images, setImages] = useState([]);
  const [showGallery, setGalleryShown] = useState(true);

  useEffect(() => {
    fetchImages().then((images) => setImages(images));
    loadOpenCv((cv) => {
      setOpenCv(cv);
      setSnackMessage({ message: "OpenCV Loaded!", severity: "success" });
    });
  }, []);

  const openGallery = () => {
    setAssist(false);
    setGalleryShown(!showGallery);
  };
  const onImageSelected = (image) => {
    setImage(image);
    setGalleryShown(false);
  };

  const [drawable, setDrawable] = useState(false);
  const [shouldAssist, setAssist] = useState(false);
  const painterRef = React.createRef<ReactPainter>();

  // Auth
  const [user, setUser] = useState(undefined);
  const [pending, setPending] = useState("");
  useEffect(() => {
    let dispatch: firebaseTypes.Unsubscribe;
    observeUser(setUser).then((value) => (dispatch = value));
    return () => dispatch();
  }, []);

  const handleAnnotationAction = (cta?: string) => {
    const action = pending || cta;
    if (action) {
      if (user) {
        setLoading(true);
        if (action === "load") {
          const implementAnnotation = painterRef.current.handleLoadAnnotation;
          loadAnnotation(user, image.name).then((annotations) => {
            if (!annotations)
              setSnackMessage({
                message: "No annotations are saved for this image",
                severity: "info",
              });
            else {
              implementAnnotation(annotations);
              setSnackMessage({
                message: "Loaded successfully!",
                severity: "success",
              });
            }
            setLoading(false);
          });
        } else if (action === "save") {
          saveAnnotation(
            user,
            image.name,
            painterRef.current.getAnnotations()
          ).then(() => {
            setLoading(false);
            setSnackMessage({
              message: "Saved successfully!",
              severity: "success",
            });
          });
        }
        setPending("");
        showAuth(false);
      } else {
        showAuth(true);
      }
    }
  };
  useEffect(handleAnnotationAction, [image?.name, painterRef, pending, user]);

  const annotationCTA = (cta: string) => {
    setPending(cta);
    handleAnnotationAction(cta);
  };
  const painterState = {
    drawable,
    setDrawable,
    isOpenCvLoaded: !!opencv,
    pickNewImg: openGallery,
    shouldAssist,
    setAssist,
    handleSave: () => annotationCTA("save"),
    handleLoad: () => annotationCTA("load"),
    handleUndo: () => painterRef.current.handleUndo(),
    canUndo: () => painterRef.current?.canUndo(),
    handleRedo: () => painterRef.current.handleRedo(),
    canRedo: () => painterRef.current?.canRedo(),
    showAnnotation: (shouldAssist) =>
      painterRef.current?.showAnnotation(shouldAssist),
    user,
    signOut: () =>
      signOut().then(() =>
        setSnackMessage({
          message: "Signed out Successfully",
          severity: "success",
        })
      ),
  };
  return (
    <div className="App">
      <header className="App-header">
        <div className={classes.root}>
          <CssBaseline />
          <TopBar
            drawerOpened={drawerOpened}
            isLoading={isLoading || !opencv}
            setDrawerOpened={setDrawerOpened}
            showGallery={showGallery}
          />
          {!showGallery && (
            <Drawer
              variant="permanent"
              className={clsx(classes.drawer, {
                [classes.drawerOpen]: drawerOpened,
                [classes.drawerClose]: !drawerOpened,
              })}
              classes={{
                paper: clsx({
                  [classes.drawerOpen]: drawerOpened,
                  [classes.drawerClose]: !drawerOpened,
                }),
              }}
            >
              <div className={classes.toolbar}>
                <IconButton onClick={() => setDrawerOpened(false)}>
                  {theme.direction === "rtl" ? (
                    <ChevronRightIcon />
                  ) : (
                    <ChevronLeftIcon />
                  )}
                </IconButton>
              </div>
              <Divider />
              <ToolbarButtons
                painterState={painterState}
                onMouseOver={() => setDrawerOpened(true)}
                onMouseOut={() => setDrawerOpened(false)}
              />
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
                  <Suspense fallback={<GalleryFallback />}>
                    <Gallery
                      images={images}
                      onImageSelected={onImageSelected}
                    />
                  </Suspense>
                </>
              ) : (
                <ReactPainter
                  key={image}
                  ref={painterRef}
                  width={window.innerWidth - 200}
                  height={window.innerHeight - 120}
                  isDrawable={drawable}
                  onSave={(blob) => console.log(blob)}
                  render={(renderProps) =>
                    onPainterRender(renderProps, painterState)
                  }
                  setLoading={setLoading}
                  image={image}
                  initialLineJoin={"round"}
                />
              )}
            </div>
          </main>
        </div>
        <OpenCvSnack messageData={snackMessage} />
        <Login
          open={authOpen}
          handleClose={(e, reason) => {
            if (reason !== "loginSuccess") {
              setPending("");
              showAuth(false);
            }
          }}
        />
      </header>
    </div>
  );
}

export default App;
