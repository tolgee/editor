import { parser } from "./tolgeeParser";
import { LRLanguage, LanguageSupport } from "@codemirror/language";

/// A language provider based on the [Lezer Lezer
/// parser](https://github.com/lezer-parser/lezer-grammar), extended
/// with highlighting and indentation information.
export const lezerLanguage = LRLanguage.define({
  name: "icu-tolgee",
  parser: parser.configure({}),
});

/// Language support for Lezer grammars.
export function tolgeeSyntax() {
  return new LanguageSupport(lezerLanguage);
}
