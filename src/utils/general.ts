export const isDevMode = () => process.env.NODE_ENV === "development";

export const blobToFile = (theBlob: Blob, fileName: string): File => {
  var b: any = theBlob;
  //A Blob() is almost a File() - it's just missing the two properties below which we will add
  b.lastModifiedDate = new Date();
  b.name = fileName;

  //Cast to a File() type
  return theBlob as File;
};

function busyWait(continueOn: () => boolean, callback: Function) {
  const busyWaiter = () =>
    continueOn() ? setTimeout(busyWaiter, 300) : callback();
  busyWaiter();
}

export function waitOnLibrary<T>(
  predicate: () => boolean,
  exec: () => T
): Promise<T> {
  return new Promise((resolve) => busyWait(predicate, () => resolve(exec())));
}
