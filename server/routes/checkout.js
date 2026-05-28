const express = require('express');
const { randomUUID } = require('crypto');
const { getDb } = require('../db/database');

const router = express.Router();

// POST /api/create-checkout-session
router.post('/', async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    return res.status(503).json({ error: 'Payment processing is not configured.' });
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const { customer, pickup, notes, items, total } = req.body;

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item.' });
  }

  const orderId = `DB-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`;
  const origin = process.env.ORIGIN || 'http://localhost:5173';

  const lineItems = items.map((item) => ({
    price_data: {
      currency: 'usd',
      product_data: {
        name: item.label
          ? `${item.name} — ${item.label}`
          : item.message
          ? `${item.name} — "${item.message}"`
          : `${item.name}${item.qty > 1 ? ` × ${item.qty}` : ''}`,
      },
      unit_amount: Math.round(item.subtotal * 100),
    },
    quantity: 1,
  }));

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: customer?.email,
      success_url: `${origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/#order`,
      metadata: {
        order_id: orderId,
        customer_name: customer?.name || '',
        customer_phone: customer?.phone || '',
        pickup_date: pickup?.date || '',
        pickup_time: pickup?.time || '',
        notes: notes || '',
        items_json: JSON.stringify(items).slice(0, 500), // Stripe metadata max 500 chars per key
      },
    });

    const db = getDb();
    db.prepare(`
      INSERT INTO orders
        (order_id, customer_name, customer_phone, customer_email,
         pickup_date, pickup_time, notes, items_json, total,
         payment_status, stripe_session_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(
      orderId,
      customer?.name || '',
      customer?.phone || '',
      customer?.email || '',
      pickup?.date || '',
      pickup?.time || '',
      notes || '',
      JSON.stringify(items),
      total,
      session.id
    );

    return res.json({ url: session.url });
  } catch (err) {
    console.error('[stripe] create-checkout-session error:', err.message);
    return res.status(500).json({ error: 'Failed to create payment session.' });
  }
});

module.exports = router;
