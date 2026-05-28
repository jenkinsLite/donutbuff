import React from 'react';

export default function CheckoutFab({ totalQty, onCheckout }) {
  if (totalQty === 0) return null;

  return (
    <button
      className="checkout-fab"
      id="checkout-fab"
      type="button"
      aria-label={`Checkout — ${totalQty} item${totalQty !== 1 ? 's' : ''} in cart`}
      onClick={onCheckout}
    >
      <i className="fa-solid fa-cart-shopping" aria-hidden="true" />
      <span className="checkout-fab__count" id="checkout-fab-count" aria-hidden="true">
        {totalQty}
      </span>
      Checkout
    </button>
  );
}
