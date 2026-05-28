const express = require('express');
const { randomUUID } = require('crypto');
const { getDb } = require('../db/database');
const { sendOrderNotification } = require('../services/notifications');

const router = express.Router();

// POST /api/orders
router.post('/', async (req, res) => {
  const { customer, pickup, notes, items, total } = req.body;

  if (!customer?.name || !customer?.phone || !customer?.email) {
    return res.status(400).json({ error: 'Missing required customer fields.' });
  }
  if (!pickup?.date || !pickup?.time) {
    return res.status(400).json({ error: 'Missing required pickup fields.' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: 'Order must contain at least one item.' });
  }

  const orderId = `DB-${Date.now()}-${randomUUID().slice(0, 6).toUpperCase()}`;
  const db = getDb();

  db.prepare(`
    INSERT INTO orders
      (order_id, customer_name, customer_phone, customer_email,
       pickup_date, pickup_time, notes, items_json, total, payment_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'unpaid')
  `).run(
    orderId,
    customer.name,
    customer.phone,
    customer.email,
    pickup.date,
    pickup.time,
    notes || '',
    JSON.stringify(items),
    total
  );

  sendOrderNotification({ orderId, customer, pickup, notes, items, total }).catch(
    (err) => console.error('[notify] Failed to send order notification:', err.message)
  );

  return res.status(201).json({ orderId });
});

module.exports = router;
