import { useMemo, useState } from "react";
import { Editor } from "./editor/Editor";
import { getTolgeePlurals } from "./parser/getTolgeePlurals";
import { EditorMulti } from "./editor/EditorMulti";

function App() {
  const [value, setValue] = useState(
    `I have {value, number, ::short} items in basket.
This is <i>italic</i>.`
  );
  const [placeholders, setPlaceholders] = useState(true);

  const parsedValue = useMemo(() => {
    return getTolgeePlurals(value, false);
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
          nested={false}
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
