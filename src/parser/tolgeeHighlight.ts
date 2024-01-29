import { tags } from "@lezer/highlight";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";

const VARIABLE_COLOR = "#008371";
const TAG_COLOR = "#822343";

export const tolgeeHighlight = syntaxHighlighting(
  HighlightStyle.define([
    { tag: tags.variableName, color: VARIABLE_COLOR },
    { tag: tags.keyword, color: VARIABLE_COLOR },
    { tag: tags.paren, color: VARIABLE_COLOR },
    { tag: tags.separator, color: VARIABLE_COLOR },
    { tag: tags.bracket, color: VARIABLE_COLOR },
    { tag: tags.tagName, color: TAG_COLOR },
  ])
);
