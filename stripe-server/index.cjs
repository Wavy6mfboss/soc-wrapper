/* stripe-server/index.cjs */
require('dotenv').config();          // loads STRIPE_SECRET from .env
const express = require('express');
const cors    = require('cors');
const stripe  = require('stripe')(process.env.STRIPE_SECRET);

// ─── sanity-check ──────────────────────────────────────────────────────────────
if (!process.env.STRIPE_SECRET) {
  console.error('❌  STRIPE_SECRET missing – add it to stripe-server/.env');
  process.exit(1);
}

// ─── basic express app ────────────────────────────────────────────────────────
const app = express();
app.use(cors());
app.use(express.json());

// POST /create-checkout-session  → returns { sessionId }
app.post('/create-checkout-session', async (_req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],

      success_url: 'http://localhost:5180',   // where the GUI runs
      cancel_url : 'http://localhost:5180',

      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'SOC-Wrapper unlimited runs' },
          unit_amount: 500        // $5.00
        },
        quantity: 1
      }]
    });

    res.json({ sessionId: session.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'stripe_error', details: err.message });
  }
});

// ─── listen ───────────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`✅  Stripe helper listening on :${PORT}`));
