import { getTolgeePlurals } from "./getTolgeePlurals";
import { TolgeeFormat } from "./types";

export const getTolgeeFormat = (
  input: string,
  plural: boolean
): TolgeeFormat => {
  if (plural) {
    return getTolgeePlurals(input || "");
  } else {
    return { variants: { other: input } };
  }
};
