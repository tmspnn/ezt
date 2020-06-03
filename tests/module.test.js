const lib = require("../dist/ezt");
const ezt = lib.default;
const { createComponent } = lib;

test("Module", () => {
  expect(typeof ezt).toBe("function");
  expect(createComponent).toEqual(ezt);
});
