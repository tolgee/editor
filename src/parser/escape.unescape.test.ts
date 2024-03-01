import { escapeIcuAll } from "./escapeIcuAll";
import { unescapeIcuAll } from "./unescapeIcuAll";
import { parse } from "@formatjs/icu-messageformat-parser";

function escapeAndUnescape(text: string) {
  const result = escapeIcuAll(text);
  parse(`{value, plural, other {${result}}}`);
  expect(unescapeIcuAll(result)).toEqual(text);
}

describe("escape icu variant", () => {
  it("handles parameter", () => {
    escapeAndUnescape("this {is} variant");
  });

  it("handles already escaped parameter", () => {
    escapeAndUnescape("this '{is}' variant");
  });

  it("handles text with apostrophe", () => {
    escapeAndUnescape("apostrophe ' is here");
  });

  it("escapes hash", () => {
    escapeAndUnescape("apostrophe ' is here");
  });

  it("handles double quotes", () => {
    escapeAndUnescape("this is '' not {param} escaped");
  });

  it("handles triple quotes", () => {
    escapeAndUnescape("this is ''' actually #' escaped");
  });

  it("takes hash as escape character", () => {
    escapeAndUnescape("should be '# }' escaped");
  });

  it("escapes dangling escape at the end", () => {
    escapeAndUnescape("test '");
  });

  it("handles tough escape sequence", () => {
    escapeAndUnescape("'' ' '{ '' ' '' '");
  });

  it("handles case with two escapes inside escape sequence", () => {
    escapeAndUnescape("{}");
  });

  it("handles multiple escape chars after one another", () => {
    escapeAndUnescape("{{'''{'}}'");
  });
});
