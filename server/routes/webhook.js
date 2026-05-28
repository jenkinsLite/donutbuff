const { getDb } = require('../db/database');
const { sendOrderNotification } = require('../services/notifications');

// POST /api/webhook (raw body — registered in index.js before JSON middleware)
module.exports = async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return res.status(400).send('Webhook not configured.');
  }

  const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('[webhook] Signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const db = getDb();
    const meta = session.metadata || {};

    db.prepare(
      `UPDATE orders SET payment_status = 'paid' WHERE stripe_session_id = ?`
    ).run(session.id);

    const order = db.prepare(
      `SELECT * FROM orders WHERE stripe_session_id = ?`
    ).get(session.id);

    if (order) {
      sendOrderNotification({
        orderId: order.order_id,
        customer: {
          name: meta.customer_name,
          phone: meta.customer_phone,
          email: session.customer_email || order.customer_email,
        },
        pickup: { date: meta.pickup_date, time: meta.pickup_time },
        notes: meta.notes,
        items: JSON.parse(order.items_json || '[]'),
        total: session.amount_total / 100,
      }).catch((err) =>
        console.error('[notify] Webhook notification failed:', err.message)
      );
    }
  }

  res.json({ received: true });
};
