const express = require('express');
const cors    = require('cors');
const Stripe  = require('stripe');
require('dotenv').config();

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);
const app    = express();
app.use(cors());            // ★ allow renderer origin (http://localhost:5180)
app.use(express.json());

const SUCCESS_URL = 'soc://success';

app.post('/create-checkout-session', async (_req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode       : 'payment',
      line_items : [{
        price_data: {
          currency    : 'usd',
          product_data: { name: 'SOC-Wrapper unlimited licence' },
          unit_amount : 500
        },
        quantity: 1
      }],
      success_url: SUCCESS_URL,
      cancel_url : 'https://example.com/cancel'
    });
    res.json({ sessionId: session.id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.listen(4242, () => console.log('✅  Stripe helper listening on :4242'));
