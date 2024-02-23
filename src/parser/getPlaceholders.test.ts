import { getPlaceholders } from "./getPlaceholders";

describe("get placeholders", () => {
  it("parse plain text", () => {
    const placeholders = getPlaceholders("Nothing here");
    expect(placeholders).toEqual([]);
  });

  it("hash in root is ignored", () => {
    const placeholders = getPlaceholders("Simple # hash");
    expect(placeholders).toEqual([]);
  });

  it("hash in nested is not ignored", () => {
    const placeholders = getPlaceholders("Nested # hash", true);
    expect(placeholders![0].normalizedValue).toEqual("#");
  });

  it("parse variable correctly", () => {
    const placeholders = getPlaceholders("{ num,  number,  ::short }");
    expect(placeholders![0].normalizedValue).toEqual("{num, number, ::short}");
  });

  it("parse open tag", () => {
    const placeholders = getPlaceholders("Hello <a> there");
    expect(placeholders![0].normalizedValue).toEqual("<a>");
  });

  it("parse complicated stuff", () => {
    const placeholders = getPlaceholders(
      "{ name }<a >{ num  , number  ,   ::short  }</a  >{ test }"
    );
    expect(placeholders![0].normalizedValue).toEqual("{name}");
    expect(placeholders![1].normalizedValue).toEqual("<a>");
    expect(placeholders![2].normalizedValue).toEqual("{num, number, ::short}");
    expect(placeholders![3].normalizedValue).toEqual("</a>");
    expect(placeholders![4].normalizedValue).toEqual("{test}");
  });
});
