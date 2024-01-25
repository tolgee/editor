import { checkParamNameIsValid } from "./checkParamNameIsValid";
import { escapeIcuVariant } from "./escapeIcuPart";
import { parser } from "./tolgeeParser";
import { TolgeeFormat } from "./types";

function parse(input: string) {
  return parser.configure({ strict: true }).parse(input);
}

export const tolgeeFormatGenerateIcu = (format: TolgeeFormat) => {
  const { parameter, variants } = format;
  if (!checkParamNameIsValid(parameter)) {
    throw new Error(`Parameter name "${parameter}" is invalid`);
  }

  const result: string[] = [`{${parameter}, plural,`];
  for (const [variant, content] of variants.entries()) {
    try {
      parse(`{${parameter}, plural, other {${content}}}`);
      result.push(` ${variant} {${content}}`);
    } catch (e) {
      // if the variant is invalid, escape it
      result.push(` ${variant} {${escapeIcuVariant(content)}}`);
    }
  }
  result.push("}");
  return result.join("");
};
