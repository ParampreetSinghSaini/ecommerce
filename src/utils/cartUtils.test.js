import { calculateCartTotal, countCartItems } from "./cartUtils";

const products = [
  { id: 1, name: "Shirt", new_price: 50, old_price: 80 },
  { id: 2, name: "Jacket", new_price: 120, old_price: 150 },
  { id: 3, name: "Cap", new_price: 15, old_price: 25 },
];

describe("calculateCartTotal", () => {
  test("returns 0 for an empty cart", () => {
    expect(calculateCartTotal({ 1: 0, 2: 0, 3: 0 }, products)).toBe(0);
  });

  test("uses new_price times quantity for each item", () => {
    // 2 shirts (2 x 50) + 1 jacket (1 x 120) = 220
    expect(calculateCartTotal({ 1: 2, 2: 1, 3: 0 }, products)).toBe(220);
  });

  test("ignores items that are not in the product list", () => {
    expect(calculateCartTotal({ 1: 1, 99: 3 }, products)).toBe(50);
  });
});

describe("countCartItems", () => {
  test("adds up all quantities above zero", () => {
    expect(countCartItems({ 1: 2, 2: 1, 3: 0 })).toBe(3);
  });
});