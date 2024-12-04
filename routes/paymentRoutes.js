import express from "express";
import Stripe from "stripe";
import { Order } from "../models/orderModel.js";


const router = express.Router();
const stripe = new Stripe(process.env.stripe_secret_key);
const client_domain = process.env.CLIENT_DOMAIN;

router.post("/create-checkout-session", async (req, res) => {
  try {
    const { cart } = req.body;
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
      success_url: `${client_domain}/payment/success`,
      cancel_url: `${client_domain}/payment/cancel`,
    });

    res.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error("Stripe session error:", error.message);
    res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
  }
});

router.get("/session-status", async (req, res) => {
  try {
    const sessionId = req.query.session_id;
    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items"],
    });

    // Fetch order details
    const order = await Order.findOne({ sessionId }).populate("deliveryAddress");

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const lineItems = session.line_items.data.map((item) => ({
      name: item.description,
      quantity: item.quantity,
      price: item.amount_total / 100, // Convert to INR
    }));

    res.json({
      orderId: order._id,
      totalAmount: session.amount_total / 100, // Convert to INR
      items: lineItems,
      deliveryAddress: `${order.deliveryAddress.street}, ${order.deliveryAddress.city}, ${order.deliveryAddress.state} - ${order.deliveryAddress.zipCode}`,
      status: session.payment_status,
    });
  } catch (error) {
    console.error("Error retrieving session status:", error.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/webhook", express.raw({ type: "application/json" }), (req, res) => {
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
    // Process session data and update order/payment status in the database
  }

  res.status(200).json({ received: true });
});

router.get("/checkout-complete", async (req, res) => {
  const sessionId = req.query.session_id;

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      res.redirect(`https://final-project-frontend-j3if.vercel.app/payment/success?session_id=${sessionId}`);
    } else {
      res.redirect(`https://final-project-frontend-j3if.vercel.app/payment/failed`);
    }
  } catch (error) {
    console.error("Error handling checkout complete:", error);
    res.status(500).send("Error confirming payment.");
  }
});


router.get("/success", async (req, res) => {
  const sessionId = req.query.session_id; // Retrieve session_id from query params
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status === "paid") {
      res.json({ success: true, session }); // Return JSON to the frontend
    } else {
      res.json({ success: false });
    }
  } catch (err) {
    console.error("Error retrieving session:", err);
    res.status(500).json({ error: "Failed to confirm payment." });
  }
});


export { router as paymentRouter };