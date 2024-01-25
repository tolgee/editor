import { useMemo } from "react";
import { Editor } from "./Editor";
import { Placeholder, TolgeeFormat } from "../parser/types";
import React from "react";

type Props = {
  value: TolgeeFormat;
  locale: string;
  placeholders?: "initial" | "full" | "none";
  allowedNewPlaceholders?: Partial<Placeholder>[];
};

export const EditorMulti = ({
  locale,
  value,
  placeholders,
  allowedNewPlaceholders,
}: Props) => {
  const pluralVariants = useMemo(
    () => new Intl.PluralRules(locale).resolvedOptions().pluralCategories,
    [locale]
  );

  return (
    <div>
      {pluralVariants.map((variantName) => (
        <React.Fragment key={variantName}>
          <div>{variantName}</div>
          <Editor
            key={variantName}
            initialValue={value.variants.get(variantName) || ""}
            placeholders={placeholders}
            allowedNewPlaceholders={allowedNewPlaceholders}
          />
        </React.Fragment>
      ))}
    </div>
  );
};
