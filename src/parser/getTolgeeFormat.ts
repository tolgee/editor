import { getTolgeePlurals } from "./getTolgeePlurals";
import { TolgeeFormat } from "./types";

export const getTolgeeFormat = (
  input: string,
  plural: boolean,
  raw = false
): TolgeeFormat => {
  if (plural) {
    return getTolgeePlurals(input || "", raw);
  } else {
    return { variants: { other: input } };
  }
};
