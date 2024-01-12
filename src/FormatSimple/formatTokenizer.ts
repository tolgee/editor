function isWhitespace(ch: string) {
  return /\s/.test(ch);
}

const STATE_TEXT = 0,
  STATE_ESCAPE_MAYBE = 1,
  STATE_ESCAPE = 2,
  STATE_PARAM = 3,
  STATE_PARAM_AFTER = 4;

type State =
  | typeof STATE_TEXT
  | typeof STATE_ESCAPE_MAYBE
  | typeof STATE_ESCAPE
  | typeof STATE_PARAM
  | typeof STATE_PARAM_AFTER;

type Token = "text" | "bracket" | "variable" | undefined;

const CHAR_ESCAPE = "'";
const ESCAPABLE = new Set(["{", "}", CHAR_ESCAPE]);

const isAllowedInParam = (char: string) => {
  return /[0-9a-zA-Z_]/.test(char);
};

type TokenizerState = {
  state: State;
  token: Token;
};

export function formatTokenizer(current: TokenizerState, ch: string) {
  let newState: State = current.state;
  let token: Token | undefined;

  switch (current.state) {
    case STATE_TEXT:
      if (ch === CHAR_ESCAPE) {
        token = "text";
        newState = STATE_ESCAPE_MAYBE;
      } else if (ch === "{") {
        token = "bracket";
        newState = STATE_PARAM;
      } else {
        token = "text";
        newState = STATE_TEXT;
      }
      break;

    case STATE_ESCAPE_MAYBE:
      if (ESCAPABLE.has(ch)) {
        token = "text";
        newState = STATE_ESCAPE;
      } else {
        token = "text";
        newState = STATE_TEXT;
      }
      break;
    case STATE_ESCAPE:
      if (ch === CHAR_ESCAPE) {
        token = "text";
        newState = STATE_TEXT;
      } else {
        token = "text";
        newState = STATE_ESCAPE;
      }
      break;
    case STATE_PARAM:
      if (ch === "}") {
        token = "bracket";
        newState = STATE_TEXT;
      } else if (isAllowedInParam(ch)) {
        token = "variable";
        newState = STATE_PARAM;
      } else if (!isWhitespace(ch)) {
        newState = STATE_PARAM;
      } else {
        newState = STATE_PARAM_AFTER;
      }
      break;
    case STATE_PARAM_AFTER:
      if (ch == "}") {
        token = "bracket";
        newState = STATE_TEXT;
      } else if (isWhitespace(ch)) {
        newState = STATE_PARAM_AFTER;
      }
  }
  current.state = newState;
  current.token = token;
  return current;
}
