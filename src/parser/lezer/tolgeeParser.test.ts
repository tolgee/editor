import { parse } from "@formatjs/icu-messageformat-parser";
import { parser } from "./tolgeeParser";

function icu(text: string, ignoreTag = true) {
  return parse(text, {
    captureLocation: true,
    ignoreTag,
  });
}

function tolgee(text: string) {
  return parser.configure({ strict: true }).parse(text);
}

function getText() {
  return expect.getState().currentTestName!.replace("simple formatter ", "");
}

function matchIcu(text = getText()) {
  expect(() => icu(text)).not.toThrow();
  expect(() => tolgee(text)).not.toThrow();
}

function expectToThrowWithIcu(text = getText()) {
  expect(() => icu(text)).toThrow();
  expect(() => tolgee(text)).toThrow();
}

function expectToThrow(text = getText()) {
  expect(() => tolgee(text)).toThrow();
}

describe("simple formatter", () => {
  test("simple test", () => {
    matchIcu();
  });

  test("this is {name}", () => {
    matchIcu();
  });

  test("this is {  name  }", () => {
    matchIcu();
  });

  test("{ user } has { num } apples.", () => {
    matchIcu();
  });

  test("passing params, but no params here", () => {
    matchIcu();
  });

  test("{ user } has { user } apples.", () => {
    matchIcu();
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
    matchIcu();
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
    expectToThrowWithIcu();
  });

  // plurals
  test(`I have {num, plural, one {# one} two {# two} few {# few} many {# many} other {# other} } tests`, () => {
    matchIcu();
  });

  test(`I have {num, plural, one {# one} two {# two} other {# other} few {# few} many {# many} } tests`, () => {
    matchIcu();
  });

  test(`Almost {pctBlack, number, percent} of them are black.`, () => {
    matchIcu();
  });

  test(`الاقتص– تضر البيئة – الاستخراج {لاقتصاد, number, percent} الموارد الطبيعية –`, () => {
    matchIcu();
  });

  test("Auto translated {test, plural, offset:1 one {# translation} other {# translations}}", () => {
    matchIcu();
  });

  test("Auto translated {test, plural, offset:-1 one {# translation} other {# translations}}", () => {
    matchIcu();
  });

  test("tripple quotes", () => {
    matchIcu("{value, plural, other {'''{'''}}");
  });

  test("Auto translated {test, plural, offset:-1, one {# translation} other {# translations}}", () => {
    expectToThrowWithIcu();
  });

  test("Wont take tags as escapabable", () => {
    expectToThrow("{value, plural, other {'<>'}}");
  });

  test("Accepts ={number} format", () => {
    matchIcu(
      "Auto translated {test, plural, =1 {# translation} other {# translations}}"
    );
  });
});
