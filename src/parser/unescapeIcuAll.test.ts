import { escapeIcuAll } from "./escapeIcuAll";
import { unescapeIcuAll } from "./unescapeIcuAll";

describe("escape icu variant", () => {
  it("handles parameter", () => {
    expect(unescapeIcuAll(escapeIcuAll("this {is} variant"))).toEqual(
      "this {is} variant"
    );
  });

  it("handles already escaped parameter", () => {
    expect(unescapeIcuAll(escapeIcuAll("this '{is}' variant"))).toEqual(
      "this '{is}' variant"
    );
  });

  it("handles text with apostrophe", () => {
    expect(unescapeIcuAll(escapeIcuAll("apostrophe ' is here"))).toEqual(
      "apostrophe ' is here"
    );
  });

  it("escapes hash", () => {
    expect(unescapeIcuAll(escapeIcuAll("apostrophe ' is here"))).toEqual(
      "apostrophe ' is here"
    );
  });

  it("handles double quotes", () => {
    expect(
      unescapeIcuAll(escapeIcuAll("this is '' not {param} escaped"))
    ).toEqual("this is '' not {param} escaped");
  });

  it("handles triple quotes", () => {
    expect(
      unescapeIcuAll(escapeIcuAll("this is ''' actually #' escaped"))
    ).toEqual("this is ''' actually #' escaped");
  });

  it("takes hash as escape character", () => {
    expect(unescapeIcuAll(escapeIcuAll("should be '# }' escaped"))).toEqual(
      "should be '# }' escaped"
    );
  });

  it("escapes dangling escape at the end", () => {
    expect(unescapeIcuAll(escapeIcuAll("test '"))).toEqual("test '");
  });

  it("doesn't take tags escapes into consideration", () => {
    expect(unescapeIcuAll(escapeIcuAll("'<'"))).toEqual("'<'");
  });
});
