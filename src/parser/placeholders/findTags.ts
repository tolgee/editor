import { fromCodePoint } from "@codemirror/state";
import {
  InputStreamLike,
  InputStreamLikeInstance,
} from "../lezer/tokenizer/InputStreamLike";

import { isTagNameChar, isWhiteSpace } from "../lezer/helpers";

const StateText = 0,
  StateTagStart = 1,
  StateTagName = 2,
  StateTagValid = 4,
  StateSelfClosingEnd = 5,
  StateParamsOrEnd = 6,
  StateParamName = 7,
  StateEqualOrEnd = 8,
  StateParamValueStart = 9,
  StateParamValue = 10;

type State =
  | typeof StateText
  | typeof StateTagStart
  | typeof StateTagName
  | typeof StateTagValid
  | typeof StateSelfClosingEnd
  | typeof StateParamsOrEnd
  | typeof StateParamName
  | typeof StateEqualOrEnd
  | typeof StateParamValueStart
  | typeof StateParamValue;

type TagType = "open" | "close" | "self-closed";

type ParamsType = Record<string, string | true | undefined>;

export type TagInfoType = {
  isTag: true;
  type: TagType;
  name: string;
  params: ParamsType;
  position: { start: number; end: number };
};

export function parseTag(input: InputStreamLikeInstance): TagInfoType | null {
  let state: State = StateText;
  let type: TagType = "open";
  let tagName = "";
  let paramName = "";
  let paramValue = "";
  let paramQuoteType: "'" | '"' = "'";
  let point: number;
  const position = { start: 0, end: 0 };
  const params: ParamsType = {};
  loop: while ((point = input.next) !== -1) {
    const char = fromCodePoint(point);
    switch (state) {
      case StateText:
        if (char === "<") {
          state = StateTagStart;
          position.start = input.pos;
        }
        break;
      case StateTagStart:
        if (char === "/") {
          type = "close";
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
          if (tagName === "") {
            break loop;
          }
          state = StateTagValid;
        } else if (char === "/") {
          if (tagName === "") {
            break loop;
          }
          type = "self-closed";
          state = StateSelfClosingEnd;
        } else if (isWhiteSpace(point)) {
          if (tagName === "") {
            break loop;
          }
          state = StateParamsOrEnd;
        } else if (isTagNameChar(point)) {
          tagName += char;
        } else {
          break loop;
        }

        break;

      case StateParamsOrEnd:
        if (isTagNameChar(point)) {
          paramName += char;
          state = StateParamName;
        } else if (char === "/") {
          type = "self-closed";
          state = StateSelfClosingEnd;
        } else if (char === ">") {
          state = StateTagValid;
        }
        break;

      case StateParamName:
        if (isTagNameChar(point)) {
          paramName += char;
        } else if (
          char === ">" ||
          char === "/" ||
          char === "=" ||
          isWhiteSpace(point)
        ) {
          params[paramName] = true;
          if (char === ">") {
            state = StateTagValid;
          } else if (char === "/") {
            state = StateSelfClosingEnd;
          } else if (char === "=") {
            state = StateParamValueStart;
          } else {
            state = StateEqualOrEnd;
          }
        } else {
          break loop;
        }
        break;

      case StateEqualOrEnd:
        if (char === ">") {
          state = StateTagValid;
        } else if (char === "/") {
          state = StateSelfClosingEnd;
        } else if (char === "=") {
          state = StateParamValueStart;
        } else if (isTagNameChar(point)) {
          state = StateParamName;
          paramName = char;
        } else if (!isWhiteSpace(point)) {
          break loop;
        }
        break;

      case StateParamValueStart:
        if (char === "'" || char === '"') {
          state = StateParamValue;
          paramQuoteType = char;
        } else if (!isWhiteSpace(point)) {
          break loop;
        }
        break;

      case StateParamValue:
        if (char === paramQuoteType) {
          params[paramName] = `${paramQuoteType}${paramValue}${paramQuoteType}`;
          paramName = "";
          paramValue = "";
          state = StateParamsOrEnd;
        } else {
          paramValue += char;
        }

        break;

      case StateSelfClosingEnd: {
        if (char === ">") {
          state = StateTagValid;
        } else {
          break loop;
        }
        break;
      }
      case StateTagValid:
        break loop;
    }
    input.advance();
  }
  if (state === StateTagValid && tagName) {
    position.end = input.pos;
    return {
      isTag: true,
      type,
      name: tagName,
      params,
      position,
    };
  } else {
    return null;
  }
}

export const findTags = (text: string) => {
  const input = InputStreamLike(text);
  const tags: TagInfoType[] = [];
  while (input.next !== -1) {
    const result = parseTag(input);
    if (result) {
      tags.push(result);
    }
  }
  return tags;
};
