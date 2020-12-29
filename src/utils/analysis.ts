import { ColorRgb, ColorSetter, Point } from "./types";
import { flatMap } from "lodash";

export function rgbToString(colorRgb: ColorRgb) {
  const { r, g, b } = colorRgb;
  return `rgb(${r}, ${g}, ${b})`;
}

export function initialize(ctxName: string, cv: any, colorSetter: ColorSetter) {
  let hierarchy = new cv.Mat();
  let src = cv.imread(ctxName);
  const contours = findContours(src.clone(), cv, hierarchy);
  const points = getPoints(contours);
  const points_flattened = flatMap(points);
  const drawColor = new cv.Scalar(0, 255, 0, 1);

  setOptimalStrokeColor(cv, colorSetter);

  return {
    drawContours: () =>
      drawContours(ctxName, cv, src, contours, hierarchy, drawColor),
    points,
    points_flattened,
    destroy: () => {
      contours.delete();
      hierarchy.delete();
    },
  };
}

export type ImageAnalyzer = ReturnType<typeof initialize>;

function setOptimalStrokeColor(cv: any, colorSetter: ColorSetter) {
  const src = cv.imread("canvasInput");
  const mean = cv.mean(src);
  const oppose = (scalar: number) => (scalar < 128 ? 255 : 0);
  colorSetter({
    r: oppose(mean[0]),
    g: oppose(mean[1]),
    b: oppose(mean[2]),
  });
}

function getPoints(contours: any) {
  const points: Point[][] = [];
  for (let i = 0; i < contours.size(); ++i) {
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
  cv.bilateralFilter(src.clone(), src, 3, 75, 75, cv.BORDER_DEFAULT);
  // cv.threshold(src, src, 180, 250, cv.THRESH_BINARY);
  // cv.adaptiveThreshold(
  //   src.clone(),
  //   src,
  //   200,
  //   cv.ADAPTIVE_THRESH_GAUSSIAN_C,
  //   cv.THRESH_BINARY,
  //   3,
  //   2
  // );

  cv.Canny(src.clone(), src, 100, 200, 3, false);
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
  drawColor: any
) {
  // draw contours with random Scalar
  // "rgba(r, g, b, a)"
  let contoursDst = cv.Mat.zeros(src.rows, src.cols, cv.CV_8UC4);
  for (let i = 0; i < contours.size(); ++i) {
    cv.drawContours(
      contoursDst,
      contours,
      i,
      drawColor,
      2,
      cv.LINE_8,
      hierarchy,
      100
    );
  }

  // let dst = new cv.Mat();
  let dst = src.clone();
  cv.addWeighted(src, 0.75, contoursDst, 1, 0, dst, -1);

  // let dst = src.clone();

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
  // shiThomasCornerDetection(cv, src, dst);
  cv.imshow(ctxName, dst);
  //src.delete();
  dst.delete();
}

/**
 * Measures distance between 2 points
 */
function distance(point1: Point, point2: Point) {
  const { x: x1, y: y1 } = point1;
  const { x: x2, y: y2 } = point2;
  return Math.hypot(y2 - y1, x2 - x1);
}

/**
 * Closest point to a base point
 * @param base source point
 * @param list points to measure distance from
 * @returns closest point and its distance from base
 */
export function findClosest(base: Point, list: Point[]) {
  if (list.length === 0) return { dist: 0, point: base };
  const [first, ...rest] = list;
  let dist = distance(base, first);
  let point = first;
  rest.forEach((p) => {
    const calcDist = distance(base, p);
    if (calcDist < dist) {
      dist = calcDist;
      point = p;
    }
  });
  return {
    point,
    dist,
  };
}

export function findClosestWithContour(base: Point, lists: Point[][]) {
  if (lists.length === 0) return { dist: 0, point: base, i: undefined };
  const [firstList, ...rest] = lists;
  const firstResult = findClosest(base, firstList);
  let i = 0;
  let dist = firstResult.dist;
  let point = firstResult.point;

  rest.forEach((list, idx) => {
    const { dist: newDist, point: newPoint } = findClosest(base, list);
    if (newDist < dist) {
      dist = newDist;
      point = newPoint;
      i = idx;
    }
  });

  return {
    dist,
    point,
    i,
  };
}

// function shiThomasCornerDetection(cv, src, dst) {
//   const img = src.clone();
//   var img_gray = new cv.Mat();
//   var img_color = new cv.Mat(); // Opencv likes RGB
//   cv.cvtColor(img, img_gray, cv.COLOR_RGBA2GRAY, 0);
//   cv.cvtColor(img, img_color, cv.COLOR_RGBA2RGB, 0);
//   img.delete();

//   var corners = new cv.Mat();
//   var qualityLevel = 0.01;
//   var minDistance = 10;
//   var blockSize = 3;
//   var useHarrisDetector = true;
//   var k = 0.04;
//   var maxCorners = 1000;

//   /// Apply corner detection
//   cv.goodFeaturesToTrack(
//     img_gray,
//     corners,
//     maxCorners,
//     qualityLevel,
//     minDistance,
//     new cv.Mat(),
//     blockSize,
//     useHarrisDetector,
//     k
//   );
//   img_gray.delete();
//   img_color.delete();

//   /// Draw corners detected
//   var r = 4;
//   for (var i = 0; i < corners.rows; i++) {
//     var x = corners.row(i).data32F[0];
//     var y = corners.row(i).data32F[1];
//     // var color = new cv.Scalar(10, 200, 10);
//     var color = new cv.Scalar(255, 0, 0, 1);
//     let center = new cv.Point(x, y);
//     cv.circle(dst, center, r, color, -1, 8, 0);
//   }
//   /// Show what you got
//   // cv.imshow(ctxName, dst);
//   corners.delete();
// }
