import { parse } from "@formatjs/icu-messageformat-parser";
import { parser } from "./tolgeeParser";

function icu(text: string, ignoreTag = true) {
  return parse(text, {
    captureLocation: true,
    ignoreTag,
  });
}

function tolgee(text: string) {
  return parser.configure({ strict: true, dialect: "tags" }).parse(text);
}

function getText() {
  return expect.getState().currentTestName!.replace("simple formatter ", "");
}

function matchIcu(text = getText()) {
  expect(() => icu(text)).not.toThrow();
  expect(() => tolgee(text)).not.toThrow();
}

describe("tolgee parser with tags", () => {
  test("This is < invalid > tag", () => {
    matchIcu();
  });

  test("Test <a>valid</a> tag", () => {
    matchIcu();
  });

  test("Test '<a>' escaped tag", () => {
    matchIcu();
  });

  test("tag escaping causing also more stuff to be escaped", () => {
    matchIcu("This '<a> {} is all escaped");
  });
});
