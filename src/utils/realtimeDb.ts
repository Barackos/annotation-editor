import { DataStep } from "./types";
import firebaseTypes from "firebase/index";
import { waitOnLibrary } from "./general";

const getDatabase = (): typeof firebaseTypes.database =>
  (window as any).firebase.database;

function ensureDbLoaded<T>(exec: () => T): Promise<T> {
  const waitOn = () => !(window as any).firebaseDbLoaded;
  return waitOnLibrary(waitOn, exec);
}

export async function loadAnnotation(user: firebaseTypes.User, image: string) {
  return await ensureDbLoaded(() => {
    const db = getDatabase()();
    return db
      .ref(`users/${user.uid}/annotations/${image}`)
      .once("value")
      .then(
        (value) => value.val(),
        (onrejected) => {
          alert(onrejected);
          return onrejected;
        }
      );
  });
}

export async function saveAnnotation(
  user: firebaseTypes.User,
  image: string,
  steps: DataStep[]
) {
  return await ensureDbLoaded(() => {
    const db = getDatabase()();
    return db.ref(`users/${user.uid}/annotations/${image}`).set(steps);
  });
}
