import { parser } from "./tolgeeParser";
import {
  Expression,
  Param,
  SelectFunction,
  SelectVariant,
  VariantContent,
} from "./tolgeeParser.terms";
import { SyntaxNode, Tree } from "@lezer/common";
import { TolgeeFormat } from "./types";

const REQUIRED_NODES: Record<number, number | undefined> = {
  0: Expression,
  4: Param,
  6: SelectFunction,
  // this also excludes 'offset:x'
  8: SelectVariant,
};

function getNodeText(node: SyntaxNode, input: string) {
  return input.substring(node.from, node.to);
}

function getVariantContent(variantNode: SyntaxNode, input: string) {
  let node: SyntaxNode | null | undefined = variantNode.firstChild;
  do {
    if (node?.type.id === VariantContent) {
      return getNodeText(node, input);
    }
  } while ((node = node?.nextSibling));
  return "";
}

export const getTolgeePlurals = (input: string): TolgeeFormat | null => {
  let tree: Tree;
  try {
    tree = parser.configure({ strict: true }).parse(input);
  } catch (e) {
    return null;
  }
  const cursor = tree.cursor();

  const nodes: Record<number, SyntaxNode> = {};
  const variants = new Map<string, string>();

  const requiredIndexes = Object.keys(REQUIRED_NODES);
  const lastIndex = Number(requiredIndexes[requiredIndexes.length - 1]);

  // check first x required nodes, check their type and save them
  // {variable, plural, one {...} two {...} other {...} }
  //                    ^ check until here
  for (let i = 0; i <= lastIndex; i++) {
    cursor.next();
    const node = cursor.node;
    const required = REQUIRED_NODES[i];
    if (required === undefined) {
      continue;
    }
    if (required === node.type.id) {
      nodes[node.type.id] = node;
    } else {
      return null;
    }
  }

  // {variable, plural, one {...} two {...} other {...} }...
  //                                                     ^ nothing should be here
  if (nodes[Expression].nextSibling) {
    return null;
  }

  // {variable, plural, one {...} two {...} other {...} }
  //            ^^^^^^
  if (getNodeText(nodes[SelectFunction], input) !== "plural") {
    return null;
  }

  // collect all the top level plural variants
  // {variable, plural, one {...} two {...} other {...} }
  //                    ^^^  ^^^  ^^^  ^^^  ^^^^^  ^^^
  let variant: SyntaxNode | null = nodes[SelectVariant];
  do {
    const variantName = getNodeText(variant.firstChild!, input);
    const variantContent = getVariantContent(variant, input);
    if (variants.get(variantName)) {
      // two variants with the same name
      return null;
    }
    variants.set(variantName, variantContent);
  } while ((variant = variant.nextSibling));

  return {
    parameter: getNodeText(nodes[Param], input),
    variants,
  };
};
