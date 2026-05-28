const nodemailer = require('nodemailer');

function buildOrderEmailHtml({ orderId, customer, pickup, notes, items, total }) {
  const fmt = (n) => `$${Number(n).toFixed(2)}`;
  const rows = (items || []).map((item) => {
    const label = item.label
      ? `${item.name} — ${item.label}`
      : item.message
      ? `${item.name} — "${item.message}" (${item.qty} letters)`
      : `${item.name} × ${item.qty}`;
    return `<tr><td>${label}</td><td align="right">${fmt(item.subtotal)}</td></tr>`;
  });

  return `
    <h2>New Donut Buff Order</h2>
    <p><strong>Order #:</strong> ${orderId}</p>
    <hr>
    <h3>Customer</h3>
    <p>${customer?.name || ''}<br>
       ${customer?.phone || ''}<br>
       ${customer?.email || ''}</p>
    <h3>Pickup</h3>
    <p>${pickup?.date || ''} at ${pickup?.time || ''}</p>
    ${notes ? `<p><em>Notes: ${notes}</em></p>` : ''}
    <h3>Order Items</h3>
    <table border="1" cellpadding="6" cellspacing="0">
      <thead><tr><th>Item</th><th>Price</th></tr></thead>
      <tbody>${rows.join('')}</tbody>
      <tfoot><tr><td><strong>Total</strong></td><td align="right"><strong>${fmt(total)}</strong></td></tr></tfoot>
    </table>
  `;
}

function buildOrderEmailText({ orderId, customer, pickup, notes, items, total }) {
  const fmt = (n) => `$${Number(n).toFixed(2)}`;
  const lines = [
    `New Donut Buff Order — #${orderId}`,
    `---`,
    `Customer: ${customer?.name || ''} | ${customer?.phone || ''} | ${customer?.email || ''}`,
    `Pickup: ${pickup?.date || ''} at ${pickup?.time || ''}`,
    notes ? `Notes: ${notes}` : '',
    `---`,
    ...(items || []).map((item) => {
      const label = item.label
        ? `${item.name} — ${item.label}`
        : item.message
        ? `${item.name} — "${item.message}"`
        : `${item.name} × ${item.qty}`;
      return `  ${label}  ${fmt(item.subtotal)}`;
    }),
    `---`,
    `Total: ${fmt(total)}`,
  ];
  return lines.filter(Boolean).join('\n');
}

async function sendOrderNotification(orderData) {
  const {
    SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
    NOTIFY_EMAIL_TO, NOTIFY_EMAIL_FROM,
  } = process.env;

  if (!SMTP_HOST || !NOTIFY_EMAIL_TO) {
    console.log('[notify] Email not configured — skipping notification.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: parseInt(SMTP_PORT || '587', 10),
    secure: SMTP_PORT === '465',
    auth: SMTP_USER && SMTP_PASS ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });

  await transporter.sendMail({
    from: NOTIFY_EMAIL_FROM || SMTP_USER || 'orders@donutbuff.com',
    to: NOTIFY_EMAIL_TO,
    subject: `New Order #${orderData.orderId} — ${orderData.customer?.name || 'Customer'}`,
    text: buildOrderEmailText(orderData),
    html: buildOrderEmailHtml(orderData),
  });

  console.log(`[notify] Order notification sent for ${orderData.orderId}`);
}

module.exports = { sendOrderNotification };
