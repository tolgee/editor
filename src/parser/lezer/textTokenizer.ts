import { fromCodePoint } from "@codemirror/state";
import {
  HtmlTagClose,
  HtmlTagCloseRoot,
  HtmlTagOpen,
  HtmlTagOpenRoot,
  Text,
  TextRoot,
} from "./tolgeeParser.terms";
import { ExternalTokenizer, InputStream } from "@lezer/lr";
import { isTagNameChar, isWhiteSpace } from "./helpers";

const ESCAPABLE_ROOT = new Set(["{", "}", "<", ">"]);
const ESCAPABLE_NESTED = new Set(["{", "}", "<", ">", "#"]);
const ENDING_ROOT = new Set(["{", "<"]);
const ENDING_NESTED = new Set(["{", "}", "<", "#"]);
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
  escapable: Set<string>;
  ending: Set<string>;
  textToken: number;
  openTag: number;
  closeTag: number;
};

function matchToken({
  input,
  escapable,
  ending,
  textToken,
  openTag,
  closeTag,
}: MatchTokenProps) {
  const char = fromCodePoint(input.next);
  if (char === "<") {
    return matchTag(input, textToken, openTag, closeTag);
  } else {
    return matchText(input, escapable, ending, textToken);
  }
}

export const textRoot = new ExternalTokenizer((input) => {
  return matchToken({
    input,
    escapable: ESCAPABLE_ROOT,
    ending: ENDING_ROOT,
    textToken: TextRoot,
    openTag: HtmlTagOpenRoot,
    closeTag: HtmlTagCloseRoot,
  });
});

export const text = new ExternalTokenizer((input) => {
  return matchToken({
    input,
    escapable: ESCAPABLE_NESTED,
    ending: ENDING_NESTED,
    textToken: Text,
    openTag: HtmlTagOpen,
    closeTag: HtmlTagClose,
  });
});
