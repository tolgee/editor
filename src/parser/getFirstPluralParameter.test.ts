import { getFirstPluralParameter } from "./getFirstPluralParameter";

describe("get first plural parameter", () => {
  it("returns undefined if there is no plural", () => {
    const text = "Plain text";
    expect(getFirstPluralParameter(text)).toEqual(undefined);
  });

  it("returns undefined if icu is invalid", () => {
    const text = "Plain text {testValue, plural, other {";
    expect(getFirstPluralParameter(text)).toEqual(undefined);
  });

  it("parses out tolgee format", () => {
    const text = "{testValue, plural, one {# item} other {# items}}";
    expect(getFirstPluralParameter(text)).toEqual("testValue");
  });

  it("handles invalid tolgee format but valid icu plural", () => {
    const text = "There is {testValue, plural, one {# item} other {# items}}";
    expect(getFirstPluralParameter(text)).toEqual("testValue");
  });

  it("ignores select", () => {
    const text = "There is {ignored, select, one {# item} other {# items}}";
    expect(getFirstPluralParameter(text)).toEqual(undefined);
  });

  it("handles plural after select", () => {
    const text =
      "There is {ignored, select, one {# item} other {# items}} {testValue, plural, one {# item} other {# items}}";
    expect(getFirstPluralParameter(text)).toEqual("testValue");
  });

  it("ignores plural inside select", () => {
    const text =
      "There is {ignored, select, other {{testValue, plural, one {# item} other {# items}}}}";
    expect(getFirstPluralParameter(text)).toEqual(undefined);
  });
});
