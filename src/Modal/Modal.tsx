import { FunctionComponent } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Modal from "@material-ui/core/Modal";
import Backdrop from "@material-ui/core/Backdrop";
import Fade from "@material-ui/core/Fade";

const useStyles = makeStyles((theme) => ({
  modal: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  paper: {
    backgroundColor: theme.palette.background.paper,
    border: "2px solid #000",
    boxShadow: theme.shadows[5],
    padding: theme.spacing(2, 4, 3),
    minWidth: 400,
    minHeight: 300,
  },
}));

export interface ModalProps {
  open?: boolean;
  title?: string;
  modalContainerId?: string;
  handleClose?: (
    event: unknown,
    reason: "backdropClick" | "escapeKeyDown" | "loginSuccess"
  ) => void;
}

const TransitionsModal: FunctionComponent<ModalProps> = (props) => {
  const classes = useStyles();
  const {
    title,
    open = false,
    handleClose = () => {},
    modalContainerId = "modalContainer",
    children,
  } = props;

  return (
    <Modal
      className={classes.modal}
      open={open}
      onClose={handleClose}
      closeAfterTransition
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: 500,
      }}
    >
      <Fade in={open}>
        <div className={classes.paper}>
          {title && <h2>{title}</h2>}
          <div id={modalContainerId}>{children}</div>
        </div>
      </Fade>
    </Modal>
  );
};

export default TransitionsModal;
