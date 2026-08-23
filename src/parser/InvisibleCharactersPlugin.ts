import {
  Decoration,
  DecorationSet,
  EditorView,
  hoverTooltip,
  WidgetType,
} from "@codemirror/view";
import { EditorState, Extension, RangeSetBuilder, StateField } from "@codemirror/state";

import {
  findInvisibleCharacters,
  FoundInvisibleChar,
  InvisibleChar,
} from "./invisibleCharacters/findInvisibleCharacters";

const nonBreakingSpaceDecoration = Decoration.mark({
  attributes: {
    class: "cm-invisible-char-nbsp",
    "data-cy": "invisible-character-editor",
    "data-cy-kind": "nonBreakingSpace",
  },
});

class ZeroWidthWidget extends WidgetType {
  eq(): boolean {
    return true;
  }

  toDOM(): HTMLElement {
    const bar = document.createElement("span");
    bar.className = "cm-invisible-char-zero-width";
    // Attributes must come from an object literal: the consuming app's
    // `generate-data-cy` scan looks for `'data-cy': '<literal>'` and misses
    // `setAttribute` with a variable.
    Object.entries({
      "data-cy": "invisible-character-editor",
      "data-cy-kind": "zeroWidth",
    }).forEach(([name, value]) => bar.setAttribute(name, value));
    return bar;
  }
}

const zeroWidthDecoration = Decoration.widget({
  widget: new ZeroWidthWidget(),
  side: 1,
});

type InvisibleCharactersState = {
  found: FoundInvisibleChar[];
  decorations: DecorationSet;
};

function buildState(state: EditorState): InvisibleCharactersState {
  const found = findInvisibleCharacters(state.doc.toString());
  const builder = new RangeSetBuilder<Decoration>();
  found.forEach(({ index, char }) => {
    if (char.kind === "zeroWidth") {
      builder.add(index, index, zeroWidthDecoration);
    } else {
      builder.add(index, index + char.value.length, nonBreakingSpaceDecoration);
    }
  });
  return { found, decorations: builder.finish() };
}

const invisibleCharactersField = StateField.define<InvisibleCharactersState>({
  create: buildState,
  update(value, tr) {
    return tr.docChanged ? buildState(tr.state) : value;
  },
  provide: (field) =>
    EditorView.decorations.from(field, (value) => value.decorations),
});

export const InvisibleCharactersPlugin = (): Extension[] => [
  invisibleCharactersField,
];

/**
 * Hover tooltip naming the invisible character under the cursor.
 *
 * `getLabel` is supplied by the consuming app so the label can be localized
 * there; this package holds no translations.
 */
export const invisibleCharactersTooltip = (
  getLabel: (char: InvisibleChar) => string
): Extension =>
  hoverTooltip((view, pos, side) => {
    const found = view.state
      .field(invisibleCharactersField, false)
      ?.found.find(({ index, char }) =>
        side < 0
          ? pos > index && pos <= index + char.value.length
          : pos >= index && pos < index + char.value.length
      );

    if (!found) {
      return null;
    }

    return {
      pos: found.index,
      end: found.index + found.char.value.length,
      above: true,
      create: () => {
        const dom = document.createElement("div");
        Object.entries({ "data-cy": "invisible-character-tooltip" }).forEach(
          ([name, value]) => dom.setAttribute(name, value)
        );
        dom.textContent = getLabel(found.char);
        return { dom };
      },
    };
  });
