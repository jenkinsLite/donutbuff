export const fmt = (n) => `$${n.toFixed(2)}`;

export const calcItemTotal = (item, qty) => {
  if (item.isDozenOnly) return qty * item.dozen;
  const dozens = Math.floor(qty / 12);
  const remainder = qty % 12;
  return dozens * item.dozen + remainder * item.price;
};

export const calcLettersTotal = (item, message) => {
  const count = (message || '').replace(/\s/g, '').length;
  if (count === 0) return 0;
  return item.pricePerGroup + Math.max(0, count - item.groupSize) * item.pricePerExtra;
};

export const calcCartTotals = (cart, menuData, assortedEligible) => {
  let totalQty = 0;
  let totalPrice = 0;

  menuData.forEach((item) => {
    if (item.isAssorted) {
      const subs = cart[item.id] || {};
      const total = Object.values(subs).reduce((a, b) => a + b, 0);
      totalQty += total;
      totalPrice += Math.floor(total / 12) * item.dozen;
    } else if (item.isLetters) {
      const message = cart[item.id]?.message || '';
      const count = message.replace(/\s/g, '').length;
      totalQty += count;
      totalPrice += calcLettersTotal(item, message);
    } else {
      const qty = cart[item.id] || 0;
      totalQty += qty;
      totalPrice += calcItemTotal(item, qty);
    }
  });

  return { totalQty, totalPrice };
};
