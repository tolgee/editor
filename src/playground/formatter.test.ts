import { TranslateParams } from "@tolgee/core";
import { formatter } from "./formatter";
import IntlMessageFormat from "intl-messageformat";
import { locales } from "./testing_locales";

function icu(locale: string, text: string, params?: TranslateParams) {
  return new IntlMessageFormat(text, locale, undefined, {
    ignoreTag: true,
  }).format(params);
}

function getText() {
  return expect.getState().currentTestName!.replace("simple formatter ", "");
}

function matchIcu(params?: TranslateParams, text = getText()) {
  locales.forEach((locale) => {
    const icuResult = icu(locale, text, params);
    const myResult = formatter(locale, text, params);
    expect(myResult).toEqual(icuResult);
  });
}

function expectToThrowWithIcu(params?: TranslateParams) {
  const text = getText();
  expect(() => icu("en", text, params)).toThrow();
  expect(() => formatter("en", text, params)).toThrow();
}

describe("simple formatter", () => {
  test("test test", () => {
    expect(getText()).toEqual("test test");
  });

  test("test test", () => {
    expect(getText()).toEqual("test test");
  });

  test("simple test", () => {
    matchIcu();
  });

  test("this is {name}", () => {
    matchIcu({ name: "Bob" });
  });

  test("this is {  name  }", () => {
    matchIcu({ name: "Bob" });
  });

  test("{ user } has { num } apples.", () => {
    matchIcu({ user: "John", num: 2 });
  });

  test("passing params, but no params here", () => {
    matchIcu({ user: "John", num: 2 });
  });

  test("{ user } has { user } apples.", () => {
    matchIcu({ user: "John", num: 2 });
  });

  test("ICU: '{ parameter '} format", () => {
    matchIcu();
  });

  test("this '{ escaped }' well", () => {
    matchIcu();
  });

  test("this is '{ weird } but valid", () => {
    matchIcu();
  });

  test("edge case '", () => {
    matchIcu();
  });

  test("What's {subject}?", () => {
    matchIcu({ subject: "that" });
  });

  test("this is also } right", () => {
    matchIcu();
  });

  test("this is just {} wrong", () => {
    expectToThrowWithIcu();
  });

  test("this also { } wrong", () => {
    expectToThrowWithIcu();
  });

  test("this plain { , } wrong", () => {
    expectToThrowWithIcu();
  });

  test("this is { unexpected", () => {
    expectToThrowWithIcu();
  });

  test("this is obviously bad { yo yo }", () => {
    expectToThrowWithIcu();
  });

  test("this is obviously bad { yo, }", () => {
    expectToThrowWithIcu();
  });

  test(`test {', number, ::percent} in param name`, () => {
    expectToThrowWithIcu({ "'": 0.1 });
  });

  // plurals
  test(`I have {num, plural, one {# one} two {# two} few {# few} many {# many} other {# other} } tests`, () => {
    matchIcu({ num: 1 });
    matchIcu({ num: 2 });
    matchIcu({ num: 4 });
    matchIcu({ num: 5 });
    matchIcu({ num: 10 });
  });

  test(`I have {num, plural, one {# one} two {# two} other {# other} few {# few} many {# many} } tests`, () => {
    matchIcu({ num: 1 });
  });

  test(`Almost {pctBlack, number, percent} of them are black.`, () => {
    matchIcu({ pctBlack: 0.1 });
  });

  test(`الاقتص– تضر البيئة – الاستخراج {لاقتصاد, number, percent} الموارد الطبيعية –`, () => {
    matchIcu({ لاقتصاد: 0.1 });
  });

  test("correctly handles escaped escapes in escape sequence", () => {
    matchIcu(undefined, "escaped '{} '' escape'");
  });

  test("escaped '{} { escape'", () => {
    matchIcu();
  });

  test("tough escape sequence", () => {
    matchIcu(undefined, "'' ' '{ '' ' '' '");
  });
});
