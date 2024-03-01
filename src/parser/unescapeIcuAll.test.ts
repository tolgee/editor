import { unescapeIcuAll } from "./unescapeIcuAll";

describe("unescapes icu variant", () => {
  it("handles parameter", () => {
    expect(unescapeIcuAll("this '{is}' variant")).toEqual("this {is} variant");
  });

  it("handles escaped escapes", () => {
    expect(unescapeIcuAll("this '''{''is''}'' variant")).toEqual(
      "this '{'is'}' variant"
    );
  });

  it("handles text with apostrophe", () => {
    expect(unescapeIcuAll("apostrophe ' is here")).toEqual(
      "apostrophe ' is here"
    );
  });

  it("escapes hash", () => {
    expect(unescapeIcuAll("hash '#' is here")).toEqual("hash # is here");
  });

  it("handles double quotes", () => {
    expect(unescapeIcuAll("this is '''' not '{'param'}' escaped")).toEqual(
      "this is '' not {param} escaped"
    );
  });

  it("handles triple quotes", () => {
    expect(unescapeIcuAll("this is ''''' actually '#'' escaped")).toEqual(
      "this is ''' actually #' escaped"
    );
  });

  it("doesn't take tags escapes into consideration", () => {
    expect(unescapeIcuAll("'<'")).toEqual("'<'");
  });

  it("handles tough escape sequence", () => {
    expect(unescapeIcuAll("' ' '{ '' ' '' '")).toEqual("' ' { '  ' '");
  });

  it("handles case with two escapes inside escape sequence", () => {
    expect(unescapeIcuAll("'{''}'")).toEqual("{'}");
  });
});
