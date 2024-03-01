import { escapeIcuAll } from "./escapeIcuAll";
import { unescapeIcuAll } from "./unescapeIcuAll";

function escapeAndUnescape(text: string) {
  expect(unescapeIcuAll(escapeIcuAll(text))).toEqual(text);
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

  it("doesn't take tags escapes into consideration", () => {
    escapeAndUnescape("'<'");
  });

  it("handles tough escape sequence", () => {
    escapeAndUnescape("'' ' '{ '' ' '' '");
  });
});
