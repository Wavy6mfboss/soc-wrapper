// api/server.ts   (FULL FILE – replace everything)
import express from 'express';
import cors    from 'cors';
import dotenv  from 'dotenv';
import Stripe  from 'stripe';

dotenv.config();                             // looks for ./gui/.env by default

/* ------------------------------------------------------------------------ */
const stripeSecret = process.env.STRIPE_SECRET_KEY!;
const priceId      = process.env.PRICE_ID!;
const stripe       = new Stripe(stripeSecret, { apiVersion: '2024-04-10' });

const app  = express();
const port = 4242;

app.use(cors({ origin: '*' }));
app.use(express.json());

app.post('/create-checkout-session', async (_req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode:       'payment',
      line_items: [{ price: priceId, quantity: 1 }],
      success_url:'http://localhost:5180/#/success',
      cancel_url: 'http://localhost:5180/#/canceled',
    });
    res.json({ url: session.url });
  } catch (err: any) {
    console.error(err);
    res.status(err.statusCode || 500).json({ error: err.message });
  }
});

app.listen(port, () =>
  console.log(`✅  Stripe API listening on http://localhost:${port}`)
);
