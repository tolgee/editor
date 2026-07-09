import {
  Expression,
  ExpressionClose,
  InvalidExpressionBody,
} from "../lezer/tolgeeParser.terms";
import { InvalidPlaceholder } from "../types";
import { parseTolgee } from "./parseTolgee";

export const getInvalidPlaceholders = (
  input: string,
  nested?: boolean
): InvalidPlaceholder[] => {
  // non-strict parse: unrelated syntax errors elsewhere in the string
  // (`{}`, an unclosed `{`) must not suppress the warnings
  const tree = parseTolgee(input, nested, false);

  const result: InvalidPlaceholder[] = [];
  tree.iterate({
    enter(node) {
      if (node.type.id !== Expression) {
        return;
      }
      const body = node.node.firstChild?.nextSibling;
      const closed = node.node.lastChild?.type.id === ExpressionClose;
      if (body?.type.id === InvalidExpressionBody && closed) {
        result.push({
          position: { start: node.from, end: node.to },
          value: input.substring(node.from, node.to),
        });
      }
    },
  });

  return result;
};
