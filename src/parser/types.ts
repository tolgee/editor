export type Position = {
  start: number;
  end: number;
};

export type Placeholder = {
  type: "variable" | "tagOpen" | "tagClose" | "hash";
  position: Position;
  name: string;
  error?: "missing_open_tag" | "missing_close_tag";
};

export type TolgeeFormat = {
  parameter: string;
  variants: Map<string, string>;
};
