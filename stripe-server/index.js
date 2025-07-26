/**
 * stripe-server/index.js  (ESM-compatible)
 * ---------------------------------------
 * • Loads STRIPE_SECRET and CHECKOUT_PRICE_ID from .env
 * • Uses import.meta.url  to build dirname (since __dirname is undefined in ESM)
 * • Adds CORS so http://localhost:5180 can call it
 */

import express from "express";
import Stripe  from "stripe";
import cors    from "cors";
import dotenv  from "dotenv";
import path    from "path";
import { fileURLToPath } from "url";

/* ---------- resolve dirname in ESM ---------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

/* ---------- env ---------- */
dotenv.config({ path: path.join(__dirname, ".env") });

const { STRIPE_SECRET, CHECKOUT_PRICE_ID } = process.env;

if (!STRIPE_SECRET) {
  console.error("❌  STRIPE_SECRET missing in stripe-server/.env");
  process.exit(1);
}
if (!CHECKOUT_PRICE_ID) {
  console.error("❌  CHECKOUT_PRICE_ID missing in stripe-server/.env");
  process.exit(1);
}

/* ---------- init ---------- */
const app    = express();
const stripe = new Stripe(STRIPE_SECRET, { apiVersion: "2024-04-10" });

app.use(cors({ origin: "http://localhost:5180" }));
app.use(express.json());

/* ---------- routes ---------- */
app.post("/create-checkout-session", async (_req, res) => {
  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        { price: CHECKOUT_PRICE_ID, quantity: 1 },
      ],
      success_url: "http://localhost:5180/?paid=true",
      cancel_url : "http://localhost:5180/?canceled=true",
    });
    res.json({ sessionId: session.id, url: session.url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

/* ---------- start ---------- */
const PORT = process.env.PORT || 4242;
app.listen(PORT, () => console.log(`Stripe helper listening on :${PORT}`));
