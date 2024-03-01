import { parse } from "@formatjs/icu-messageformat-parser";
import { escapeIcuAll } from "./escapeIcuAll";

function escapesAndIsValid(input: string) {
  const result = escapeIcuAll(input);
  parse(`{value, plural, other {${result}}}`);
  return result;
}

describe("escape icu variant", () => {
  it("handles parameter", () => {
    expect(escapesAndIsValid("this {is} variant")).toEqual(
      "this '{'is'}' variant"
    );
  });

  it("handles already escaped parameter", () => {
    expect(escapesAndIsValid("this '{is}' variant")).toEqual(
      "this '''{'is'}''' variant"
    );
  });

  it("handles text with apostrophe", () => {
    expect(escapesAndIsValid("apostrophe ' is here")).toEqual(
      "apostrophe ' is here"
    );
  });

  it("escapes hash", () => {
    expect(escapesAndIsValid("hash # is here")).toEqual("hash '#' is here");
  });

  it("handles double quotes", () => {
    expect(escapesAndIsValid("this is '' not {param} escaped")).toEqual(
      "this is '''' not '{'param'}' escaped"
    );
  });

  it("handles triple quotes", () => {
    expect(escapesAndIsValid("unescaped ''' unescaped #' unescaped")).toEqual(
      "unescaped ''''' unescaped '#''' unescaped"
    );
  });

  it("takes hash as escape character", () => {
    expect(escapesAndIsValid("should be '# }' escaped")).toEqual(
      "should be '''#' '}''' escaped"
    );
  });

  it("escapes dangling escape at the end", () => {
    expect(escapesAndIsValid("test '")).toEqual("test ''");
  });

  it("handles tough escape sequence", () => {
    expect(escapesAndIsValid("' ' '{ '' ' '' '")).toEqual(
      "' ' '''{' '''' ' '''' ''"
    );
  });

  it("handles case with two escapes inside escape sequence", () => {
    expect(escapesAndIsValid("{}")).toEqual("'{}'");
  });

  // tags won't work with icu parser
  it("doesn't take tags escapes into consideration", () => {
    expect(escapeIcuAll("'<'")).toEqual("'<''");
  });
});
