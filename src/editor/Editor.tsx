import { Compartment, EditorState } from "@codemirror/state";
import { EditorView, ViewUpdate } from "@codemirror/view";
import { useEffect, useRef } from "react";
import { minimalSetup } from "@uiw/react-codemirror";
import { tolgeeSyntax } from "../parser/tolgeeSyntax";
import { tolgeeLinter } from "../playground/tolgeeLinter";
import { PlaceholderPlugin } from "../parser/PlaceholderPlugin";
import styled from "@emotion/styled";
import { Placeholder } from "../parser/types";
import { tolgeeHighlight } from "../parser/tolgeeHighlight";
import { tolgeeThemeBase } from "../tolgee-editor";

const StyledEditor = styled("div")`
  .cm-line {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji",
      "Segoe UI Symbol";
  }
`;

type Props = {
  initialValue: string;
  onChange?: (val: string) => void;
  placeholders?: "initial" | "full" | "none";
  allowedNewPlaceholders?: Partial<Placeholder>[];
};

export const Editor: React.FC<Props> = ({
  initialValue,
  onChange,
  placeholders,
  allowedNewPlaceholders,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const editor = useRef<EditorView>();
  const compartment = useRef<Compartment>();

  useEffect(() => {
    const languageCompartment = new Compartment();
    compartment.current = new Compartment();

    const instance = new EditorView({
      parent: ref.current!,
      state: EditorState.create({
        doc: initialValue,
        extensions: [
          minimalSetup(),
          EditorView.updateListener.of((v: ViewUpdate) => {
            if (v.docChanged) {
              onChange?.(v.state.doc.toString());
            }
          }),
          EditorView.contentAttributes.of({ spellcheck: "true", lang: "en" }),
          languageCompartment.of(tolgeeSyntax()),
          tolgeeLinter,
          compartment.current.of([]),
          tolgeeThemeBase,
          tolgeeHighlight,
        ],
      }),
    });

    editor.current = instance;
    return () => instance.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const plugins =
      placeholders === "none"
        ? []
        : [
            PlaceholderPlugin({
              noUpdates: placeholders === "initial",
              allowedNewPlaceholders,
            }),
          ];
    editor.current?.dispatch({
      effects: compartment.current?.reconfigure(plugins),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [placeholders]);

  return <StyledEditor ref={ref} />;
};
