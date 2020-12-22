import { Skeleton } from "@material-ui/lab";

const Row = () => {
  const width = window.innerWidth - 118;
  const skeletonWidth = 250;
  const skeletons = Math.round(width / (skeletonWidth + 72));
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        // width: "calc(100vw - 48px)",
        // width: "1000px",
        width,
        marginBottom: "64px",
      }}
    >
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
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: window.innerHeight - 185,
      }}
    >
      {new Array(4).fill(0).map((val, idx) => (
        <Row key={`row${idx}`} />
      ))}
    </div>
  );
}
