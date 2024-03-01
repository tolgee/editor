import { escapeIcuAll } from "./escapeIcuAll";

describe("escape icu variant", () => {
  it("handles parameter", () => {
    expect(escapeIcuAll("this {is} variant")).toEqual("this '{'is'}' variant");
  });

  it("handles already escaped parameter", () => {
    expect(escapeIcuAll("this '{is}' variant")).toEqual(
      "this '''{'is'}'' variant"
    );
  });

  it("handles text with apostrophe", () => {
    expect(escapeIcuAll("apostrophe ' is here")).toEqual(
      "apostrophe ' is here"
    );
  });

  it("escapes hash", () => {
    expect(escapeIcuAll("hash # is here")).toEqual("hash '#' is here");
  });

  it("handles double quotes", () => {
    expect(escapeIcuAll("this is '' not {param} escaped")).toEqual(
      "this is '''' not '{'param'}' escaped"
    );
  });

  it("handles triple quotes", () => {
    expect(escapeIcuAll("this is ''' actually #' escaped")).toEqual(
      "this is ''''' actually '#'' escaped"
    );
  });

  it("takes hash as escape character", () => {
    expect(escapeIcuAll("should be '# }' escaped")).toEqual(
      "should be '''#' '}'' escaped"
    );
  });

  it("escapes dangling escape at the end", () => {
    expect(escapeIcuAll("test '")).toEqual("test ''");
  });

  it("doesn't take tags escapes into consideration", () => {
    expect(escapeIcuAll("'<'")).toEqual("'<''");
  });

  it("handles tough escape sequence", () => {
    expect(escapeIcuAll("' ' '{ '' ' '' '")).toEqual(
      "' ' '''{' '''' ' '''' ''"
    );
  });
});
