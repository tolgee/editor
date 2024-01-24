import { hoverTooltip } from "@codemirror/view";
import { getPlaceholders } from "../parser/getPlaceholders";

export const tooltipPlugin = hoverTooltip((view, pos) => {
  try {
    const placeholder = getPlaceholders(view.state.doc.toString()).find(
      (item) =>
        item.error && item.position.start <= pos && item.position.end >= pos
    );

    if (placeholder) {
      return {
        pos: placeholder.position.start,
        end: placeholder.position.end,
        create: () => {
          const dom = document.createElement("div");
          dom.className = "cm-tooltip-cursor";
          dom.textContent = placeholder.error!;
          return { dom };
        },
      };
    }
  } catch (e) {
    // pass
  }
  return null;
});