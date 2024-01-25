import { escapeIcuVariant } from "./escapeIcuPart";

describe("escape icu part", () => {
  it("handles parameter", () => {
    expect(escapeIcuVariant("this {is} variant")).toEqual(
      "this '{is} variant'"
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

  it("handles text with hash placeholder", () => {
    expect(escapeIcuVariant("hash # is here")).toEqual("hash '# is here'");
  });
});
