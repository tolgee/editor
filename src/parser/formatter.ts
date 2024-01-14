import { DefaultParamType, TranslateParams } from "@tolgee/core";
import { parser } from "./tolgeeParser";
import { Param, Text } from "./tolgeeParser.terms";

const STATE_TEXT = 0,
  STATE_ESCAPE_MAYBE = 1,
  STATE_ESCAPE = 2;
const CHAR_ESCAPE = "'";
const ESCAPABLE = new Set(["{", CHAR_ESCAPE]);

type State =
  | typeof STATE_TEXT
  | typeof STATE_ESCAPE_MAYBE
  | typeof STATE_ESCAPE;

function removeEscape(text: string) {
  const result = [];
  let state: State = STATE_TEXT;
  for (const ch of text) {
    switch (state) {
      case STATE_TEXT:
        if (ch === CHAR_ESCAPE) {
          state = STATE_ESCAPE_MAYBE;
        } else {
          result.push(ch);
        }
        break;
      case STATE_ESCAPE_MAYBE:
        if (ESCAPABLE.has(ch)) {
          state = STATE_ESCAPE;
        } else {
          state = STATE_TEXT;
          result.push(CHAR_ESCAPE);
        }
        result.push(ch);
        break;
      case STATE_ESCAPE:
        if (ch === CHAR_ESCAPE) {
          state = STATE_TEXT;
        } else {
          result.push(ch);
        }
    }
  }
  if (state === STATE_ESCAPE_MAYBE) {
    result.push(CHAR_ESCAPE);
  }
  return result.join("");
}

export function formatter(
  translation: string,
  params?: TranslateParams<DefaultParamType>
) {
  const tree = parser.configure({ strict: true }).parse(translation);
  const cursor = tree.cursor();
  const result = [];
  do {
    const text = translation.substring(cursor.from, cursor.to);
    if (cursor.type.id === Text) {
      result.push(removeEscape(text));
    } else if (cursor.type.id === Param) {
      if (!params?.[text]) {
        throw Error(`Missing parameter '${text}'`);
      }
      result.push(params[text]);
    }
  } while (cursor.next());
  return result.join("");
}
