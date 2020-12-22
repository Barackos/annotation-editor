type OnLoadCallback = () => void;

const getScriptTag = () =>
  document.getElementById("scriptOpenCv") as HTMLScriptElement;

export function addListener(onLoadCallback: OnLoadCallback) {
  getScriptTag().addEventListener("load", onLoadCallback);
}

export function removeLoadListener(onLoadCallback: OnLoadCallback) {
  getScriptTag().removeEventListener("load", onLoadCallback);
}

function loadOpenCv(onLoadCallback: OnLoadCallback) {
  if ((window as any).isOpenCvLoaded) {
    onLoadCallback();
  } else {
    addListener(onLoadCallback);
  }
}

export default loadOpenCv;
