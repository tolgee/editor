import { escapeIcuVariant } from "./escapeIcuVariant";

describe("escape icu variant", () => {
  it("handles parameter", () => {
    expect(escapeIcuVariant("this {is} variant")).toEqual(
      "this '{is}' variant"
    );
  });

  it("handles already escaped parameter", () => {
    expect(escapeIcuVariant("this '{is}' variant")).toEqual(
      "this '{is}' variant"
    );
  });

  it("handles text with apostrophe", () => {
    expect(escapeIcuVariant("apostrophe ' is here")).toEqual(
      "apostrophe ' is here"
    );
  });

  it("doesn't escape hash", () => {
    expect(escapeIcuVariant("hash # is here")).toEqual("hash # is here");
  });

  it("escapes shortest necessary distance", () => {
    expect(escapeIcuVariant("hash {param} is here {param2} and here")).toEqual(
      "hash '{param} is here {param2}' and here"
    );
  });

  it("handles double quotes", () => {
    expect(escapeIcuVariant("this is '' not {param} escaped")).toEqual(
      "this is '' not '{param}' escaped"
    );
  });

  it("handles triple quotes", () => {
    expect(escapeIcuVariant("this is ''' actually #' escaped")).toEqual(
      "this is ''' actually #' escaped"
    );
  });

  it("takes hash as escape character", () => {
    expect(escapeIcuVariant("should be '# }' escaped")).toEqual(
      "should be '# }' escaped"
    );
  });

  it("escapes dangling escape at the end", () => {
    expect(escapeIcuVariant("test '")).toEqual("test ''");
  });

  it("doesn't take tags escapes into consideration", () => {
    expect(escapeIcuVariant("'<'")).toEqual("'<''");
  });
});