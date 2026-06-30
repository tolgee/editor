import { findEntities } from "./findEntities";

describe("findEntities", () => {
  it("finds a named entity", () => {
    const result = findEntities("Activit&eacute;");
    expect(result).toEqual([
      { decoded: "é", raw: "&eacute;", position: { start: 7, end: 15 } },
    ]);
  });

  it("finds a decimal numeric entity", () => {
    const result = findEntities("caf&#233;");
    expect(result[0].decoded).toEqual("é");
    expect(result[0].raw).toEqual("&#233;");
  });

  it("finds a hex numeric entity", () => {
    const result = findEntities("caf&#xE9;");
    expect(result[0].decoded).toEqual("é");
    expect(result[0].raw).toEqual("&#xE9;");
  });

  it("decodes nbsp", () => {
    const result = findEntities("a&nbsp;b");
    expect(result[0].decoded).toEqual(" ");
  });

  it("decodes amp, lt, gt", () => {
    expect(findEntities("&amp;")[0].decoded).toEqual("&");
    expect(findEntities("&lt;")[0].decoded).toEqual("<");
    expect(findEntities("&gt;")[0].decoded).toEqual(">");
  });

  it("ignores a bare ampersand", () => {
    expect(findEntities("Tom & Jerry")).toEqual([]);
    expect(findEntities("AT&T")).toEqual([]);
  });

  it("ignores an unrecognized reference", () => {
    expect(findEntities("a&notarealentity;b")).toEqual([]);
  });

  it("requires the trailing semicolon", () => {
    expect(findEntities("&eacute no semicolon")).toEqual([]);
  });

  it("finds multiple entities", () => {
    const result = findEntities("&eacute;-&agrave;");
    expect(result.map((e) => e.decoded)).toEqual(["é", "à"]);
    expect(result[1].position.start).toEqual(9);
  });
});
