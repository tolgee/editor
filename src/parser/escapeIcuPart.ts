const StateText = 0,
  StateEscaped = 1,
  StateEscapedMaybe = 2,
  StateImEscaping = 3;

type State =
  | typeof StateText
  | typeof StateEscaped
  | typeof StateEscapedMaybe
  | typeof StateImEscaping;

const ESCAPABLE = new Set(["{"]);
// these chars don't have to e escaped, but escape them if already escaping
const INCLUDE_IN_ESCAPE = new Set([...ESCAPABLE, "}"]);
const ESCAPE_CHAR = "'";

export const escapeIcuVariant = (input: string) => {
  let state: State = StateText;
  const result: string[] = [];
  let lastEscapable: number | undefined = undefined;
  for (const char of input) {
    switch (state) {
      case StateText:
        if (char === ESCAPE_CHAR) {
          state = StateEscapedMaybe;
        } else if (ESCAPABLE.has(char)) {
          result.push(ESCAPE_CHAR);
          lastEscapable = result.length;
          // start my escape (meaning it wasn't there before)
          state = StateImEscaping;
        }
        result.push(char);
        break;
      case StateEscapedMaybe:
        if (ESCAPABLE.has(char)) {
          lastEscapable = result.length;
          // this escape was there before, I don't have to do anything
          state = StateEscaped;
        } else {
          state = StateText;
        }
        result.push(char);
        break;
      case StateEscaped:
        if (char === ESCAPE_CHAR) {
          state = StateText;
        } else if (INCLUDE_IN_ESCAPE.has(char)) {
          lastEscapable = result.length;
        }
        result.push(char);
        break;
      case StateImEscaping:
        if (char === ESCAPE_CHAR) {
          result.splice(lastEscapable! + 1, 0, ESCAPE_CHAR);
          state = StateEscapedMaybe;
        } else if (INCLUDE_IN_ESCAPE.has(char)) {
          lastEscapable = result.length;
        }
        result.push(char);
        break;
    }
  }

  if ([StateEscaped, StateImEscaping].includes(state)) {
    result.splice(lastEscapable! + 1, 0, ESCAPE_CHAR);
  }
  return result.join("");
};
