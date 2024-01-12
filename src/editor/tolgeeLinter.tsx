import { Diagnostic, linter } from "@codemirror/lint";
import { formatParser } from "../FormatSimple/formatParser";
import { FormatError } from "../FormatSimple/FormatError";

export const tolgeeLinter = linter((view) => {
  let error: FormatError | undefined = undefined;

  try {
    formatParser(view.state.doc.toString());
  } catch (e) {
    if (e instanceof FormatError) {
      error = e;
    }
  }

  const diagnostics: Diagnostic[] = [];
  if (error) {
    diagnostics.push({
      from: error.index,
      to: error.index + 1,
      severity: "error",
      message: error.message,
    });
  }
  return diagnostics;
});
