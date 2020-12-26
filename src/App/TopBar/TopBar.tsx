import { FunctionComponent } from "react";
import clsx from "clsx";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import MenuIcon from "@material-ui/icons/Menu";
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
}));

interface TopBarProps {
  showGallery: boolean;
  drawerOpened: boolean;
  isLoading: boolean;
  setDrawerOpened: (shouldOpen: boolean) => void;
}

const TopBar: FunctionComponent<TopBarProps> = (props) => {
  const { showGallery, drawerOpened, setDrawerOpened, isLoading } = props;
  const classes = useStyles();
  return (
    <AppBar
      position="fixed"
      className={clsx(classes.appBar, {
        [classes.appBarShift]: !showGallery && drawerOpened,
      })}
    >
      <Toolbar>
        {!showGallery && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            onClick={() => setDrawerOpened(true)}
            edge="start"
            className={clsx(classes.menuButton, {
              [classes.hide]: drawerOpened,
            })}
          >
            <MenuIcon />
          </IconButton>
        )}
        <Typography variant="h4" noWrap>
          Polygon Annotation Editor
        </Typography>
      </Toolbar>
      {isLoading && <LinearProgress />}
    </AppBar>
  );
};

export default TopBar;
