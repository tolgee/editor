import { getTolgeePlurals } from "./getTolgeePlurals";

function getText() {
  return expect.getState().currentTestName!.replace("get tolgee plurals ", "");
}

function shouldBePlural(text = getText()) {
  expect(getTolgeePlurals(text).variants.one).not.toBeUndefined();
}

describe("get tolgee plurals", () => {
  it("{variable, plural, one {test} other {}}", () => {
    shouldBePlural();
  });

  it("{variable, plural, one {<} other {}}", () => {
    shouldBePlural();
  });

  it("variant with escaped inside", () => {
    shouldBePlural("{variable, plural, one {'{'} other {}}");
  });

  it(`{value, plural,
    other {# tests}
    one {# test}
    }`, () => {
    shouldBePlural();
  });
});
