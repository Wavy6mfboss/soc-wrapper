/**
 * SOC-Wrapper GUI - “licenseManager”
 * -----------------------------------
 *  • Spins up a tiny Express server on http://localhost:4242
 *  • Creates Stripe Checkout Sessions
 *  • Listens for Stripe web-hook events
 *  • Persists license state in %APPDATA%/soc-wrapper-gui/license.json
 */

const { app: electronApp } = require('electron');
const path             = require('node:path');
const fs               = require('node:fs');
const express          = require('express');
const Stripe           = require('stripe').Stripe;

// ─────────────────────────────────────────────────────────────────────────────
// 1.  ENV – load Stripe keys from ../.env (one level above this file)
// ─────────────────────────────────────────────────────────────────────────────
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID) {
  console.error('[licenseManager] STRIPE_* env vars missing – checkout disabled');
}

// ─────────────────────────────────────────────────────────────────────────────
// 2.  Server scaffolding
// ─────────────────────────────────────────────────────────────────────────────
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2024-04-10' });
const app    = express();
const PORT   = 4242;

// parse JSON *and* allow renderer to hit us cross-origin
app.use(express.json());
app.use((_req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Stripe-Signature');
  next();
});

// ─────────────────────────────────────────────────────────────────────────────
// 3.  Create-Checkout-Session (endpoint the renderer calls)
// ─────────────────────────────────────────────────────────────────────────────
app.post('/create-checkout-session', async (_req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) return res.status(503).json({ error: 'stripe_not_configured' });

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        { price: process.env.STRIPE_PRICE_ID, quantity: 1 },
      ],
      success_url: 'http://localhost:5180?paid=1',
      cancel_url:  'http://localhost:5180',
    });
    res.json({ id: session.id });
  } catch (err) {
    console.error('[Stripe] create-session failed:', err);
    res.status(500).json({ error: 'stripe_error' });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// 4.  Stripe web-hook  →  unlock licence
// ─────────────────────────────────────────────────────────────────────────────
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
  if (!process.env.STRIPE_WEBHOOK_SECRET) return res.status(503).end();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[Stripe] bad signature:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    console.log('[Stripe] payment succeeded – licence unlocked');
    saveLicence({ licensed: true, purchasedAt: Date.now() });
  }

  res.json({ received: true });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5.  Persistence helpers
// ─────────────────────────────────────────────────────────────────────────────
const userPath    = electronApp.getPath('userData');
const licenceFile = path.join(userPath, 'license.json');

function saveLicence(obj) {
  try {
    fs.mkdirSync(userPath, { recursive: true });
    fs.writeFileSync(licenceFile, JSON.stringify(obj, null, 2));
  } catch (err) {
    console.error('[licenseManager] could not write file:', err);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
app.listen(PORT, () => console.log(`[licenseManager] listening http://localhost:${PORT}`));
module.exports = { saveLicence };
