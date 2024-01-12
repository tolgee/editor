import { useEffect, useState } from "react";
import { Editor } from "./editor/Editor";
import { parser } from "./parser/tolgeeParser";

function App() {
  const [value, setValue] = useState("a{b}c");

  useEffect(() => {
    try {
      console.log(value);
      const tree = parser.configure({ strict: true }).parse(value);
      console.log(tree);
      const cursor = tree.cursor();
      do {
        console.log(`Node ${cursor.name} from ${cursor.from} to ${cursor.to}`);
      } while (cursor.next());
    } catch (e) {
      console.error(e);
    }
  }, [value]);

  return (
    <div>
      <Editor initialValue={value} onChange={setValue} />
    </div>
  );
}

export default App;
