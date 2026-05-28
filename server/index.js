require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// ── Stripe webhook must receive raw body — register before JSON middleware ────
app.post(
  '/api/webhook',
  express.raw({ type: 'application/json' }),
  require('./routes/webhook')
);

// ── Standard middleware ───────────────────────────────────────────────────────
app.use(cors({ origin: process.env.ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/orders', require('./routes/orders'));
app.use('/api/create-checkout-session', require('./routes/checkout'));

// ── Serve built frontend in production ───────────────────────────────────────
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get('*', (_, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.listen(PORT, () => {
  console.log(`Donut Buff server running on http://localhost:${PORT}`);
});
