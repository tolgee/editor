import { decodeHTMLStrict } from "entities";

export type EntityInfoType = {
  decoded: string;
  raw: string;
  position: { start: number; end: number };
};

// Named (&eacute;), decimal (&#233;) or hex (&#xE9;) HTML character references.
// A trailing semicolon is required so a bare "&" in text (e.g. "Tom & Jerry")
// is never matched.
const ENTITY_REGEX = /&(#x[0-9a-fA-F]+|#[0-9]+|[a-zA-Z][a-zA-Z0-9]*);/g;

export const findEntities = (text: string): EntityInfoType[] => {
  const result: EntityInfoType[] = [];
  ENTITY_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = ENTITY_REGEX.exec(text)) !== null) {
    const raw = match[0];
    const decoded = decodeHTMLStrict(raw);
    // decodeHTMLStrict returns the input unchanged when it isn't a recognized
    // reference — that's how we tell "&b;" apart from "&eacute;".
    if (decoded === raw) {
      continue;
    }
    result.push({
      decoded,
      raw,
      position: { start: match.index, end: match.index + raw.length },
    });
  }
  return result;
};
