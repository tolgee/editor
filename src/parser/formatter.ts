import { DefaultParamType, TranslateParams } from "@tolgee/core";
import { parser } from "./tolgeeParser";
import {
  ExpressionClose,
  ExpressionOpen,
  Param,
  FormatExpression,
  PluralExpression,
  PluralPlaceholder,
  Text,
  TextRoot,
  VariantDescriptor,
  FormatModifier,
  FormatFunction,
} from "./tolgeeParser.terms";
import { updateNumberFormatOptions } from "./formatModifiers";

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

type Context = {
  type?: typeof FormatExpression | typeof PluralExpression;
  paramName?: string;
  variants?: Record<string, string>;
  activeVariant?: string;
  result: string;
  numberFormatOptions?: Intl.NumberFormatOptions;
  formatType?: "number";
};

export function formatter(
  locale: string,
  translation: string,
  params?: TranslateParams<DefaultParamType>
) {
  const tree = parser.configure({ strict: true }).parse(translation);
  const cursor = tree.cursor();
  const contextStack: Context[] = [{ result: "" }];

  function pushText(text: string) {
    const context = contextStack[contextStack.length - 1];
    if (context.activeVariant) {
      context.variants![context.activeVariant] += text;
    } else {
      context.result += text;
    }
  }

  do {
    const text = translation.substring(cursor.from, cursor.to);
    const context = contextStack[contextStack.length - 1];

    switch (cursor.type.id) {
      case TextRoot:
      case Text:
        if (context.activeVariant) {
          pushText(removeEscape(text));
        } else {
          pushText(removeEscape(text));
        }
        break;
      case ExpressionOpen:
        contextStack.push({ result: "" });
        break;
      case FormatExpression:
      case PluralExpression:
        context.type = cursor.type.id;
        break;
      case Param:
        context.paramName = text;
        break;
      case VariantDescriptor: {
        context.activeVariant = text;
        context.variants = { ...context.variants, [text]: "" };
        break;
      }
      case FormatFunction:
        context.formatType = text as any;
        context.numberFormatOptions = {};
        break;

      case FormatModifier:
        if (context.formatType === "number") {
          updateNumberFormatOptions(context.numberFormatOptions!, text);
        }
        break;

      case PluralPlaceholder:
        pushText(Number(params?.[context.paramName!]).toLocaleString(locale));
        break;
      case ExpressionClose: {
        if (!params?.[context.paramName!]) {
          throw Error(`Missing parameter '${context.paramName}'`);
        }
        if (context.type === FormatExpression) {
          if (context.formatType === "number") {
            pushText(
              Number(params[context.paramName!]).toLocaleString(
                locale,
                context.numberFormatOptions
              )
            );
          } else {
            pushText(String(params?.[context.paramName!]));
          }
        } else if (context.type === PluralExpression) {
          const value = Number(params[context.paramName!]);
          if (Number.isNaN(value)) {
            throw Error(`Parameter '${context.paramName}' is not a number`);
          }
          if (context.variants!["other"] === undefined) {
            throw Error(`Missing 'other' variant`);
          }
          const expectedVariant = new Intl.PluralRules(locale).select(value);
          if (context.variants![expectedVariant]) {
            context.result = context.variants![expectedVariant];
          } else {
            context.result = context.variants!["other"];
          }
        }
        const text = contextStack.pop()!.result;
        pushText(text);
        break;
      }
    }
  } while (cursor.next());
  return contextStack[0].result;
}
