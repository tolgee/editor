import { tags } from "@lezer/highlight";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";

export type EditorColors = {
  function: string;
  main: string;
  other: string;
};

export const TolgeeHighlight = (colors: EditorColors) =>
  syntaxHighlighting(
    HighlightStyle.define([
      { tag: tags.variableName, color: colors.other },
      { tag: tags.keyword, color: colors.function },
      { tag: tags.bracket, color: colors.other },
      { tag: tags.tagName, color: colors.other },
      { tag: tags.content, color: colors.main },
      { tag: tags.string, color: colors.main },
    ])
  );
