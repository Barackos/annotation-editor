import { makeStyles } from "@material-ui/core/styles";
import { Skeleton } from "@material-ui/lab";

const useStyles = makeStyles((theme) => ({
  row: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: "64px",
  },
  column: {
    display: "flex",
    flexDirection: "column",
    height: window.innerHeight - 185,
  },
}));

const Row = () => {
  const classes = useStyles();
  const width = window.innerWidth - 118;
  const skeletonWidth = 250;
  const skeletons = Math.round(width / (skeletonWidth + 72));
  return (
    <div className={classes.row} style={{ width }}>
      {new Array(skeletons).fill(0).map((_, idx) => (
        <Skeleton
          variant="rect"
          animation="wave"
          width={skeletonWidth}
          height={200}
          key={"skeleton" + idx}
        />
      ))}
    </div>
  );
};

export default function GalleryViewerFallback() {
  const classes = useStyles();
  return (
    <div className={classes.column}>
      {new Array(4).fill(0).map((_, idx) => (
        <Row key={`row${idx}`} />
      ))}
    </div>
  );
}
