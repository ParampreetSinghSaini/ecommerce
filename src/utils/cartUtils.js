// Pure cart helpers so the maths can be tested without React.

export const calculateCartTotal = (cartItems, products) => {
  let totalAmount = 0;
  for (const itemId in cartItems) {
    const quantity = cartItems[itemId];
    if (quantity > 0) {
      const itemInfo = products.find((product) => product.id === Number(itemId));
      if (itemInfo) {
        totalAmount += itemInfo.new_price * quantity;
      }
    }
  }
  return totalAmount;
};

export const countCartItems = (cartItems) => {
  let totalItem = 0;
  for (const itemId in cartItems) {
    if (cartItems[itemId] > 0) {
      totalItem += cartItems[itemId];
    }
  }
  return totalItem;
};