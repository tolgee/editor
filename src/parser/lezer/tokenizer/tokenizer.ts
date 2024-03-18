import { Text, TextNested } from "../tolgeeParser.terms";
import { ExternalTokenizer, InputStream } from "@lezer/lr";
import { matchText } from "./matchText";

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
