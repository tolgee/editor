import { Compartment, EditorState } from "@codemirror/state";
import { EditorView, ViewUpdate } from "@codemirror/view";
import { useEffect, useRef } from "react";
import { minimalSetup } from "@uiw/react-codemirror";
import { tolgeeSyntax } from "../parser/tolgeeSyntax";
import { tolgeeLinter } from "./tolgeeLinter";
import { placeholders } from "./PlaceholderWidget";
import styled from "@emotion/styled";

const StyledEditor = styled("div")`
  & .placeholder-widget {
    border: 1px solid black;
    border-radius: 10px;
    padding: 2px 6px;
    font-size: 12px;
  }

  & .placeholder-tagOpen {
    border-radius: 10px 0px 0px 10px;
  }

  & .placeholder-tagClose {
    border-radius: 0px 10px 10px 0px;
  }
`;

type Props = {
  initialValue: string;
  onChange?: (val: string) => void;
};

export const Editor: React.FC<Props> = ({ initialValue, onChange }) => {
  const ref = useRef<HTMLDivElement>(null);
  const editor = useRef<EditorView>();

  useEffect(() => {
    const instance = new EditorView({
      parent: ref.current!,
    });
    const languageCompartment = new Compartment();

    instance.setState(
      EditorState.create({
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
          placeholders,
        ],
      })
    );
    editor.current = instance;
    return () => instance.destroy();
  }, []);

  return <StyledEditor ref={ref} />;
};
