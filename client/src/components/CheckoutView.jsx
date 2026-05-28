import React, { useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { MENU_DATA } from '../data/menuData';
import { fmt } from '../utils/pricing';
import CartItem from './CartItem';
import OrderForm from './OrderForm';

export default function CheckoutView({ onOrderSubmitted, onHideCheckout }) {
  const { getCartTotals, isItemOrdered } = useCart();
  const { totalQty, totalPrice } = getCartTotals();
  const orderedItems = MENU_DATA.filter(isItemOrdered);

  // Hide checkout view when cart becomes empty (after deleting items)
  useEffect(() => {
    if (totalQty === 0) onHideCheckout();
  }, [totalQty, onHideCheckout]);

  return (
    <div id="checkout-view" className="checkout-view">
      <div className="order-layout">

        {/* Cart summary */}
        <div className="checkout-cart-wrap">
          <h3 className="checkout-cart-title">Your Order</h3>
          <div
            id="checkout-cart-items"
            className="checkout-cart-items"
            role="list"
            aria-label="Items in your order"
          >
            {orderedItems.map((item) => (
              <CartItem key={item.id} item={item} />
            ))}
          </div>
          <div className="order-summary" aria-label="Order summary" aria-live="polite">
            <div className="summary-row">
              <span>Items:</span>
              <span id="summary-count">{totalQty}</span>
            </div>
            <div className="summary-row summary-total">
              <span>Total:</span>
              <span id="summary-total">{fmt(totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Order form */}
        <div className="order-form-wrap">
          <OrderForm onOrderSubmitted={onOrderSubmitted} />
        </div>

      </div>
    </div>
  );
}
