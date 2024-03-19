import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
  hoverTooltip,
} from "@codemirror/view";
import { getPlaceholders } from "./placeholders/getPlaceholders";
import {
  ChangeSet,
  Extension,
  RangeSetBuilder,
  StateField,
  Transaction,
} from "@codemirror/state";
import { Placeholder } from "./types";

class PlaceholderWidget extends WidgetType {
  constructor(
    public value: Placeholder,
    public examplePluralNum: number | undefined
  ) {
    super();
  }

  toDOM(): HTMLElement {
    const spanOuter = document.createElement("span");
    let classes = `placeholder-widget placeholder-${this.value.type}`;

    if (this.value.error) {
      classes =
        classes + ` placeholder-error placeholder-error-${this.value.error}`;
    }
    spanOuter.className = classes;

    const spanInner = document.createElement("span");
    spanInner.textContent =
      this.value.type !== "hash"
        ? this.value.name
        : `#${this.examplePluralNum ?? ""}`;
    spanOuter.appendChild(spanInner);
    return spanOuter;
  }
}

function buildPlaceholders(
  text: string,
  modifiedRange: [from: number, to: number] | undefined,
  nested: boolean
) {
  const placeholders = getPlaceholders(text, nested);

  if (placeholders === null) {
    return null;
  }

  return placeholders.filter((value) => {
    if (modifiedRange) {
      const [from] = modifiedRange;
      if (from > value.position.start && from < value.position.end) {
        return false;
      }
    }
    return true;
  });
}

function buildSet(
  placeholders: Placeholder[],
  examplePluralNum: number | undefined
) {
  const builder = new RangeSetBuilder<Decoration>();
  placeholders.forEach((value) => {
    builder.add(
      value.position.start,
      value.position.end,
      Decoration.widget({
        widget: new PlaceholderWidget(value, examplePluralNum),
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

function shiftPlaceholders(
  placeholders: Placeholder[],
  fromA: number,
  toA: number,
  fromB: number,
  toB: number
) {
  const sectionA = toA - fromA;
  const sectionB = toB - fromB;
  const addedChars = sectionB - sectionA;

  return placeholders.filter((value) => {
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

function shiftByChanges(placeholders: Placeholder[], changes: ChangeSet) {
  let result = placeholders;
  changes.iterChanges((fromA, toA, fromB, toB) => {
    result = shiftPlaceholders(result, fromA, toA, fromB, toB);
  });
  return result;
}

export type Options = {
  noUpdates?: boolean;
  allowedNewPlaceholders?: Partial<Placeholder>[];
  examplePluralNum?: number;
  nested: boolean;
  tooltips: boolean;
};

export const PlaceholderPlugin = (options: Options) => {
  const { noUpdates, allowedNewPlaceholders, nested, tooltips } = options;
  return StateField.define<Placeholder[]>({
    create(state) {
      try {
        return buildPlaceholders(state.doc.toString(), undefined, nested) || [];
      } catch (e) {
        return [];
      }
    },
    update(value: Placeholder[], change: Transaction) {
      if (noUpdates) {
        return shiftByChanges(value, change.changes);
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
        const newPlaceholders = buildPlaceholders(
          change.state.doc.toString(),
          modifiedRange,
          nested
        );
        if (newPlaceholders === null) {
          return shiftByChanges(value, change.changes);
        }

        if (!allowedNewPlaceholders) {
          return newPlaceholders;
        } else {
          return addOnlyAllowed(
            value,
            shiftByChanges(value, change.changes),
            allowedNewPlaceholders
          );
        }
      }
      return value;
    },
    provide(f) {
      const extensions: Extension[] = [
        ViewPlugin.fromClass(
          class {
            decorationSet: DecorationSet;
            constructor(view: EditorView) {
              this.decorationSet = buildSet(
                view.state.field(f),
                options?.examplePluralNum
              );
            }
            update(change: ViewUpdate) {
              this.decorationSet = buildSet(
                change.state.field(f),
                options?.examplePluralNum
              );
            }
          },
          {
            decorations: (instance) => instance.decorationSet,
            provide: (plugin) =>
              EditorView.atomicRanges.of((view) => {
                return view.plugin(plugin)?.decorationSet || Decoration.none;
              }),
          }
        ),
      ];
      if (tooltips) {
        extensions.push(
          hoverTooltip((view, pos, side) => {
            const placeholders = view.state.field(f);
            const placeholder = placeholders.find(({ position }) => {
              return pos === position.start && side > 0;
            });
            if (!placeholder) {
              return null;
            }
            return {
              pos: placeholder.position.start,
              end: placeholder.position.end,
              create() {
                const dom = document.createElement("div");
                dom.textContent = placeholder.normalizedValue;
                return { dom };
              },
            };
          })
        );
      }
      return extensions;
    },
  });
};
