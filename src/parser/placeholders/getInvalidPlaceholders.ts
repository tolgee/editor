import { parser } from "../lezer/tolgeeParser";
import {
  Expression,
  InvalidExpressionBody,
} from "../lezer/tolgeeParser.terms";
import type { Tree } from "@lezer/common";
import { Position } from "../types";

export type InvalidPlaceholder = {
  position: Position;
  value: string;
};

export const getInvalidPlaceholders = (
  input: string,
  nested?: boolean
): InvalidPlaceholder[] | null => {
  let tree: Tree;
  try {
    tree = parser
      .configure({
        strict: true,
        top: nested ? "Nested" : "Root",
      })
      .parse(input);
  } catch (e) {
    return null;
  }

  const result: InvalidPlaceholder[] = [];
  const cursor = tree.cursor();
  do {
    const node = cursor.node;
    if (node.type.id === Expression) {
      const inner = node.firstChild?.nextSibling;
      if (inner?.type.id === InvalidExpressionBody) {
        result.push({
          position: { start: node.from, end: node.to },
          value: input.substring(node.from, node.to),
        });
      }
    }
  } while (cursor.next());

  return result;
};
