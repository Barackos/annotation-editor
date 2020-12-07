import "./App.scss";
import Painter from "./Painter";
import { Typography } from "@material-ui/core";
import { useState } from "react";

const images = [
  "https://images-na.ssl-images-amazon.com/images/I/61qNHbx9LDL._AC_SL1200_.jpg",
  "https://images-na.ssl-images-amazon.com/images/I/91tCuetFu6L._AC_SL1500_.jpg",
  "https://images-na.ssl-images-amazon.com/images/I/71Oy%2BEllDAL._AC_SL1024_.jpg",
];

function App() {
  const [imageUrl, setImageUrl] = useState(images[0]);
  const uploadFn = () => {
    setImageUrl(images[Math.floor(Math.random() * 3)]);
  };
  return (
    <div className="App">
      <header className="App-header">
        <div className="container">
          <Typography variant="h2" className="title" gutterBottom>
            Polygon Annotation Editor
          </Typography>
          <div className="editor">
            {imageUrl && <Painter imgUrl={imageUrl} uploadFn={uploadFn} />}
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
