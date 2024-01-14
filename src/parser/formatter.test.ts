import { TranslateParams } from "@tolgee/core";
import { formatter } from "./formatter";
import IntlMessageFormat from "intl-messageformat";

function icu(text: string, params?: TranslateParams) {
  return new IntlMessageFormat(text, "en", undefined, {
    ignoreTag: true,
  }).format(params);
}

function getText() {
  return expect.getState().currentTestName!.replace("simple formatter ", "");
}

function matchIcu(params?: TranslateParams) {
  const text = getText();
  expect(formatter(text, params)).toEqual(icu(text, params));
}

function expectToThrowWithIcu(params?: TranslateParams) {
  const text = getText();
  expect(() => icu(text, params)).toThrow();
  expect(() => formatter(text, params)).toThrow();
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
});
