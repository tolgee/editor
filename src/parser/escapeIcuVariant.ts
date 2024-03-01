const StateText = 0,
  StateEscape = 1,
  StateEscapeMaybe = 2,
  StateImEscaping = 3,
  StateEscapeEndMaybe = 4,
  StateImEscapingEndMaybe = 5;

type State =
  | typeof StateText
  | typeof StateEscape
  | typeof StateEscapeMaybe
  | typeof StateImEscaping
  | typeof StateEscapeEndMaybe
  | typeof StateImEscapingEndMaybe;

const ESCAPABLE = new Set(["{", "}", "#"]);
// these chars don't have to e escaped, but escape them if already escaping
const TO_ESCAPE = new Set(["{", "}"]);
const ESCAPE_CHAR = "'";

export const escapeIcuVariant = (input: string) => {
  let state: State = StateText;
  const result: string[] = [];
  let lastEscapable: number | undefined = undefined;
  for (const char of input) {
    switch (state) {
      case StateText:
        if (char === ESCAPE_CHAR) {
          state = StateEscapeMaybe;
        } else if (TO_ESCAPE.has(char)) {
          result.push(ESCAPE_CHAR);
          lastEscapable = result.length;
          // start my escape (meaning it wasn't there before)
          state = StateImEscaping;
        }
        result.push(char);
        break;
      case StateEscapeMaybe:
        if (ESCAPABLE.has(char)) {
          lastEscapable = result.length;
          // this escape was there before, I don't have to do anything
          state = StateEscape;
        } else {
          state = StateText;
        }
        result.push(char);
        break;
      case StateEscape:
        if (char === ESCAPE_CHAR) {
          state = StateEscapeEndMaybe;
        } else if (ESCAPABLE.has(char)) {
          lastEscapable = result.length;
        }
        result.push(char);
        break;
      case StateEscapeEndMaybe:
        if (char === ESCAPE_CHAR) {
          state = StateEscape;
          result.push(ESCAPE_CHAR);
        } else {
          result.push(char);
          state = StateText;
        }
        break;
      case StateImEscaping:
        if (char === ESCAPE_CHAR) {
          state = StateImEscapingEndMaybe;
        } else if (TO_ESCAPE.has(char)) {
          lastEscapable = result.length;
        }
        result.push(char);
        break;
      case StateImEscapingEndMaybe:
        if (char === ESCAPE_CHAR) {
          state = StateEscape;
          result.push(ESCAPE_CHAR);
        } else {
          result.splice(lastEscapable! + 1, 0, ESCAPE_CHAR);
          result.push(char);
          state = StateText;
        }
        break;
    }
  }

  if ([StateEscape, StateImEscaping].includes(state)) {
    result.splice(lastEscapable! + 1, 0, ESCAPE_CHAR);
  } else if (state === StateEscapeMaybe) {
    result.push(ESCAPE_CHAR);
  }
  return result.join("");
};
