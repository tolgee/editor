/**
 * Source https://github.com/formatjs/formatjs/blob/main/packages/icu-messageformat-parser/parser.ts
 */

export function isTagNameChar(c: number): boolean {
  return (
    c === 45 /* '-' */ ||
    c === 46 /* '.' */ ||
    (c >= 48 && c <= 57) /* 0..9 */ ||
    c === 95 /* '_' */ ||
    (c >= 97 && c <= 122) /** a..z */ ||
    (c >= 65 && c <= 90) /* A..Z */ ||
    c == 0xb7 ||
    (c >= 0xc0 && c <= 0xd6) ||
    (c >= 0xd8 && c <= 0xf6) ||
    (c >= 0xf8 && c <= 0x37d) ||
    (c >= 0x37f && c <= 0x1fff) ||
    (c >= 0x200c && c <= 0x200d) ||
    (c >= 0x203f && c <= 0x2040) ||
    (c >= 0x2070 && c <= 0x218f) ||
    (c >= 0x2c00 && c <= 0x2fef) ||
    (c >= 0x3001 && c <= 0xd7ff) ||
    (c >= 0xf900 && c <= 0xfdcf) ||
    (c >= 0xfdf0 && c <= 0xfffd) ||
    (c >= 0x10000 && c <= 0xeffff)
  );
}

/**
 * Code point equivalent of regex `\p{White_Space}`.
 * From: https://www.unicode.org/Public/UCD/latest/ucd/PropList.txt
 */
export function isWhiteSpace(c: number) {
  return (
    (c >= 0x0009 && c <= 0x000d) ||
    c === 0x0020 ||
    c === 0x0085 ||
    (c >= 0x200e && c <= 0x200f) ||
    c === 0x2028 ||
    c === 0x2029
  );
}
