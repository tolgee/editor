import { fromCodePoint } from "@codemirror/state";
import { InputStream } from "@lezer/lr";
import { InputStreamLikeInstance } from "./InputStreamLike";

const ESCAPE_CHAR = "'";

export const StateText = 0,
  StateEscaped = 1,
  StateEscapedMaybe = 2,
  StateEscapedTag = 3;

type State =
  | typeof StateText
  | typeof StateEscaped
  | typeof StateEscapedMaybe
  | typeof StateEscapedTag;

export function parseText(
  input: InputStreamLikeInstance,
  escapable: Set<string>,
  ending: Set<string>,
  startState: State = StateText,
  hardEnding?: Set<string>
) {
  let state = startState;
  const result: string[] = [];
  let point: number;
  loop: while ((point = input.next) !== -1) {
    const char = fromCodePoint(point);
    if (hardEnding?.has(char)) {
      break loop;
    }
    switch (state) {
      case StateText:
        if (char === ESCAPE_CHAR) {
          state = StateEscapedMaybe;
        } else if (ending.has(char)) {
          break loop;
        }
        result.push(char);
        break;
      case StateEscapedMaybe:
        if (escapable.has(char)) {
          state = StateEscaped;
        } else {
          state = StateText;
        }
        result.push(char);
        break;
      case StateEscaped:
        if (char === ESCAPE_CHAR) {
          if (fromCodePoint(input.peek(1)) === ESCAPE_CHAR) {
            // two escape chars in escape section
            input.advance();
            result.push(ESCAPE_CHAR);
          } else {
            state = StateText;
          }
        }
        result.push(char);
        break;
    }
    input.advance();
  }
  return result.join("");
}

export function matchText(
  input: InputStream,
  escapable: Set<string>,
  ending: Set<string>,
  token: number
) {
  const startPosition = input.pos;
  parseText(input, escapable, ending);
  if (startPosition < input.pos) {
    input.acceptToken(token);
  }
  return;
}
