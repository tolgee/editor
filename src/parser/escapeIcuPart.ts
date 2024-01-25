const StateText = 0,
  StateEscaped = 1,
  StateEscapedMaybe = 2;

type State = typeof StateText | typeof StateEscaped | typeof StateEscapedMaybe;

const ESCAPABLE = new Set(["{", "}", "<", "#"]);
const ESCAPE_CHAR = "'";

export const escapeIcuVariant = (input: string) => {
  let state: State = StateText;
  const result: string[] = [];
  for (const char of input) {
    switch (state) {
      case StateText:
        if (char === ESCAPE_CHAR) {
          state = StateEscapedMaybe;
        } else if (ESCAPABLE.has(char)) {
          result.push(ESCAPE_CHAR);
          state = StateEscaped;
        }
        result.push(char);
        break;
      case StateEscapedMaybe:
        if (ESCAPABLE.has(char)) {
          state = StateEscaped;
        } else {
          state = StateText;
        }
        result.push(char);
        break;
      case StateEscaped:
        if (char === ESCAPE_CHAR) {
          state = StateText;
        }
        result.push(char);
        break;
    }
  }

  if (state === StateEscaped) {
    result.push(ESCAPE_CHAR);
  }
  return result.join("");
};
