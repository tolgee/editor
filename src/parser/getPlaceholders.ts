import { parser } from "./tolgeeParser";
import {
  Expression,
  HtmlTagClose,
  HtmlTagOpen,
  Param,
  PluralPlaceholder,
  TagName,
} from "./tolgeeParser.terms";

import type { SyntaxNode } from "@lezer/common";

type Position = {
  start: number;
  end: number;
};

export type Placeholder = {
  type: "variable" | "tagOpen" | "tagClose" | "hash";
  position: Position;
  name?: string;
  error?: "missing_open_tag" | "missing_close_tag";
};

export const getPlaceholders = (input: string) => {
  const tree = parser.configure({ strict: true }).parse(input);

  let cursor = tree.cursor();
  let current: (Partial<Placeholder> & { rootNode: SyntaxNode }) | undefined =
    undefined;

  const result: Placeholder[] = [];

  const openTags = new Map<string, Placeholder[]>();

  function pushCurrent() {
    const placeholder: Placeholder = {
      name: current!.name,
      type: current!.type!,
      position: current!.position!,
    };

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
    cursor = current!.rootNode.lastChild!.cursor();
    current = undefined;
  }

  do {
    const node = cursor.node;
    const text = input.substring(cursor.from, cursor.to);

    switch (node.type.id) {
      case PluralPlaceholder:
        if (!current) {
          result.push({
            type: "hash",
            position: { start: cursor.from, end: cursor.to },
          });
        }
        break;
      case Expression:
        if (!current) {
          current = {
            type: "variable",
            position: { start: cursor.from, end: cursor.to },
            rootNode: node,
          };
        }
        break;
      case Param:
        if (current?.type === "variable" && !current.name) {
          current.name = text;
          pushCurrent();
        }
        break;
      case HtmlTagOpen:
        if (!current) {
          current = {
            type: "tagOpen",
            position: { start: cursor.from, end: cursor.to },
            rootNode: node,
          };
        }
        break;
      case HtmlTagClose:
        if (!current) {
          current = {
            type: "tagClose",
            position: { start: cursor.from, end: cursor.to },
            rootNode: node,
          };
        }
        break;
      case TagName:
        if (current?.type === "tagClose" || current?.type === "tagOpen") {
          current.name = text;
          pushCurrent();
        }
        break;
    }
  } while (cursor.next());

  openTags.forEach((values) =>
    values.forEach((placeholder) => {
      placeholder.error = "missing_close_tag";
    })
  );

  return result;
};
