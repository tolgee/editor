import { parser } from "./lezer/tolgeeParser";
import {
  Param,
  SelectExpression,
  SelectFunction,
} from "./lezer/tolgeeParser.terms";
import { SyntaxNode, Tree } from "@lezer/common";

function getAllChildren(node: SyntaxNode) {
  const result: SyntaxNode[] = [];
  let child: SyntaxNode | null = node.firstChild!;

  while (child) {
    result.push(child);
    child = child.nextSibling;
  }
  return result;
}

export const getFirstPluralParameter = (input: string): string | undefined => {
  let tree: Tree;
  try {
    tree = parser.configure({ strict: true }).parse(input);
  } catch (e) {
    return undefined;
  }

  function getNodeText(node: SyntaxNode) {
    return input.substring(node.from, node.to);
  }

  function getSelectType(node: SyntaxNode) {
    const result = getAllChildren(node).find(
      (n) => n.type.id === SelectFunction
    );
    return result ? getNodeText(result) : undefined;
  }

  function getSelectParameter(node: SyntaxNode) {
    const result = getAllChildren(node).find((n) => n.type.id === Param);
    return result ? getNodeText(result) : undefined;
  }

  const cursor = tree.cursor();
  let enter = false;
  do {
    const node = cursor.node;
    switch (node.type.id) {
      case SelectExpression: {
        const selectType = getSelectType(node);
        if (selectType === "plural") {
          return getSelectParameter(node);
        }
        enter = false;
        break;
      }

      default:
        enter = true;
        break;
    }
  } while (cursor.next(enter));
  return undefined;
};
