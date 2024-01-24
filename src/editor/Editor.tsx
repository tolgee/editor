import { Compartment, EditorState } from "@codemirror/state";
import { EditorView, ViewUpdate } from "@codemirror/view";
import { useEffect, useRef } from "react";
import { minimalSetup } from "@uiw/react-codemirror";
import { tolgeeSyntax } from "../parser/tolgeeSyntax";
import { tolgeeLinter } from "../playground/tolgeeLinter";
import { StatePlugin } from "../parser/PlaceholderPlugin";
import styled from "@emotion/styled";
import { Placeholder } from "../parser/getPlaceholders";

const StyledEditor = styled("div")`
  font-size: 14px;

  & .placeholder-widget {
    border: 1px solid #2e2e2e4e;
    border-radius: 10px;
    padding: 1px 4px;
    font-size: 12px;
    user-select: none;
  }

  & .placeholder-tagOpen {
    border-radius: 10px 0px 0px 10px;
    padding-right: 2px;
  }

  & .placeholder-tagClose {
    border-radius: 0px 10px 10px 0px;
    padding-left: 2px;
  }

  & .placeholder-error {
    background: #ff000054;
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
        ],
      }),
    });

    editor.current = instance;
    return () => instance.destroy();
  }, []);

  useEffect(() => {
    const plugins =
      placeholders === "none"
        ? []
        : [
            StatePlugin({
              noUpdates: placeholders === "initial",
              allowedNewPlaceholders,
            }),
          ];
    editor.current?.dispatch({
      effects: compartment.current?.reconfigure(plugins),
    });
  }, [placeholders]);

  return <StyledEditor ref={ref} />;
};
