import { parser } from "../lezer/tolgeeParser";
import {
  Expression,
  FormatExpression,
  FormatFunction,
  FormatStyle,
  Param,
  PluralPlaceholder,
  Text,
  TextNested,
} from "../lezer/tolgeeParser.terms";

import type { SyntaxNode, Tree } from "@lezer/common";
import { Placeholder } from "../types";
import { TagInfoType, findTags } from "./findTags";

function getAllChildren(node: SyntaxNode) {
  const result: SyntaxNode[] = [];
  let child: SyntaxNode | null = node.firstChild!;

  while (child) {
    result.push(child);
    child = child.nextSibling;
  }
  return result;
}

export const getPlaceholders = (input: string, nested?: boolean) => {
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

  const result: Placeholder[] = [];

  const openTags = new Map<string, Placeholder[]>();

  function getNodeText(node: SyntaxNode) {
    return input.substring(node.from, node.to);
  }

  function placeholderFromFormatExpression(node: SyntaxNode) {
    const rootNode = node.parent!;
    let name = "";
    let formatFunction: string | undefined = undefined;
    const formatStyle: string[] = [];

    getAllChildren(node).forEach((child) => {
      const text = getNodeText(child);
      switch (child.type.id) {
        case Param:
          name = text;
          break;
        case FormatFunction:
          formatFunction = text;
          break;
        case FormatStyle:
          formatStyle.push(text);
          break;
      }
    });

    const normalizedValue = ["{", name];
    if (formatFunction) {
      normalizedValue.push(", ");
      normalizedValue.push(formatFunction);
    }
    if (formatStyle.length) {
      normalizedValue.push(`, ${formatStyle.join(" ")}`);
    }
    normalizedValue.push("}");

    return {
      position: { start: rootNode.from, end: rootNode.to },
      type: "variable",
      name,
      normalizedValue: normalizedValue.join(""),
    } satisfies Placeholder;
  }

  function getNormalizedValue(info: TagInfoType) {
    let result = "<";
    if (info.type === "close") {
      result += "/";
    }
    result += info.name;
    Object.entries(info.params).forEach(([name, value]) => {
      result += ` ${name}`;
      if (value !== true) {
        result += `=${value}`;
      }
    });
    if (info.type === "self-closed") {
      result += " />";
    } else {
      result += ">";
    }

    return result;
  }

  function placeholderFromTag(info: TagInfoType) {
    return {
      position: info.position,
      type:
        info.type === "open"
          ? "tagOpen"
          : info.type === "close"
          ? "tagClose"
          : "tagSelfClosed",
      name: info.name,
      normalizedValue: getNormalizedValue(info),
    } satisfies Placeholder;
  }

  function addPlaceholder(placeholder: Placeholder) {
    const value = input.substring(
      placeholder.position.start,
      placeholder.position.end
    );
    if (value.includes("\n")) {
      return;
    }

    if (placeholder.type === "tagOpen") {
      const values = openTags.get(placeholder.name!) ?? [];
      values.push(placeholder);
      openTags.set(placeholder.name!, values);
    } else if (placeholder.type === "tagClose") {
      const values = openTags.get(placeholder.name!);
      if (!values) {
        placeholder.error = "missing_open_tag";
      } else {
        values.pop();
        if (values.length === 0) {
          openTags.delete(placeholder.name!);
        }
      }
    }

    result.push(placeholder);
  }

  const cursor = tree.cursor();
  let enter: boolean;
  do {
    const node = cursor.node;
    enter = true;
    switch (node.type.id) {
      case PluralPlaceholder:
        addPlaceholder({
          name: "#",
          type: "hash",
          position: { start: cursor.from, end: cursor.to },
          normalizedValue: "#",
        });
        enter = false;
        break;

      case Expression: {
        const innerExpression = node.firstChild!.nextSibling!;
        if (innerExpression?.type.id === FormatExpression) {
          addPlaceholder(placeholderFromFormatExpression(innerExpression));
        }
        enter = false;
        break;
      }

      case Text:
      case TextNested: {
        findTags(getNodeText(node)).forEach((tagInfo) => {
          return addPlaceholder(
            placeholderFromTag({
              ...tagInfo,
              position: {
                start: tagInfo.position.start + node.from,
                end: tagInfo.position.end + node.from,
              },
            })
          );
        });

        enter = false;
        break;
      }
    }
  } while (cursor.next(enter));

  openTags.forEach((values) =>
    values.forEach((placeholder) => {
      placeholder.error = "missing_close_tag";
    })
  );

  return result;
};
