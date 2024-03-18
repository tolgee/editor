import { parser } from "./lezer/tolgeeParser";
import { LRLanguage, LanguageSupport } from "@codemirror/language";
import { styleTags, tags as t } from "@lezer/highlight";

/// A language provider based on the [Lezer
/// parser](https://github.com/lezer-parser/lezer-grammar), extended
/// with highlighting and indentation information.
export const lezerLanguage = (nested: boolean) =>
  LRLanguage.define({
    name: "icu-tolgee",
    parser: parser.configure({
      top: nested ? "Nested" : "Root",
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
export function tolgeeSyntax(nested: boolean) {
  return new LanguageSupport(lezerLanguage(nested));
}
