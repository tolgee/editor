import {
  InvalidExpressionContent,
  Text,
  TextNested,
} from "../tolgeeParser.terms";
import { ExternalTokenizer, InputStream } from "@lezer/lr";
import { matchText } from "./matchText";
import { fromCodePoint } from "@codemirror/state";
import { isWhiteSpace } from "../helpers";

function getEscapable(isNested: boolean) {
  const result = new Set(["{", "}"]);
  if (isNested) {
    result.add("#");
  }
  return result;
}

function getEnding(isNested: boolean) {
  const result = new Set(["{"]);
  if (isNested) {
    result.add("#");
    result.add("}");
  }

  return result;
}

type MatchTokenProps = {
  input: InputStream;
  escapable: Set<string>;
  ending: Set<string>;
  textToken: number;
};

function matchToken({ input, escapable, ending, textToken }: MatchTokenProps) {
  return matchText(input, escapable, ending, textToken);
}

export const text = new ExternalTokenizer((input) => {
  return matchToken({
    input,
    escapable: getEscapable(false),
    ending: getEnding(false),
    textToken: Text,
  });
});

export const textNested = new ExternalTokenizer((input) => {
  return matchToken({
    input,
    escapable: getEscapable(true),
    ending: getEnding(true),
    textToken: TextNested,
  });
});

// Body of a `{...}` that isn't valid ICU (e.g. `placeholder:space`), kept as one
// token so the whole `{...}` stays a single Expression node (else RTL bidi
// isolation splits it). Never starts on whitespace/comma/brace and stops at a
// comma, so on valid input it can't out-span `Param`; `extend: true` + the
// negative dynamicPrecedence on InvalidExpressionBody then let the real parse win.
export const invalidExpression = new ExternalTokenizer(
  (input) => {
    const first = input.next;
    if (first === -1 || isWhiteSpace(first)) {
      return;
    }
    const firstChar = fromCodePoint(first);
    if (firstChar === "{" || firstChar === "}" || firstChar === ",") {
      return;
    }
    const startPosition = input.pos;
    while (input.next !== -1) {
      const char = fromCodePoint(input.next);
      if (char === "{" || char === "}" || char === ",") {
        break;
      }
      input.advance();
    }
    if (startPosition < input.pos) {
      input.acceptToken(InvalidExpressionContent);
    }
  },
  { extend: true }
);
