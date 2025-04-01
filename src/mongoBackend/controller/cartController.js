// controller/cartController.js
const Cart = require("../models/Cart");
const { Product } = require("../models/Products");
const ProductVariant = require("../models/productVariantSchema");
const stripe = require("stripe")(
  process.env.STRIPE_SECRET_KEY || "sk_test_tR3PYbcVNZZ796tH88S4VQ2u"
);

exports.addItemToCart = async (req, res) => {
  try {
    const { productId, variantId, quantity } = req.body;
    // Validate that the product exists
    //   console.log(productId)
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    // If variant is provided, validate it exists
    if (variantId) {
      const variant = await ProductVariant.findById(variantId);
      if (!variant) {
        return res.status(404).json({ message: "Product variant not found" });
      }
    }

    // Retrieve or create the user's cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Check if the item (combination of product and variant) already exists in the cart
    const itemIndex = cart.items.findIndex(
      (item) =>
        item.product.toString() === productId &&
        (variantId
          ? item.variant && item.variant.toString() === variantId
          : !item.variant)
    );

    if (itemIndex > -1) {
      // Update the quantity if it exists
      cart.items[itemIndex].quantity += quantity;
    } else {
      // Otherwise, add the new item to the cart
      cart.items.push({ product: productId, variant: variantId, quantity });
    }

    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getCart = async (req, res) => {
  try {
    // Populate product and variant details for a richer response
    const cart = await Cart.findOne({ user: req.user.id })
      .populate("items.product")
      .populate("items.variant");

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error retrieving cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.updateCartItem = async (req, res) => {
  try {
    const { quantity } = req.body;
    const { itemId } = req.params;

    // Retrieve the user's cart
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Find the cart item by its subdocument ID
    const item = cart.items.id(itemId);
    if (!item) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Update quantity and save changes
    item.quantity = quantity;
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error("Error updating cart item:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.removeCartItem = async (req, res) => {
  try {
    const { itemId } = req.params;
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    // Check if item exists in the cart
    const itemIndex = cart.items.findIndex(
      (item) => item._id.toString() === itemId
    );
    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in cart" });
    }

    // Remove the item using `splice`
    cart.items.splice(itemIndex, 1);

    // Save the updated cart
    await cart.save();

    res.status(200).json({ message: "Item removed successfully", cart });
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.syncCart = async (req, res) => {
  try {
    const { cartItems } = req.body; // expecting an array of cart items
    if (!Array.isArray(cartItems) || cartItems.length === 0) {
      return res.status(400).json({ message: "No cart items provided." });
    }

    // Retrieve or create the user's cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    // Loop over each item and process it
    for (const item of cartItems) {
      // Validate the product exists
      const product = await Product.findById(item.productId);
      if (!product) continue; // or handle the error as needed

      // Validate the variant exists if provided
      if (item.variantId) {
        const variant = await ProductVariant.findById(item.variantId);
        if (!variant) continue; // or handle the error as needed
      }

      // Check if the item already exists in the cart
      const existingIndex = cart.items.findIndex(
        (cartItem) =>
          cartItem.product.toString() === item.productId &&
          (item.variantId
            ? cartItem.variant && cartItem.variant.toString() === item.variantId
            : !cartItem.variant)
      );

      if (existingIndex > -1) {
        // Update the quantity if item exists
        cart.items[existingIndex].quantity += item.quantity;
      } else {
        // Otherwise, add the item
        cart.items.push({
          product: item.productId,
          variant: item.variantId || null,
          quantity: item.quantity,
        });
      }
    }

    await cart.save();
    res.status(200).json({ message: "Cart synced successfully", cart });
  } catch (error) {
    console.error("Error syncing cart:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.checkout = async (req, res) => {
  try {
    const { cart } = req.body;

    const line_items = cart.items.map((item) => {
      const unitAmount =
        (item.variant ? item.variant.price : item.product.price) * 100;

      return {
        price_data: {
          currency: "usd",
          product_data: {
            name: item.product.name,

            images: item.product.image ? [item.product.image] : [],
          },
          unit_amount: unitAmount,
        },
        quantity: item.quantity,
      };
    });
    // console.log(line_items)

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items,
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
    });

    res.status(200).json({ sessionId: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.webhook = async(req,res) =>{
  console.log('fdfd',req.body);
}