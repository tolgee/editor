import {
  InvalidExpressionContent,
  Text,
  TextNested,
} from "../tolgeeParser.terms";
import { ExternalTokenizer, InputStream } from "@lezer/lr";
import { matchText } from "./matchText";
import { fromCodePoint } from "@codemirror/state";

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

// Everything inside a `{...}` up to the closing brace, used when the contents
// aren't a valid ICU expression (e.g. `placeholder:space`). Kept as one token so
// the whole `{...}` stays a single Expression node — else RTL bidi isolation
// splits it. `extend: true` lets it coexist with the real `Param`/`space` tokens
// so both parses are explored; InvalidExpressionBody's negative dynamicPrecedence
// then makes a valid format/select parse win whenever one exists.
export const invalidExpression = new ExternalTokenizer(
  (input) => {
    const startPosition = input.pos;
    while (input.next !== -1) {
      const char = fromCodePoint(input.next);
      if (char === "{" || char === "}") {
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
