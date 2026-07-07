import {
  EditorView,
  Direction,
  ViewPlugin,
  ViewUpdate,
  Decoration,
  DecorationSet,
} from "@codemirror/view";
import { Prec } from "@codemirror/state";
import { syntaxTree } from "@codemirror/language";
import { SyntaxNodeRef, Tree } from "@lezer/common";
import { RangeSetBuilder } from "@codemirror/state";

export const htmlIsolatesPlugin = ViewPlugin.fromClass(
  class {
    isolates: DecorationSet;
    tree: Tree;

    constructor(view: EditorView) {
      this.isolates = computeIsolates(view);
      this.tree = syntaxTree(view.state);
    }

    update(update: ViewUpdate) {
      if (
        update.docChanged ||
        update.viewportChanged ||
        syntaxTree(update.state) != this.tree
      ) {
        this.isolates = computeIsolates(update.view);
        this.tree = syntaxTree(update.state);
      }
    }
  },
  {
    provide: (plugin) => {
      function access(view: EditorView) {
        return view.plugin(plugin)?.isolates ?? Decoration.none;
      }
      return Prec.lowest([
        EditorView.decorations.of(access),
        EditorView.bidiIsolatedRanges.of(access),
      ]);
    },
  }
);

const isolateLTR = Decoration.mark({
  attributes: { style: "direction: ltr; unicode-bidi: isolate" },
  bidiIsolate: Direction.LTR,
});

const isolateRTL = Decoration.mark({
  attributes: { style: "direction: rtl; unicode-bidi: isolate" },
  bidiIsolate: Direction.RTL,
});

const RTL_SCRIPT =
  /[\p{Script=Hebrew}\p{Script=Arabic}\p{Script=Syriac}\p{Script=Thaana}\p{Script=Nko}]/u;
const STRONG_LETTER = /\p{L}/u;

// Direction of a run's first strong character, à la `unicode-bidi: plaintext`.
function contentDirection(text: string): Direction {
  for (const ch of text) {
    if (RTL_SCRIPT.test(ch)) {
      return Direction.RTL;
    }
    if (STRONG_LETTER.test(ch)) {
      return Direction.LTR;
    }
  }
  return Direction.LTR;
}

function isInvalidExpression(node: SyntaxNodeRef) {
  return node.node.firstChild?.nextSibling?.name === "InvalidExpressionBody";
}

function computeIsolates(view: EditorView) {
  const set = new RangeSetBuilder<Decoration>();
  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter(node) {
        if (node.name === "HtmlTagOpen" || node.name === "HtmlTagClose") {
          set.add(node.from, node.to, isolateLTR);
        } else if (node.name === "Expression") {
          // A valid placeholder is markup and stays LTR. An invalid one is
          // arbitrary user text, so it follows its own content's direction
          // instead of being forced LTR (which would scramble RTL content).
          const isolate =
            isInvalidExpression(node) &&
            contentDirection(view.state.doc.sliceString(node.from, node.to)) ===
              Direction.RTL
              ? isolateRTL
              : isolateLTR;
          set.add(node.from, node.to, isolate);
        } else if (node.name === "TextRoot" || node.name === "Text") {
          set.add(node.from, node.to, isolateRTL);
        }
      },
    });
  }
  return set.finish();
}
