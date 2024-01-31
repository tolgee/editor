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
import { Tree } from "@lezer/common";
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

function computeIsolates(view: EditorView) {
  const set = new RangeSetBuilder<Decoration>();
  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter(node) {
        if (
          node.name === "HtmlTagOpen" ||
          node.name === "HtmlTagClose" ||
          node.name === "Expression"
        ) {
          set.add(node.from, node.to, isolateLTR);
        }
        if (node.name === "TextRoot" || node.name === "Text") {
          set.add(node.from, node.to, isolateRTL);
        }
      },
    });
  }
  return set.finish();
}
