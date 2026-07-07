import { getInvalidPlaceholders } from "./getInvalidPlaceholders";

describe("getInvalidPlaceholders", () => {
  it("returns nothing for plain text", () => {
    expect(getInvalidPlaceholders("Nothing here")).toEqual([]);
  });

  it("returns nothing for a valid placeholder", () => {
    expect(getInvalidPlaceholders("Hello {name}")).toEqual([]);
  });

  it("returns nothing for a valid plural", () => {
    expect(
      getInvalidPlaceholders("{count, plural, one {# item} other {# items}}")
    ).toEqual([]);
  });

  it("detects an invalid ICU placeholder", () => {
    expect(getInvalidPlaceholders("before {placeholder:space} after")).toEqual([
      { position: { start: 7, end: 26 }, value: "{placeholder:space}" },
    ]);
  });

  it("detects a dotted key as invalid", () => {
    expect(getInvalidPlaceholders("{some.key}")).toEqual([
      { position: { start: 0, end: 10 }, value: "{some.key}" },
    ]);
  });

  it("detects multiple invalid placeholders", () => {
    expect(
      getInvalidPlaceholders("{a:b} and {c.d}")!.map((p) => p.value)
    ).toEqual(["{a:b}", "{c.d}"]);
  });

  it("keeps valid placeholders out of the result", () => {
    expect(
      getInvalidPlaceholders("{name} and {bad:one}")!.map((p) => p.value)
    ).toEqual(["{bad:one}"]);
  });

  it("captures a comma-containing invalid body as one", () => {
    expect(
      getInvalidPlaceholders("x {placeholder:space, foo} y")!.map((p) => p.value)
    ).toEqual(["{placeholder:space, foo}"]);
  });

  it("captures an invalid body starting with a bidi mark as one", () => {
    const rlm = "‏";
    expect(
      getInvalidPlaceholders(`x {${rlm}placeholder:space} y`)!.map((p) => p.value)
    ).toEqual([`{${rlm}placeholder:space}`]);
  });

  it("returns null when the text can't be parsed", () => {
    expect(getInvalidPlaceholders("unclosed {")).toBeNull();
  });
});
