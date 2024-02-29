import { getTolgeePlurals } from "./getTolgeePlurals";
import { TolgeeFormat } from "./types";

export const getTolgeeFormat = (
  input: string,
  plural: boolean,
  raw: boolean
): TolgeeFormat => {
  if (plural) {
    return getTolgeePlurals(input || "", raw);
  } else {
    return { variants: { other: input } };
  }
};
