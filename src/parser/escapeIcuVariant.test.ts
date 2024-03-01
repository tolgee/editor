import { escapeIcuVariant } from "./escapeIcuVariant";
import { parse } from "@formatjs/icu-messageformat-parser";

function escapesAndIsValid(input: string) {
  const result = escapeIcuVariant(input);
  parse(`{value, plural, other {${result}}}`);
  return result;
}

describe("escape icu variant", () => {
  it("handles parameter", () => {
    expect(escapesAndIsValid("this {is} variant")).toEqual(
      "this '{is}' variant"
    );
  });

  it("handles already escaped parameter", () => {
    expect(escapesAndIsValid("this '{is}' variant")).toEqual(
      "this '{is}' variant"
    );
  });

  it("handles text with apostrophe", () => {
    expect(escapesAndIsValid("apostrophe ' is here")).toEqual(
      "apostrophe ' is here"
    );
  });

  it("doesn't escape hash", () => {
    expect(escapesAndIsValid("hash # is here")).toEqual("hash # is here");
  });

  it("escapes shortest necessary distance", () => {
    expect(escapesAndIsValid("hash {param} is here {param2} and here")).toEqual(
      "hash '{param} is here {param2}' and here"
    );
  });

  it("handles double quotes", () => {
    expect(escapesAndIsValid("this is '' not {param} escaped")).toEqual(
      "this is '' not '{param}' escaped"
    );
  });

  it("handles triple quotes", () => {
    expect(escapesAndIsValid("this is ''' actually #' escaped")).toEqual(
      "this is ''' actually #' escaped"
    );
  });

  it("takes hash as escape character", () => {
    expect(escapesAndIsValid("should be '# }' escaped")).toEqual(
      "should be '# }' escaped"
    );
  });

  it("escapes dangling escape at the end", () => {
    expect(escapesAndIsValid("test '")).toEqual("test ''");
  });

  it("handles apostrophes in escape sequence correctly", () => {
    expect(escapesAndIsValid("'{ '' }'")).toEqual("'{ '' }'");
  });

  it("escapes stuff correctly when apostrophes as parameter", () => {
    expect(escapesAndIsValid("{ '' }")).toEqual("'{ '' }'");
  });

  it("escapes stuff correctly when apostrophe as parameter", () => {
    expect(escapesAndIsValid("{ ' }")).toEqual("'{' ' '}'");
  });

  it("handles apostrophes and dangling escape sequence at the end", () => {
    expect(escapesAndIsValid("# položka seznamu '{ '' }")).toEqual(
      "# položka seznamu '{ '' }'"
    );
  });

  // is not valid for icu parser, because that one considers tags escapable
  it("doesn't take tags escapes into consideration", () => {
    expect(escapeIcuVariant("'<'")).toEqual("'<''");
  });
});
