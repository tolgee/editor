import { EditorView } from "@codemirror/view";

const BLACK = "#000";
const WHITE = "#fff";

export const tolgeeThemeBase = EditorView.baseTheme({
  "&": {
    color: BLACK,
    fontSize: "15px",
  },
  ".cm-cursor": {
    borderLeftColor: BLACK,
  },
  ".cm-selectionBackground": {
    backgroundColor: "#d5d5d5 !important",
  },

  ".placeholder-widget": {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    height: "20px",
    minWidth: "15px",
    borderRadius: "10px",
    padding: "0px 9px",
    fontSize: "14px",
    userSelect: "none",
    margin: "0px 1px",
    border: "1px solid #7AD3C1",
    background: "#BEF3E9",
    color: "#008371",
  },

  ".placeholder-widget > *": {
    marginTop: "-1px",
  },

  ".placeholder-widget.placeholder-tagOpen": {
    border: "1px solid #F27FA6",
    background: "#F9C4D6",
    color: "#822343",
    borderRadius: "12px 0px 0px 12px",
    paddingRight: "8px",
  },

  ".placeholder-widget.placeholder-tagClose": {
    border: "1px solid #F27FA6",
    background: "#F9C4D6",
    color: "#822343",
    borderRadius: "0px 12px 12px 0px",
    paddingLeft: "8px",
  },

  '*[dir="rtl"] .placeholder-widget': {
    transform: "scaleX(-1)",
  },

  '*[dir="rtl"] .placeholder-widget > *': {
    transform: "scaleX(-1)",
  },
});

export const tolgeeThemeDark = EditorView.theme({
  "&": {
    color: WHITE,
  },
  ".cm-cursor": {
    borderLeftColor: WHITE,
  },
  ".cm-selectionBackground": {
    backgroundColor: "#587296 !important",
  },
});
