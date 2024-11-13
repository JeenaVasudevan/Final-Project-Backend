import express from "express";
import Stripe from "stripe";
const router = express.Router();
const stripe=new Stripe(process.env.stripe_secret_key)
const client_domain=process.env.CLIENT_DOMAIN

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
      success_url: `${client_domain}/user/payment/success`,
      cancel_url: `${client_domain}/cart`,
    });

    res.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error("Stripe session error:", error.message);
    res.status(error.statusCode || 500).json({ message: error.message || "Internal server error" });
  }
});

router.get("/session-status",async(req,res)=>{
  try{
    const sessionId=req.query.session_id
    const session=await stripe.checkout.session.retrieve(sessionId)
    res.send({status:session?.status,
    customer_email:session?.customer_details?.email
    })
  }catch(error){
    res.status(error?.statusCode||500).json(error.message||"Internal error")
  }
})

router.post("/success", async (req, res, next) => {
  try {
    const { sessionId } = req.body; // Received sessionId from frontend after payment
    if (!sessionId) {
      return res.status(400).json({ message: "Invalid session ID" });
    }

    // Fetch session details from Stripe to verify the session and include line items
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['line_items']
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Extract cart items (line_items) from the session
    const cartItems = session.line_items.data.map(item => ({
      name: item.description,
      quantity: item.quantity,
      price: item.amount_total / 100,
    }));

    // Create a new order in the database (with sessionId, cart items, user, etc.)
    const order = new Order({
      user: req.user.id,  // Assuming user info is attached to the session
      items: cartItems,
      totalAmount: session.amount_total / 100,  // Convert amount to actual currency
      orderStatus: 'Pending',  // Status for new order
      paymentStatus: 'Success',
      sessionId: session.id,  // Store the sessionId as order ID
    });

    await order.save();  // Save the order to your DB

    // Clear the cart after payment success
    await Cart.deleteMany({ user: req.user.id });  // Clear the user's cart

    res.status(200).json({ message: "Order successfully created", orderId: order._id });
  } catch (error) {
    console.error("Payment success processing error:", error.message);
    next(error);  // Pass the error to the next middleware for centralized handling
  }
});



  
export {router as paymentRouter}