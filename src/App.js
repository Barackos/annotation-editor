import "./App.scss";
import { Typography } from "@material-ui/core";
import Editor from "./Editor";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <div className="container">
          <Typography variant="h2" className="title" gutterBottom>
            Polygon Annotation Editor
          </Typography>
          <div className="editor">
            <Editor />
          </div>
        </div>
      </header>
    </div>
  );
}

export default App;
