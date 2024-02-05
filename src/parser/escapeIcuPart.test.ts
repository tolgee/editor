import { escapeIcuVariant } from "./escapeIcuPart";

describe("escape icu part", () => {
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
});
