import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { Placeholder, getPlaceholders } from "./getPlaceholders";
import { ChangeSet, RangeSetBuilder } from "@codemirror/state";

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

function buildPlaceholders(
  text: string,
  modifiedRange: [from: number, to: number] | undefined
) {
  const placeholders = getPlaceholders(text);
  return placeholders.filter((value) => {
    if (modifiedRange) {
      const [from, to] = modifiedRange;
      if (from < value.position.end && to > value.position.start) {
        return false;
      }
    }
    return true;
  });
}

function buildSet(placeholders: Placeholder[]) {
  const builder = new RangeSetBuilder<Decoration>();
  placeholders.forEach((value) => {
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

function findByNameAndType(item: Placeholder, list: Partial<Placeholder>[]) {
  return list.find((i) => i.name === item.name && i.type === i.type);
}

function findByNameTypeAndPosition(item: Placeholder, list: Placeholder[]) {
  return list.find(
    (i) =>
      i.name === item.name &&
      i.type === item.type &&
      i.position.start === i.position.start &&
      i.position.end === i.position.end
  );
}

function addOnlyAllowed(
  plsOld: Placeholder[],
  plsNew: Placeholder[],
  allowedNew: Partial<Placeholder>[]
) {
  return plsNew.filter((item) => {
    if (findByNameTypeAndPosition(item, plsOld)) {
      return true;
    }
    if (findByNameAndType(item, allowedNew)) {
      return true;
    }
    return false;
  });
}

export type Options = {
  noUpdates?: boolean;
  allowedNewPlaceholders?: Partial<Placeholder>[];
};

export const PlaceholderPlugin = (options?: Options) => {
  const { noUpdates } = options || {};
  return ViewPlugin.fromClass(
    class {
      decorationSet: DecorationSet;
      placeholders: Placeholder[];

      shiftPlaceholders(
        fromA: number,
        toA: number,
        fromB: number,
        toB: number
      ) {
        const sectionA = toA - fromA;
        const sectionB = toB - fromB;
        const addedChars = sectionB - sectionA;

        this.placeholders = this.placeholders.filter((value) => {
          if (fromA < value.position.end && toA > value.position.start) {
            return false;
          }

          if (toA < value.position.start) {
            value.position.start += addedChars;
            value.position.end += addedChars;
          }
          return true;
        });
      }

      shiftByChanges(changes: ChangeSet) {
        changes.iterChanges((fromA, toA, fromB, toB) => {
          this.shiftPlaceholders(fromA, toA, fromB, toB);
        });
        this.decorationSet = buildSet(this.placeholders);
      }

      constructor(view: EditorView) {
        try {
          this.placeholders = buildPlaceholders(
            view.state.doc.toString(),
            undefined
          );
          this.decorationSet = buildSet(this.placeholders);
        } catch (e) {
          this.decorationSet = buildSet([]);
          this.placeholders = [];
        }
      }

      update(change: ViewUpdate) {
        if (noUpdates) {
          this.shiftByChanges(change.changes);
        }

        if (change.docChanged && !noUpdates) {
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
          let newPlaceholders: Placeholder[] | undefined = undefined;
          try {
            newPlaceholders = buildPlaceholders(
              change.state.doc.toString(),
              modifiedRange
            );
          } catch (e) {
            this.shiftByChanges(change.changes);
            return;
          }

          if (!options?.allowedNewPlaceholders) {
            this.placeholders = newPlaceholders;
          } else {
            this.shiftByChanges(change.changes);
            this.placeholders = addOnlyAllowed(
              this.placeholders,
              newPlaceholders,
              options.allowedNewPlaceholders
            );
          }

          this.decorationSet = buildSet(this.placeholders);
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
};
