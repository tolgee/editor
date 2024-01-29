import { getTolgeePlurals } from "./getTolgeePlurals";

function getText() {
  return expect.getState().currentTestName!.replace("get tolgee plurals ", "");
}

function shouldBePlural() {
  expect(getTolgeePlurals(getText())).not.toBeNull();
}

describe("get tolgee plurals", () => {
  it("{variable, plural, other {test}}", () => {
    shouldBePlural();
  });
});
