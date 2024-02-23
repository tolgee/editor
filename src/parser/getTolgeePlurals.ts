import { parser } from "./lezer/tolgeeParser";
import {
  Expression,
  Param,
  SelectFunction,
  SelectVariant,
  VariantContent,
} from "./lezer/tolgeeParser.terms";
import { SyntaxNode, Tree } from "@lezer/common";
import { TolgeeFormat } from "./types";

const REQUIRED_NODES: Record<number, number | undefined> = {
  0: Expression,
  4: Param,
  5: SelectFunction,
  // this also excludes 'offset:x'
  6: SelectVariant,
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

function returnNoPlural(value: string): TolgeeFormat {
  return { variants: { other: value } };
}

export const getTolgeePlurals = (input: string): TolgeeFormat => {
  let tree: Tree;
  try {
    tree = parser.configure({ strict: true }).parse(input);
  } catch (e) {
    return returnNoPlural(input);
  }
  const cursor = tree.cursor();

  const nodes: Record<number, SyntaxNode> = {};
  const variants: Record<string, string | undefined> = {};

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
      return returnNoPlural(input);
    }
  }

  // {variable, plural, one {...} two {...} other {...} }...
  //                                                     ^ nothing should be here
  if (nodes[Expression].nextSibling) {
    return returnNoPlural(input);
  }

  // {variable, plural, one {...} two {...} other {...} }
  //            ^^^^^^
  if (getNodeText(nodes[SelectFunction], input) !== "plural") {
    return returnNoPlural(input);
  }

  // collect all the top level plural variants
  // {variable, plural, one {...} two {...} other {...} }
  //                    ^^^  ^^^  ^^^  ^^^  ^^^^^  ^^^
  let variant: SyntaxNode | null = nodes[SelectVariant];
  do {
    const variantName = getNodeText(variant.firstChild!, input);
    const variantContent = getVariantContent(variant, input);
    if (variants[variantName] !== undefined) {
      // two variants with the same name
      return returnNoPlural(input);
    }
    variants[variantName] = variantContent;
  } while ((variant = variant.nextSibling));

  return {
    parameter: getNodeText(nodes[Param], input),
    variants,
  };
};
