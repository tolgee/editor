import { DefaultParamType, TranslateParams } from "@tolgee/core";
import { parser } from "../parser/lezer/tolgeeParser";
import {
  ExpressionClose,
  ExpressionOpen,
  Param,
  FormatExpression,
  PluralPlaceholder,
  Text,
  TextNested,
  VariantDescriptor,
  FormatStyle,
  FormatFunction,
  SelectExpression,
  SelectVariant,
} from "../parser/lezer/tolgeeParser.terms";
import { updateNumberFormatOptions } from "./formatModifiers";
import { unescapeIcuAll } from "../parser/unescapeIcuAll";

// const StateText = 0,
//   StateEscapedMaybe = 1,
//   StateEscaped = 2,
//   StateEscapeEndMaybe = 3;
// const ESCAPE_CHAR = "'";
// const ESCAPABLE = new Set(["{", ESCAPE_CHAR]);

// type State =
//   | typeof StateText
//   | typeof StateEscapedMaybe
//   | typeof StateEscaped
//   | typeof StateEscapeEndMaybe;

// function removeEscape(text: string) {
//   const result = [];
//   let state: State = StateText;
//   for (const char of text) {
//     switch (state) {
//       case StateText:
//         if (char === ESCAPE_CHAR) {
//           state = StateEscapedMaybe;
//         } else {
//           result.push(char);
//         }
//         break;
//       case StateEscapedMaybe:
//         if (ESCAPABLE.has(char)) {
//           state = StateEscaped;
//         } else {
//           state = StateText;
//           result.push(ESCAPE_CHAR);
//         }
//         result.push(char);
//         break;
//       case StateEscaped:
//         if (char === ESCAPE_CHAR) {
//           state = StateEscapeEndMaybe;
//         } else {
//           result.push(char);
//         }
//         break;
//       case StateEscapeEndMaybe:
//         if (char === ESCAPE_CHAR) {
//           state = StateEscaped;
//           result.push(ESCAPE_CHAR);
//         } else {
//           result.push(char);
//           state = StateText;
//         }
//     }
//   }
//   if (state === StateEscapedMaybe) {
//     result.push(ESCAPE_CHAR);
//   }
//   return result.join("");
// }

type Context = {
  type?: typeof FormatExpression | typeof SelectExpression;
  paramName?: string;
  variants?: Record<string, string>;
  activeVariant?: string;
  result: string;
  numberFormatOptions?: Intl.NumberFormatOptions;
  formatType?: "number" | "date" | "time";
  selectType?: "plural" | "selectordinal" | "select";
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
      case Text:
      case TextNested:
        pushText(unescapeIcuAll(text));
        break;
      case ExpressionOpen:
        contextStack.push({ result: "" });
        break;
      case FormatExpression:
      case SelectExpression:
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
      case SelectVariant: {
        context.selectType = text as any;
        break;
      }
      case FormatFunction:
        context.formatType = text as any;
        context.numberFormatOptions = {};
        break;

      case FormatStyle: {
        const style = text.trim();
        if (context.formatType === "number") {
          updateNumberFormatOptions(context.numberFormatOptions!, style);
        }
        break;
      }

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
        } else if (context.type === SelectExpression) {
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
