export type Position = {
  start: number;
  end: number;
};

export type Placeholder = {
  type: "variable" | "tagOpen" | "tagClose" | "tagSelfClosed" | "hash" | "entity";
  position: Position;
  name: string;
  error?: "missing_open_tag" | "missing_close_tag";
  normalizedValue: string;
};

export type TolgeeFormat = {
  parameter?: string;
  variants: Partial<Record<Intl.LDMLPluralRule, string | undefined>>;
  variantOffsets?: Partial<Record<Intl.LDMLPluralRule, number>>;
};
