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
        TextRoot: t.string,
        Text: t.string,
        PluralPlaceholder: t.keyword,
        VariantDescriptor: t.keyword,
        FormatFunction: t.keyword,
        SelectFunction: t.keyword,
        Param: t.variableName,
        FormatStyle: t.variableName,
        "{ }": t.paren,
        Sep: t.separator,
        "< >": t.tagName,
        Slash: t.tagName,
        TagName: t.tagName,
      }),
    ],
  }),
});

/// Language support for Lezer grammars.
export function tolgeeSyntax() {
  return new LanguageSupport(lezerLanguage);
}
