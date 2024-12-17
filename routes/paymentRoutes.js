import express from "express";
import Stripe from "stripe";
import { Order } from "../models/orderModel.js";
import { User } from "../models/userModel.js";
import { Cart } from "../models/cartModel.js";

const router = express.Router();
const stripe = new Stripe(process.env.stripe_secret_key);
const client_domain = process.env.CLIENT_DOMAIN;

// Route to create a Stripe Checkout Session
router.post("/create-checkout-session", async (req, res) => {
  try {
    const { cart, userId, deliveryAddress } = req.body;
    if (!cart || !Array.isArray(cart.items) || cart.items.length === 0) {
      return res.status(400).json({ message: "Invalid cart data" });
    }

    const lineItems = cart.items.map((cartItem) => ({
      price_data: {
        currency: "inr",
        product_data: {
          name: cartItem.menuItem.name,
          images: [cartItem.menuItem.image],
        },
        unit_amount: Math.round(cartItem.menuItem.price * 100),
      },
      quantity: cartItem.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: `${client_domain}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${client_domain}/payment/cancel`,
      metadata: {
        userId,
        deliveryAddress: JSON.stringify(deliveryAddress),
      },
    });

    res.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error("Stripe session error:", error.message);
    res
      .status(error.statusCode || 500)
      .json({ message: error.message || "Internal server error" });
  }
});

// Stripe Webhook for handling Checkout Session completion
router.post("/webhook", express.raw({ type: "application/json" }), async (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const { userId, deliveryAddress } = session.metadata;

    try {
      const user = await User.findById(userId);
      if (!user) throw new Error(`User with ID ${userId} not found`);

      const lineItems = await stripe.checkout.sessions.listLineItems(session.id);

      const orderItems = lineItems.data.map((item) => ({
        name: item.description,
        quantity: item.quantity,
        price: item.amount_total / 100,
        productId: item.price.id,
      }));

      const newOrder = new Order({
        userId: user._id,
        items: orderItems,
        totalAmount: session.amount_total / 100,
        deliveryAddress: JSON.parse(deliveryAddress),
        status: session.payment_status,
        sessionId: session.id,
      });

      await newOrder.save();

      user.orders.push(newOrder._id);
      await user.save();

      await Cart.deleteMany({ userId });

      console.log(`Order created for user: ${userId}`);
      return res.json({ received: true });
    } catch (error) {
      console.error("Error processing webhook:", error.message);
      return res.status(500).send("Error processing payment.");
    }
  }

  res.status(200).send("Webhook received.");
});

// Route to get session status
router.get("/session-status", async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    const order = await Order.findOne({ sessionId });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json({
      orderId: order._id,
      totalAmount: session.amount_total / 100,
      items: session.line_items.data.map((item) => ({
        name: item.description,
        quantity: item.quantity,
        price: item.amount_total / 100,
      })),
      deliveryAddress: `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.zipCode}`,
      status: session.payment_status,
    });
  } catch (error) {
    console.error("Error retrieving session status:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Route to handle successful payment redirection
router.get("/checkout-complete", async (req, res) => {
  const sessionId = req.query.session_id;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      res.redirect(`http://localhost:5173/payment/success?session_id=${sessionId}`);
    } else {
      res.redirect(`http://localhost:5173/payment/failed`);
    }
  } catch (error) {
    console.error("Error handling checkout complete:", error.message);
    res.status(500).send("Error confirming payment.");
  }
});

// Route to confirm payment success
router.get("/success", async (req, res) => {
  const sessionId = req.query.session_id;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      res.json({ success: true, session });
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error("Error retrieving session:", err.message);
    res.status(500).json({ error: "Failed to confirm payment." });
  }
});

export { router as paymentRouter };
