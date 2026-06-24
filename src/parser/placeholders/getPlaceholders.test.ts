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

  it("parse self closing tag", () => {
    const placeholders = getPlaceholders("Hello <a/> there");
    expect(placeholders![0].normalizedValue).toEqual("<a />");
  });

  it("parse self closing tag 2", () => {
    const placeholders = getPlaceholders("Hello <a /> there");
    expect(placeholders![0].normalizedValue).toEqual("<a />");
  });

  it("doesnt parse invalid self closing tag", () => {
    const placeholders = getPlaceholders("Hello <a / > there");
    expect(placeholders![0]).toBeUndefined();
  });

  it("parse tag with params", () => {
    const placeholders = getPlaceholders('Hello <a href="test">there</a>');
    expect(placeholders![0].normalizedValue).toEqual('<a href="test">');
  });

  it("parse tag with param double quotes", () => {
    const placeholders = getPlaceholders('Hello <a href="test">there</a>');
    expect(placeholders![0].normalizedValue).toEqual('<a href="test">');
  });

  it("parse tag with param single quotes", () => {
    const placeholders = getPlaceholders("Hello <a href='test'>there</a>");
    expect(placeholders![0].normalizedValue).toEqual("<a href='test'>");
    expect(placeholders![1].normalizedValue).toEqual("</a>");
  });

  it("parse tag various params", () => {
    const placeholders = getPlaceholders(
      "<a a = 'test' b c = \"test\" d e='hello' >there</a>"
    );
    expect(placeholders![0].normalizedValue).toEqual(
      "<a a='test' b c=\"test\" d e='hello'>"
    );
    expect(placeholders![1].normalizedValue).toEqual("</a>");
  });

  it("ignores placeholders with new lines because codemirror goes crazy", () => {
    const placeholders = getPlaceholders("{\n value } <a \n>");
    expect(placeholders![0]).toBeUndefined();
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

  it("correctly indexes characters when unicode chars present - tags", () => {
    const placeholders = getPlaceholders("🐭-<link>blog</link>");
    const first = placeholders![0];
    expect(first.normalizedValue).toEqual("<link>");
    expect(first.position.start).toEqual(3);
    expect(placeholders![1].normalizedValue).toEqual("</link>");
  });

  it("correctly indexes characters when unicode chars present - placeholders", () => {
    const placeholders = getPlaceholders("🐭-{test}-");
    const first = placeholders![0];
    expect(first.normalizedValue).toEqual("{test}");
    expect(first.position.start).toEqual(3);
  });

  it("parse html entity", () => {
    const placeholders = getPlaceholders("Activit&eacute;");
    expect(placeholders![0].type).toEqual("entity");
    expect(placeholders![0].name).toEqual("é");
    expect(placeholders![0].normalizedValue).toEqual("&eacute;");
  });

  it("ignores a bare ampersand", () => {
    expect(getPlaceholders("Tom & Jerry")).toEqual([]);
  });

  it("orders entities and tags by position", () => {
    const placeholders = getPlaceholders("&amp;<a>x</a>");
    expect(placeholders!.map((p) => p.type)).toEqual([
      "entity",
      "tagOpen",
      "tagClose",
    ]);
  });

  it("ignores entities inside a tag attribute", () => {
    const placeholders = getPlaceholders('<a href="x&amp;y">z</a>');
    expect(placeholders!.map((p) => p.type)).toEqual(["tagOpen", "tagClose"]);
  });
});
