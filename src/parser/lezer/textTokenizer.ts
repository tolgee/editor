import { fromCodePoint } from "@codemirror/state";
import {
  Dialect_tags,
  HtmlTagClose,
  HtmlTagCloseNested,
  HtmlTagOpen,
  HtmlTagOpenNested,
  Text,
  TextNested,
} from "./tolgeeParser.terms";
import { ExternalTokenizer, InputStream, Stack } from "@lezer/lr";
import { isTagNameChar, isWhiteSpace } from "./helpers";

function getEscapable(isNested: boolean, tags: boolean) {
  const result = new Set(["{", "}"]);
  if (isNested) {
    result.add("#");
  }
  if (tags) {
    result.add("<");
    result.add(">");
  }
  return result;
}

function getEnding(isNested: boolean, tags: boolean) {
  const result = new Set(["{"]);
  if (isNested) {
    result.add("#");
    result.add("}");
  }
  if (tags) {
    result.add("<");
  }
  return result;
}

const ESCAPE_CHAR = "'";

function matchText(
  input: InputStream,
  escapable: Set<string>,
  ending: Set<string>,
  token: number
) {
  const StateText = 0,
    StateEscaped = 1,
    StateEscapedMaybe = 2,
    StateEscapedTag = 3;

  type State =
    | typeof StateText
    | typeof StateEscaped
    | typeof StateEscapedMaybe
    | typeof StateEscapedTag;

  const startPosition = input.pos;
  let state: State = StateText;
  loop: while (input.next !== -1) {
    const point = input.next;
    const char = fromCodePoint(point);
    switch (state) {
      case StateText:
        if (char === ESCAPE_CHAR) {
          state = StateEscapedMaybe;
        } else if (ending.has(char)) {
          break loop;
        }
        break;
      case StateEscapedMaybe:
        if (escapable.has(char)) {
          state = StateEscaped;
        } else {
          state = StateText;
        }
        break;
      case StateEscaped:
        if (char === ESCAPE_CHAR) {
          state = StateText;
        }
        break;
    }
    input.advance();
  }
  if (startPosition < input.pos) {
    input.acceptToken(token);
  }
  return;
}

function matchTag(
  input: InputStream,
  textTagId: number,
  openTagId: number,
  closeTagId: number
) {
  const StateTagOpen = 0,
    StateTagSlash = 1,
    StateTagName = 2,
    StateTagEnd = 3,
    StateTagValid = 4;

  type State =
    | typeof StateTagOpen
    | typeof StateTagSlash
    | typeof StateTagName
    | typeof StateTagEnd
    | typeof StateTagValid;

  const startPosition = input.pos;
  let state: State = StateTagOpen;
  let isClosing = false;
  let tagName = "";
  loop: while (input.next !== -1) {
    const point = input.next;
    const char = fromCodePoint(point);
    switch (state) {
      case StateTagOpen:
        if (char === "<") {
          state = StateTagSlash;
        } else {
          break loop;
        }
        break;
      case StateTagSlash:
        if (char === "/") {
          isClosing = true;
          state = StateTagName;
        } else if (isTagNameChar(point)) {
          tagName += char;
          state = StateTagName;
        } else {
          break loop;
        }
        break;
      case StateTagName:
        if (char === ">") {
          state = StateTagValid;
        } else if (isWhiteSpace(point)) {
          if (tagName === "") {
            break loop;
          } else {
            state = StateTagEnd;
          }
        } else if (isTagNameChar(point)) {
          tagName += char;
        } else {
          break loop;
        }
        break;
      case StateTagEnd:
        if (char === ">") {
          state = StateTagValid;
        } else if (!isWhiteSpace(point)) {
          break loop;
        }
        break;
      case StateTagValid:
        break loop;
    }
    input.advance();
  }
  if (startPosition >= input.pos) {
    return;
  }
  if (state === StateTagValid) {
    input.acceptToken(isClosing ? closeTagId : openTagId);
  } else {
    input.acceptToken(textTagId);
  }
  return;
}

type MatchTokenProps = {
  input: InputStream;
  stack: Stack;
  escapable: Set<string>;
  ending: Set<string>;
  textToken: number;
  openTag: number;
  closeTag: number;
};

function matchToken({
  input,
  stack,
  escapable,
  ending,
  textToken,
  openTag,
  closeTag,
}: MatchTokenProps) {
  const char = fromCodePoint(input.next);
  const tags = stack.dialectEnabled(Dialect_tags);
  if (char === "<" && tags) {
    return matchTag(input, textToken, openTag, closeTag);
  } else {
    return matchText(input, escapable, ending, textToken);
  }
}

export const text = new ExternalTokenizer((input, stack) => {
  const tags = stack.dialectEnabled(Dialect_tags);
  return matchToken({
    input,
    stack,
    escapable: getEscapable(false, tags),
    ending: getEnding(false, tags),
    textToken: Text,
    openTag: HtmlTagOpen,
    closeTag: HtmlTagClose,
  });
});

export const textNested = new ExternalTokenizer((input, stack) => {
  const tags = stack.dialectEnabled(Dialect_tags);
  return matchToken({
    input,
    stack,
    escapable: getEscapable(true, tags),
    ending: getEnding(true, tags),
    textToken: TextNested,
    openTag: HtmlTagOpenNested,
    closeTag: HtmlTagCloseNested,
  });
});
