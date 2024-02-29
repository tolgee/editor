import { tolgeeFormatGenerateIcu } from "./tolgeeFormatGenerateIcu";

describe("tolgee format generate icu", () => {
  it("without raw mode", () => {
    expect(
      tolgeeFormatGenerateIcu(
        { parameter: "value", variants: { other: "{test}" } },
        false
      )
    ).toEqual("{value, plural, other {{test}}}");
  });

  it("without raw mode, no plural", () => {
    expect(
      tolgeeFormatGenerateIcu({ variants: { other: "{test}" } }, false)
    ).toEqual("{test}");
  });

  it("raw mode", () => {
    expect(
      tolgeeFormatGenerateIcu(
        { parameter: "value", variants: { other: "{test}" } },
        true
      )
    ).toEqual("{value, plural, other {'{'test'}'}}");
  });

  it("raw mode, no plural", () => {
    expect(
      tolgeeFormatGenerateIcu({ variants: { other: "{test}" } }, true)
    ).toEqual("{test}");
  });
});
