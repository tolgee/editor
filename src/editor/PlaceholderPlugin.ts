import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { Placeholder, getPlaceholders } from "../parser/getPlaceholders";
import { RangeSetBuilder } from "@codemirror/state";

class PlaceholderWidget extends WidgetType {
  value: Placeholder;
  constructor(value: Placeholder) {
    super();
    this.value = value;
  }
  toDOM(): HTMLElement {
    const span = document.createElement("span");
    let classes = `placeholder-widget placeholder-${this.value.type}`;

    if (this.value.error) {
      classes =
        classes + ` placeholder-error placeholder-error-${this.value.error}`;
    }
    span.className = classes;
    span.textContent = this.value.name || "#";
    return span;
  }
}

function createSet(
  text: string,
  modifiedRange: [from: number, to: number] | undefined
) {
  const placeholders = getPlaceholders(text);
  const builder = new RangeSetBuilder<Decoration>();
  placeholders.forEach((value) => {
    if (modifiedRange) {
      const [from, to] = modifiedRange;
      if (from < value.position.end && to > value.position.start) {
        return;
      }
    }
    builder.add(
      value.position.start,
      value.position.end,
      Decoration.widget({
        widget: new PlaceholderWidget(value),
        side: 1,
      })
    );
  });
  return builder.finish();
}

export const placeholderPlugin = ViewPlugin.fromClass(
  class {
    placeholderSet: DecorationSet;
    constructor(view: EditorView) {
      this.placeholderSet = createSet(view.state.doc.toString(), undefined);
    }
    update(change: ViewUpdate) {
      if (change.docChanged) {
        let modifiedRange: [from: number, to: number] | undefined;
        change.changes.iterChanges((fromA, toA, fromB, toB) => {
          const sectionA = toA - fromA;
          const sectionB = toB - fromB;
          const addedChars = sectionB - sectionA;
          // when typing or deleting
          if (addedChars <= 1) {
            // skip if the character was modified inside the tag
            modifiedRange = [fromB, toB];
          }
        });
        try {
          this.placeholderSet = createSet(
            change.state.doc.toString(),
            modifiedRange
          );
        } catch (e) {
          // pass
        }
      }
    }
  },
  {
    decorations: (instance) => instance.placeholderSet,
    provide: (plugin) =>
      EditorView.atomicRanges.of((view) => {
        return view.plugin(plugin)?.placeholderSet || Decoration.none;
      }),
  }
);
