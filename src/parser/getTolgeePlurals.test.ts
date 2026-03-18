import { getTolgeePlurals } from "./getTolgeePlurals";

function getText() {
  return expect.getState().currentTestName!.replace("get tolgee plurals ", "");
}

function shouldBePlural(text = getText()) {
  expect(getTolgeePlurals(text, false).variants.one).not.toBeUndefined();
}

describe("get tolgee plurals", () => {
  it("{variable, plural, one {test} other {}}", () => {
    shouldBePlural();
  });

  it("{variable, plural, one {<} other {}}", () => {
    shouldBePlural();
  });

  it("variant with escaped inside", () => {
    shouldBePlural("{variable, plural, one {'{'} other {}}");
  });

  it("{value, plural, other {# tests} one {# test} }", () => {
    shouldBePlural();
  });

  it("ignores tags, when parsing plurals", () => {
    shouldBePlural("{value, plural, other {# '< tests} one {# test} }");
  });

  describe("variantOffsets", () => {
    function expectOffsetMatchesVariant(
      input: string,
      variant: Intl.LDMLPluralRule,
      raw = false
    ) {
      const result = getTolgeePlurals(input, raw);
      const text = result.variants[variant]!;
      const offset = result.variantOffsets?.[variant];
      expect(offset).toBeDefined();
      // When raw=false, variant text is the raw substring, so offset must match
      if (!raw) {
        expect(input.substring(offset!, offset! + text.length)).toBe(text);
      }
    }

    it("returns correct offsets for simple plural", () => {
      const input = "{variable, plural, one {test} other {rest}}";
      expectOffsetMatchesVariant(input, "one");
      expectOffsetMatchesVariant(input, "other");
    });

    it("returns correct offsets for plural with three variants", () => {
      const input =
        "{count, plural, one {# item} few {# items} other {# items}}";
      expectOffsetMatchesVariant(input, "one");
      expectOffsetMatchesVariant(input, "few");
      expectOffsetMatchesVariant(input, "other");
    });

    it("returns correct offsets with escaped content", () => {
      const input = "{variable, plural, one {'{'} other {rest}}";
      expectOffsetMatchesVariant(input, "one");
      expectOffsetMatchesVariant(input, "other");
    });

    it("returns offsets in raw mode", () => {
      const input = "{variable, plural, one {hello} other {world}}";
      const result = getTolgeePlurals(input, true);
      expect(result.variantOffsets).toBeDefined();
      // Simple text with no escapes — offset should still be consistent
      expectOffsetMatchesVariant(input, "one", true);
      expectOffsetMatchesVariant(input, "other", true);
    });

    it("does not return variantOffsets for non-plural input", () => {
      const result = getTolgeePlurals("just a plain string", false);
      expect(result.variantOffsets).toBeUndefined();
    });

    it("does not return variantOffsets for select (non-plural) expression", () => {
      const result = getTolgeePlurals(
        "{gender, select, male {He} female {She} other {They}}",
        false
      );
      expect(result.variantOffsets).toBeUndefined();
    });

    it("returns offset for empty variant content", () => {
      const input = "{variable, plural, one {test} other {}}";
      const result = getTolgeePlurals(input, false);
      expect(result.variantOffsets).toBeDefined();
      expectOffsetMatchesVariant(input, "one");
      // Empty variant — offset should still be defined
      expect(result.variantOffsets!.other).toBeDefined();
    });
  });
});
