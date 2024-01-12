import { Compartment, EditorState } from "@codemirror/state";
import { EditorView, ViewUpdate } from "@codemirror/view";
import { useEffect, useRef } from "react";
import { minimalSetup } from "@uiw/react-codemirror";
import { tolgeeSyntax } from "./tolgeeSyntax";

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
          // tolgeeLinter,
          languageCompartment.of(tolgeeSyntax()),
        ],
      })
    );

    editor.current = instance;
    return () => instance.destroy();
  }, []);

  return <div ref={ref} />;
};
