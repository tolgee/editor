import { parser } from "../lezer/tolgeeParser";

export const parseTolgee = (
  input: string,
  nested: boolean | undefined,
  strict: boolean
) =>
  parser
    .configure({
      strict,
      top: nested ? "Nested" : "Root",
    })
    .parse(input);
