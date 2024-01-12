import { useEffect, useState } from "react";
import { Editor } from "./editor/Editor";
import { parser } from "@lezer/lezer";

function App() {
  const [value, setValue] = useState("a{b}c");

  useEffect(() => {
    const tree = parser.parse(value);
    const cursor = tree.cursor();
    do {
      console.log(`Node ${cursor.name} from ${cursor.from} to ${cursor.to}`);
    } while (cursor.next());
  }, [value]);

  return (
    <div>
      <Editor initialValue={value} onChange={setValue} />
    </div>
  );
}

export default App;
