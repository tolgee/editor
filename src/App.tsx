import { useState } from "react";
import { Editor } from "./editor/Editor";

function App() {
  const [value, setValue] = useState("a{b}c");

  return (
    <div>
      <Editor initialValue={value} onChange={setValue} />
    </div>
  );
}

export default App;
