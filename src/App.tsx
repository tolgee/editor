import { useMemo, useState } from "react";
import { Editor } from "./editor/Editor";
import { getTolgeePlurals } from "./parser/getTolgeePlurals";
import { EditorMulti } from "./editor/EditorMulti";

function App() {
  const [value, setValue] = useState(
    `{value, plural, one {I have # apple} other {I have # apples}}`
  );
  const [placeholders, setPlaceholders] = useState(true);

  const parsedValue = useMemo(() => {
    return getTolgeePlurals(value);
  }, [value]);

  const [plurals, setPlurals] = useState(Boolean(parsedValue));

  return (
    <div>
      {plurals ? (
        <EditorMulti
          value={parsedValue!}
          locale="en"
          placeholders={placeholders ? "full" : "none"}
        />
      ) : (
        <Editor
          initialValue={value}
          onChange={setValue}
          placeholders={placeholders ? "full" : "none"}
        />
      )}
      <div>
        <label>
          <input
            type="checkbox"
            checked={placeholders}
            onChange={() => setPlaceholders((val) => !val)}
          />
          Placeholders
        </label>
      </div>
      <div>
        <label>
          <input
            type="checkbox"
            checked={plurals}
            onChange={() => setPlurals((val) => !val)}
          />
          Plurals
        </label>
      </div>
    </div>
  );
}

export default App;
