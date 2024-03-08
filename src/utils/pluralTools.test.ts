import { getVariantExample } from "./pluralTools";

describe("variant example", () => {
  it("returns number in simple case", () => {
    expect(getVariantExample("cs", "few")).toEqual(2);
  });

  it("returns undefined if variant is nonsence", () => {
    expect(getVariantExample("cs", "bla")).toBeUndefined();
  });

  it("extracts number from = variant", () => {
    expect(getVariantExample("cs", "=10")).toEqual(10);
  });

  it("extracts positive number from = variant", () => {
    expect(getVariantExample("cs", "=+10")).toEqual(10);
  });

  it("extracts negative number from = variant", () => {
    expect(getVariantExample("cs", "=-10")).toEqual(-10);
  });

  it("won't fail for custom language tag", () => {
    expect(getVariantExample("aa-custom-lang-test", "one")).toBeUndefined();
  });
});
