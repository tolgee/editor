import { useState } from "react";
import { Editor } from "./editor/Editor";

function App() {
  const [value, setValue] = useState(
    `Auto translated {TranslationCount, plural, one {# translation} other {# translations}} <hi></hi>`
  );

  return (
    <div>
      <Editor initialValue={value} onChange={setValue} />
    </div>
  );
}

export default App;
