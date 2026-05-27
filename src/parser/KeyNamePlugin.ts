import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { Extension, RangeSetBuilder, StateField } from "@codemirror/state";

export const PO_MSGCTXT_KEY_SEPARATOR = "\u0004";

type MsgCtxtRange = {
  start: number;
  end: number;
  msgctxt: string;
};

function findMsgCtxt(text: string): MsgCtxtRange | null {
  const idx = text.indexOf(PO_MSGCTXT_KEY_SEPARATOR);
  if (idx <= 0) return null;
  return { start: 0, end: idx + 1, msgctxt: text.slice(0, idx) };
}

class MsgCtxtChipWidget extends WidgetType {
  constructor(public msgctxt: string) {
    super();
  }

  eq(other: WidgetType): boolean {
    return other instanceof MsgCtxtChipWidget && other.msgctxt === this.msgctxt;
  }

  toDOM(): HTMLElement {
    const span = document.createElement("span");
    span.className = "keyname-msgctxt-widget";
    span.textContent = this.msgctxt;
    return span;
  }

  ignoreEvent(): boolean {
    return false;
  }
}

function buildSet(text: string): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>();
  const range = findMsgCtxt(text);
  if (range) {
    builder.add(
      range.start,
      range.end,
      Decoration.replace({
        widget: new MsgCtxtChipWidget(range.msgctxt),
      })
    );
  }
  return builder.finish();
}

export const KeyNamePlugin = (): StateField<null> => {
  return StateField.define<null>({
    create() {
      return null;
    },
    update() {
      return null;
    },
    provide(): Extension {
      return ViewPlugin.fromClass(
        class {
          decorationSet: DecorationSet;
          constructor(view: EditorView) {
            this.decorationSet = buildSet(view.state.doc.toString());
          }
          update(change: ViewUpdate) {
            if (change.docChanged || change.viewportChanged) {
              this.decorationSet = buildSet(change.state.doc.toString());
            }
          }
        },
        {
          decorations: (instance) => instance.decorationSet,
          provide: (plugin) =>
            EditorView.atomicRanges.of((view) => {
              return view.plugin(plugin)?.decorationSet || Decoration.none;
            }),
        }
      );
    },
  });
};
