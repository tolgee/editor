import { parser } from "./tolgeeParser";
import { LRLanguage, LanguageSupport } from "@codemirror/language";
import { styleTags, tags as t } from "@lezer/highlight";

/// A language provider based on the [Lezer Lezer
/// parser](https://github.com/lezer-parser/lezer-grammar), extended
/// with highlighting and indentation information.
export const lezerLanguage = LRLanguage.define({
  name: "icu-tolgee",
  parser: parser.configure({
    props: [
      styleTags({
        Param: t.variableName,
        TextRoot: t.string,
        Text: t.string,
        VariantDescriptor: t.variableName,
        "{ }": t.paren,
        HtmlTag: t.variableName,
      }),
    ],
  }),
});

/// Language support for Lezer grammars.
export function tolgeeSyntax() {
  return new LanguageSupport(lezerLanguage);
}
