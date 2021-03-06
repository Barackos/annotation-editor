import { isEqual } from "lodash";
import { findClosest } from "../utils/analysis";
import { DataStep, Point, SavedAnnotation } from "./../utils/types";
export function dataUrlToArrayBuffer(dataURI: string): [string, ArrayBuffer] {
  const type = dataURI.match(/:([^}]*);/)[1];
  const byteString = atob(dataURI.split(",")[1]);
  const ia = new Uint8Array(byteString.length);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }
  return [type, ia.buffer];
}

export const checkImageCrossOriginAllowed = (
  imageUrl: string
): Promise<{ anonymous: boolean; withCredentials: boolean }> =>
  new Promise((resolve) => {
    Promise.all(
      // have to map, else Promise.all would fail if any request fail
      [
        makeAjaxHeadRequest(imageUrl),
        makeAjaxHeadRequest(imageUrl, true),
      ].map((promise) =>
        promise
          .then((result) => ({ result, success: true }))
          .catch((error) => ({ error, success: false }))
      )
    )
      .then((results) =>
        resolve({
          anonymous: results[0].success,
          withCredentials: results[1].success,
        })
      )
      .catch(() =>
        resolve({
          anonymous: false,
          withCredentials: false,
        })
      );
  });

export function fileToUrl(file: File | Blob): string {
  const url = window.URL || (window as any).webkitURL;

  try {
    return url.createObjectURL(file);
  } catch (e) {
    return "";
  }
}

export function revokeUrl(objectUrl: string): void {
  try {
    window.URL.revokeObjectURL(objectUrl);
  } catch (e) {
    // fail silently because they is no major disruption to user exp
  }
}

export const canvasToBlob = (
  canvas: HTMLCanvasElement,
  type: string
): Promise<Blob> =>
  new Promise((resolve) => {
    if (canvas.toBlob) {
      canvas.toBlob((blob) => resolve(blob), type);
    } else {
      const dataURL = canvas.toDataURL(type);
      const [generatedType, buffer] = dataUrlToArrayBuffer(dataURL);
      resolve(new Blob([buffer], { type: generatedType }));
    }
  });

export interface ImportImageResponse {
  img: HTMLImageElement | ImageBitmap;
  imgWidth: number;
  imgHeight: number;
}

export const importImage = (
  image: File | Blob | string
): Promise<ImportImageResponse> =>
  new Promise((resolve, reject) => {
    if (typeof image === "string") {
      const img = new Image();
      img.onload = () => {
        resolve({
          img,
          imgWidth: img.naturalWidth,
          imgHeight: img.naturalHeight,
        });
      };
      checkImageCrossOriginAllowed(image).then(
        ({ anonymous, withCredentials }) => {
          if (anonymous || withCredentials) {
            img.crossOrigin = anonymous ? "anonymous" : "use-credentials";
            img.src = image;
          } else {
            reject();
          }
        }
      );
    } else {
      if ("createImageBitmap" in window) {
        window
          .createImageBitmap(image)
          .then((img) =>
            resolve({ img, imgWidth: img.width, imgHeight: img.height })
          )
          .catch((err) => reject(err));
      } else {
        const img = new Image();
        img.onload = () => {
          resolve({
            img,
            imgWidth: img.naturalWidth,
            imgHeight: img.naturalHeight,
          });
        };
        img.src = fileToUrl(image);
      }
    }
  });

type AnyFunction = (...params: any[]) => any;

export const composeFn = (...fns: AnyFunction[]) => (...args: any[]) =>
  fns.forEach((fn) => fn && fn(...args));

export const makeAjaxHeadRequest = (
  url: string,
  withCredentials: boolean = false
): Promise<any> =>
  new Promise((resolve, reject) => {
    try {
      const request = new XMLHttpRequest();
      request.open("HEAD", url);

      request.timeout = 1000;

      request.withCredentials = withCredentials;

      request.onreadystatechange = () => {
        if (request.readyState === 4) {
          if (request.status === 200) {
            resolve(request.response);
          } else {
            reject(request.response);
          }
        }
      };

      request.ontimeout = () => {
        reject("Timeout");
      };
      request.send();
    } catch (e) {
      reject(e);
    }
  });

export function isCycle(steps: DataStep[]) {
  return steps.length > 1 && isEqual(steps[0], steps[steps.length - 1]);
}

/**
 * find vertex from a list with dist < 30
 * @param position point to match distance with
 * @param list list to search from
 * @returns closest vertex, or undefined if not found
 */
export function findVertexToRemove(position: Point, list: DataStep[]) {
  const { point: vertex, dist } = findClosest(position, list);
  if (dist > 0 && dist < 30) {
    return vertex;
  }
  return undefined;
}

export function tryRemoveVertex(position: Point, list: DataStep[]) {
  const vertex = findVertexToRemove(position, list) || {};
  if (vertex) {
    const shape = isCycle(list);
    const filtered = list.filter((step) => !isEqual(step, vertex));
    if (shape && !isCycle(filtered)) {
      filtered.push(filtered[0]);
    }
    if (
      (isCycle(filtered) && filtered.length > 3) ||
      (!isCycle(filtered) && filtered.length > 1)
    ) {
      return filtered;
    }
    return [];
  }
  return list;
}

export function downloadObjectAsJson(
  exportObj: SavedAnnotation,
  exportName: string
) {
  var dataStr =
    "data:text/json;charset=utf-8," +
    encodeURIComponent(JSON.stringify(exportObj));
  var downloadAnchorNode = document.createElement("a");
  downloadAnchorNode.setAttribute("href", dataStr);
  downloadAnchorNode.setAttribute("download", exportName + ".json");
  document.body.appendChild(downloadAnchorNode); // required for firefox
  downloadAnchorNode.click();
  downloadAnchorNode.remove();
}
