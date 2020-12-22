import { Skeleton } from "@material-ui/lab";

const Row = () => (
  <div
    style={{
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-evenly",
      // width: "calc(100vw - 48px)",
      width: "1000px",
      marginBottom: "64px",
    }}
  >
    <Skeleton variant="rect" animation="wave" width={300} height={200} />
    <Skeleton variant="rect" animation="wave" width={300} height={200} />
  </div>
);

export default function GalleryViewerFallback() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 112px)",
      }}
    >
      {new Array(4).fill(0).map((val, idx) => (
        <Row key={`row${idx}`} />
      ))}
    </div>
  );
}
