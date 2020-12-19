import React, { useEffect, useState } from "react";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

export default function OpenCvSnack({ messageData }) {
  const [open, setOpen] = useState(true);
  const { message, severity } = messageData;
  const handleClose = () => setOpen(false);
  useEffect(() => {
    setOpen(true);
  }, [messageData]);
  return (
    <Snackbar
      open={open}
      onClose={handleClose}
      autoHideDuration={4000}
      key={message}
    >
      <Alert severity={severity}>{message}</Alert>
    </Snackbar>
  );
}
