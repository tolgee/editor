import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
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
    span.className = `placeholder-widget placeholder-${this.value.type}`;
    span.textContent = this.value.name || "#";
    return span;
  }
}

function createSet(text: string) {
  const placeholders = getPlaceholders(text);
  const builder = new RangeSetBuilder<Decoration>();
  placeholders.forEach((value) => {
    builder.add(
      value.position.start,
      value.position.end,
      Decoration.replace({
        widget: new PlaceholderWidget(value),
        inclusive: true,
      })
    );
  });
  return builder.finish();
}

export const placeholders = ViewPlugin.fromClass(
  class {
    placeholderSet: DecorationSet = new RangeSetBuilder<Decoration>().finish();
    constructor(view: EditorView) {
      this.placeholderSet = createSet(view.state.doc.toString());
    }
    // update(change: ViewUpdate) {
    //   this.placeholderSet = createSet(change.state.doc.toString());
    // }
  },
  {
    decorations: (instance) => instance.placeholderSet,
    provide: (plugin) =>
      EditorView.atomicRanges.of((view) => {
        return view.plugin(plugin)?.placeholderSet || Decoration.none;
      }),
  }
);
