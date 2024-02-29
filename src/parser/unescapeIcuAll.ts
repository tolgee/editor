const StateText = 0,
  StateEscapedMaybe = 1,
  StateEscaped = 2;

type State = typeof StateText | typeof StateEscapedMaybe | typeof StateEscaped;

const ESCAPABLE = new Set(["{", "}", "#"]);
const ESCAPE_CHAR = "'";

export const unescapeIcuAll = (input: string) => {
  let state: State = StateText;
  const result: string[] = [];
  for (const char of input) {
    switch (state) {
      case StateText:
        if (char === ESCAPE_CHAR) {
          state = StateEscapedMaybe;
        } else {
          result.push(char);
        }
        break;
      case StateEscapedMaybe:
        if (ESCAPABLE.has(char)) {
          state = StateEscaped;
        } else if (char === ESCAPE_CHAR) {
          state = StateText;
        } else {
          result.push(ESCAPE_CHAR);
          state = StateText;
        }
        result.push(char);
        break;
      case StateEscaped:
        if (char === ESCAPE_CHAR) {
          state = StateText;
        } else {
          result.push(char);
        }
    }
  }

  return result.join("");
};
