import { FunctionComponent, useEffect, useState } from "react";
import TransitionsModal, { ModalProps } from "../Modal";
import { AuthUtil, createFirebaseUI } from "../utils/auth";

type LoginProps = Omit<ModalProps, "title" | "modalContainerId">;
const container = "login_container";
const emptyUtil: AuthUtil = undefined;

const Login: FunctionComponent<LoginProps> = (props) => {
  const [authUtil, setAuthUtil] = useState(emptyUtil);
  const { open, handleClose } = props;
  useEffect(() => {
    if (!authUtil && open) {
      createFirebaseUI().then(setAuthUtil);
      return () => authUtil?.destroyUI();
    } else {
      if (open) {
        setTimeout(
          () =>
            authUtil.startUI(container, () =>
              handleClose?.("login", "loginSuccess")
            ),
          1
        );
      }
    }
  }, [authUtil, open, handleClose]);

  return (
    <TransitionsModal
      {...props}
      modalContainerId={container}
      title="Please Login"
    />
  );
};

export default Login;
