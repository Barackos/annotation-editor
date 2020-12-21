interface Point {
  x: number;
  y: number;
}

export function rgbToString(colorRgb: any) {
  const { r, g, b } = colorRgb;
  return `rgb(${r}, ${g}, ${b})`;
}

export function initialize(ctxName: string, cv: any) {
  let hierarchy = new cv.Mat();
  let src = cv.imread(ctxName);
  const contours = findContours(src.clone(), cv, hierarchy);
  const points = getPoints(contours);
  const drawColor = new cv.Scalar(0, 255, 0);

  return {
    drawContours: () =>
      drawContours(ctxName, cv, src, contours, hierarchy, drawColor),
    points,
    destroy: () => {
      contours.delete();
      hierarchy.delete();
    },
  };
}

function getPoints(contours: any) {
  const points = {};
  for (let i = 0; i < 1; ++i) {
    const ci = contours.get(i);
    points[i] = [];
    for (let j = 0; j < ci.data32S.length; j += 2) {
      let p: Point = {
        x: ci.data32S[j],
        y: ci.data32S[j + 1],
      };
      points[i].push(p);
    }
  }
  return points;
}

function findContours(src: any, cv: any, hierarchy: any) {
  let contours = new cv.MatVector();
  cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY, 0);
  let ksize = new cv.Size(3, 3);
  let anchor = new cv.Point(-1, -1);
  cv.blur(src, src, ksize, anchor, cv.BORDER_DEFAULT);
  // cv.bilateralFilter(src, dst, 9, 75, 75, cv.BORDER_DEFAULT);
  cv.threshold(src, src, 190, 240, cv.THRESH_BINARY);

  let poly = new cv.MatVector();
  cv.findContours(
    src,
    contours,
    hierarchy,
    cv.RETR_CCOMP,
    cv.CHAIN_APPROX_SIMPLE
  );
  // approximates each contour to polygon
  for (let i = 0; i < contours.size(); ++i) {
    let tmp = new cv.Mat();
    let cnt = contours.get(i);
    //if (cv.isContourConvex(cnt)) cv.convexHull(cnt, tmp, false, true);
    cv.approxPolyDP(cnt, tmp, 3, true);
    poly.push_back(tmp);
    cnt.delete();
    tmp.delete();
  }
  contours.delete();
  return poly;
}

export function drawContours(
  ctxName: string,
  cv: any,
  src: any,
  contours: any,
  hierarchy: any,
  drawColor: string
) {
  // draw contours with random Scalar
  // "rgba(r, g, b, a)"
  let dst = src.clone();
  for (let i = 0; i < contours.size(); ++i) {
    cv.drawContours(dst, contours, i, drawColor, 2, cv.LINE_8, hierarchy, 100);
  }
  // ------
  // var corners = new cv.Mat();
  // var qualityLevel = 0.01;
  // var minDistance = 10;
  // var blockSize = 3;
  // var useHarrisDetector = true;
  // var k = 0.04;
  // var maxCorners = 60;

  // /// Apply corner detection
  // cv.goodFeaturesToTrack(
  //   src,
  //   corners,
  //   maxCorners,
  //   qualityLevel,
  //   minDistance,
  //   new cv.Mat(),
  //   blockSize,
  //   useHarrisDetector,
  //   k
  // );

  // /// Draw corners detected
  // var r = 4;
  // for (var i = 0; i < corners.rows; i++) {
  //   var x = corners.row(i).data32F[0];
  //   var y = corners.row(i).data32F[1];
  //   var color = new cv.Scalar(255, 0, 0, 1);
  //   let center = new cv.Point(x, y);
  //   cv.circle(dst, center, r, color, -1, 8, 0);
  // }
  // ------
  cv.imshow(ctxName, dst);
  //src.delete();
  dst.delete();
}
