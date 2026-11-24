const { parseFilter } = require("./parseFilter");

describe("parseFilter", () => {
  test("returns an empty filter when nothing is passed", () => {
    expect(parseFilter(undefined)).toEqual({});
  });

  test("parses a normal JSON filter", () => {
    expect(parseFilter('{"category":"men"}')).toEqual({ category: "men" });
  });

  test("does not run code sent in the filter", () => {
    globalThis.__hacked = false;
    try {
      parseFilter("(globalThis.__hacked = true, {})");
    } catch (e) {}
    expect(globalThis.__hacked).toBe(false);
  });
});