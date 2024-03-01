const StateText = 0,
  StateEscapedMaybe = 1,
  StateEscaping = 2;

type State = typeof StateText | typeof StateEscapedMaybe | typeof StateEscaping;

const ESCAPABLE = new Set(["{", "}", "#"]);
const ESCAPE_CHAR = "'";

export const escapeIcuAll = (input: string) => {
  let state: State = StateText;
  const result: string[] = [];
  for (const char of input) {
    switch (state) {
      case StateText:
        if (char === ESCAPE_CHAR) {
          result.push(char);
          state = StateEscapedMaybe;
        } else if (ESCAPABLE.has(char)) {
          result.push(ESCAPE_CHAR);
          result.push(char);
          state = StateEscaping;
        } else {
          result.push(char);
        }
        break;
      case StateEscapedMaybe:
        if (ESCAPABLE.has(char)) {
          // escape the ESCAPE_CHAR
          result.push(ESCAPE_CHAR);
          // add another layer of escape on top
          result.push(ESCAPE_CHAR);
          result.push(char);
          state = StateEscaping;
        } else if (char === ESCAPE_CHAR) {
          // two escape chars - escape both
          result.push(ESCAPE_CHAR);
          result.push(char);
          result.push(ESCAPE_CHAR);
          state = StateText;
        } else {
          result.push(char);
          state = StateText;
        }
        break;
      case StateEscaping:
        if (ESCAPABLE.has(char)) {
          result.push(char);
        } else if (char === ESCAPE_CHAR) {
          result.push(ESCAPE_CHAR);
          result.push(ESCAPE_CHAR);
        } else {
          result.push(ESCAPE_CHAR);
          result.push(char);
          state = StateText;
        }
    }
  }

  if ([StateEscapedMaybe, StateEscaping].includes(state)) {
    result.push(ESCAPE_CHAR);
  }
  return result.join("");
};
