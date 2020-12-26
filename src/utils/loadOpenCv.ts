type OnLoadCallback = (cv?: any) => void;

const getScriptTag = () =>
  document.getElementById("scriptOpenCv") as HTMLScriptElement;

export function addListener(onLoadCallback: OnLoadCallback) {
  getScriptTag().addEventListener("load", onLoadCallback);
}

export function removeLoadListener(onLoadCallback: OnLoadCallback) {
  getScriptTag().removeEventListener("load", onLoadCallback);
}

function loadOpenCv(onLoadCallback: OnLoadCallback) {
  const cv = (window as any).cv;
  if ((window as any).isOpenCvLoaded) {
    onLoadCallback(cv);
  } else {
    addListener(() => onLoadCallback(cv));
  }
}

export default loadOpenCv;
