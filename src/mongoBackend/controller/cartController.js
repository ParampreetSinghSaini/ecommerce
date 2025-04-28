// controller/cartController.js
const Cart = require("../models/Cart");
const Order = require('../models/OrderSchema');


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
    const userId = req.user?.id; 
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
      client_reference_id : userId, 
    });

    res.status(200).json({ sessionId: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


exports.webhook = async (req, res) => {
  // console.log('🔔 Incoming Webhook Body:', JSON.stringify(req.body));

  const event = req.body;
  const session = event.data?.object;

  if (event.type !== 'checkout.session.completed') {
    return res.status(400).json({ message: 'Unhandled event type' });
  }

  const userId = session.client_reference_id;

  try {
    // 1. Get cart before deleting it
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    // console.log(cart)
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }

    // 2. Save Order
    const newOrder = new Order({
      user: userId,
      stripeSessionId: session.id,
      stripePaymentIntentId: session.payment_intent,
      amount: session.amount_total,
      currency: session.currency,
      paymentStatus: session.payment_status,
      items: cart.items.map(item => ({
        product: item.product._id,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price
      })),
      customer: {
        name: session.customer_details.name,
        email: session.customer_details.email,
        address: {
          line1: session.customer_details.address.line1,
          line2: session.customer_details.address.line2,
          city: session.customer_details.address.city,
          state: session.customer_details.address.state,
          postal_code: session.customer_details.address.postal_code,
          country: session.customer_details.address.country,
        }
      },
      status: 'pending', // or 'completed' based on your logic
    });

    await newOrder.save();

    // for (const item of cart.items) {
    //   if (item.variant) {
    //     await ProductVariant.findByIdAndUpdate(
    //       item.variant,
    //       { $inc: { stock: -item.quantity } },
    //       { new: true }
    //     );
    //   }
    // }

    await Cart.deleteOne({ user: userId });

    res.status(200).json({ message: 'Order placed and cart cleared successfully' });
  } catch (error) {
    console.error('🔥 Error processing webhook:', error);
    res.status(500).json({ message: 'Webhook processing failed' });
  }
};



exports.getOrder = async (req, res) => {
  try {
    const userId = req.user.id; // assuming verifyToken adds user info to req.user

    const orders = await Order.find({ user: userId })
      .populate('items.product')         // populate product details
      .populate('items.variant')         // populate variant details (if any)
      .sort({ createdAt: -1 });          // most recent first

    if (!orders.length) {
      return res.status(404).json({ message: 'No orders found for this user.' });
    }

    res.status(200).json({ orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ message: 'Failed to fetch orders' });
  }
};
