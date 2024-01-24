import { Diagnostic, linter } from "@codemirror/lint";
import { parse } from "@formatjs/icu-messageformat-parser";

export const tolgeeLinter = linter((view) => {
  let error: any | undefined = undefined;

  try {
    parse(view.state.doc.toString(), {
      captureLocation: true,
      ignoreTag: false,
    });
  } catch (e) {
    error = e;
  }

  const diagnostics: Diagnostic[] = [];
  if (error) {
    diagnostics.push({
      from: error.location.start.offset,
      to: error.location.end.offset,
      severity: "error",
      message: error.message,
    });
  }
  return diagnostics;
});
