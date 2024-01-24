import { linter } from "@codemirror/lint";
import { parser } from "../parser/tolgeeParser";

export function simpleLezerLinter() {
  return linter((view) => {
    const { state } = view;
    const content = state.doc.toString();
    try {
      parser.configure({ strict: true }).parse(content);
    } catch (e) {
      const pos = Number((e as any).message.replace("No parse at ", ""));
      if (pos) {
        return [
          {
            from: pos,
            to: pos + 1,
            severity: "error",
            message:
              pos === content.length ? "Unexpected end" : "Unexpected token",
          },
        ];
      }
    }

    return [];
  });
}
