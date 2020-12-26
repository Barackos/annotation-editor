import firebaseTypes from "firebase/index";
import firebaseui from "firebaseui/dist/index";
import { waitOnLibrary } from "./general";

export interface AuthUtil {
  startUI: (container: string, onSuccess: () => void) => void;
  destroyUI: () => Promise<void>;
}

const getFirebaseUi = (): typeof firebaseui => (window as any).firebaseui;
const getFirebaseAuth = (): typeof firebaseTypes.auth =>
  (window as any).firebase.auth;

function createUtil(): AuthUtil {
  const auth = getFirebaseAuth();
  const ui = new (getFirebaseUi().auth.AuthUI)(auth());

  return {
    startUI: (container, onSuccess) => {
      ui.start(`#${container}`, {
        signInOptions: [auth.GoogleAuthProvider.PROVIDER_ID],
        signInFlow: "popup",
        callbacks: {
          signInSuccessWithAuthResult: (result) => {
            console.log(result);
            (async () => onSuccess())();
            return false;
          },
          signInFailure: (error) => {
            console.log(error);
            return new Promise(() => {});
          },
        },
      });
    },
    destroyUI: ui.delete,
  };
}

function ensureAuthLoaded<T>(exec: () => T): Promise<T> {
  const waitOn = () =>
    !(window as any).firebaseUiLoaded || !(window as any).firebaseAuthLoaded;
  return waitOnLibrary(waitOn, exec);
}

export async function createFirebaseUI() {
  return await ensureAuthLoaded(createUtil);
}

export function observeUser(
  callback: (user: firebaseTypes.User | null) => any
) {
  const setObserver = () => getFirebaseAuth()().onAuthStateChanged(callback);
  return ensureAuthLoaded(setObserver);
}

export function signOut() {
  return ensureAuthLoaded(() => getFirebaseAuth()().signOut());
}
