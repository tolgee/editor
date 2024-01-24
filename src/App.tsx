import { useMemo, useState } from "react";
import { Editor } from "./editor/Editor";
import { getPlaceholders } from "./parser/getPlaceholders";

function App() {
  const [value, setValue] = useState(
    `This {variable} and this is <hi>tag</hi>`
  );
  const [placeholders, setPlaceholders] = useState(true);

  const tokens = useMemo(() => {
    try {
      return JSON.stringify(getPlaceholders(value), null, 2);
    } catch {
      // pass
    }
  }, [value]);

  return (
    <div>
      <Editor
        initialValue={value}
        onChange={setValue}
        placeholders={placeholders ? "full" : "none"}
        allowedNewPlaceholders={[
          { type: "hash" },
          { type: "variable", name: "variable" },
        ]}
      />
      <label>
        <input
          type="checkbox"
          checked={placeholders}
          onChange={() => setPlaceholders((placeholders) => !placeholders)}
        />
        Placeholders
      </label>
      <pre>{tokens}</pre>
    </div>
  );
}

export default App;
