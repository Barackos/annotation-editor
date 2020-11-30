import "./App.scss";
import { Button, Typography } from "@material-ui/core";
import { useState } from "react";


const images = [
  "https://www.aljazeera.com/wp-content/uploads/2020/04/ecab8c7af42a439d9043b0ade6e1f05b_18.jpeg?fit=999%2C562",
  "https://images.theconversation.com/files/350865/original/file-20200803-24-50u91u.jpg?ixlib=rb-1.1.0&rect=37%2C29%2C4955%2C3293&q=45&auto=format&w=926&fit=clip",
  "https://ichef.bbci.co.uk/news/800/cpsprodpb/12A9B/production/_111434467_gettyimages-1143489763.jpg"
]

function App() {
  const [imageUrl, setImageUrl] = useState("");
  const onClick = () => {
    setImageUrl(images[Math.floor(Math.random() * 3)]);
  };
  return (
    <div className="App">
      <header className="App-header">
        <div className="container">
          <Typography variant="h2">Polygon Annotation Editor</Typography>
          <div
            style={{
              width: "500px",
              height: "500px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {imageUrl && (
              <img id="ourImage" src={imageUrl} className="image" alt="" />
            )}
            <br />
            <br />
            <Button variant="contained" color="primary" onClick={onClick}>
              Upload Image
            </Button>
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
