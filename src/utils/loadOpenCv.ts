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
  const getCv = () => (window as any).cv;
  if ((window as any).isOpenCvLoaded) {
    onLoadCallback(getCv());
  } else {
    addListener(() => onLoadCallback(getCv()));
  }
}

export default loadOpenCv;
