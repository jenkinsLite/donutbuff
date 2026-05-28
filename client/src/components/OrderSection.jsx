import React, { forwardRef } from 'react';
import CheckoutView from './CheckoutView';

const OrderSection = forwardRef(function OrderSection(
  { checkoutVisible, onShowCheckout, onHideCheckout, onOrderSubmitted },
  ref
) {
  return (
    <section
      id="order"
      className="section section--order"
      aria-labelledby="order-heading"
      ref={ref}
    >
      <div className="section-inner">
        <h2 id="order-heading" className="section-title">Place an Order</h2>
        <p className="section-subtitle">
          Tap <strong>Order</strong> on any menu item to add it to your cart, then tap{' '}
          <strong>Checkout</strong> when you're ready!
        </p>

        {/* Browse-menu shortcut bar (only when checkout is active) */}
        <div className={`checkout-browse-bar${checkoutVisible ? '' : ' hidden-bar'}`} hidden={!checkoutVisible}>
          <a href="#menu" className="btn btn--secondary btn--sm">
            <i className="fa-solid fa-arrow-up" aria-hidden="true" />
            Browse Menu
          </a>
        </div>

        {/* Empty state */}
        {!checkoutVisible && (
          <div id="checkout-empty" className="checkout-empty">
            <div className="checkout-empty__icon" aria-hidden="true">
              <i className="fa-solid fa-cart-shopping" />
            </div>
            <p className="checkout-empty__text">
              Browse the menu above and tap <strong>Order</strong> on any item.
              <br />
              When you're ready, tap <strong>Checkout</strong> to fill out your info!
            </p>
            <a href="#menu" className="btn btn--primary">
              <i className="fa-solid fa-arrow-up" aria-hidden="true" />
              Browse Menu
            </a>
          </div>
        )}

        {/* Checkout view */}
        {checkoutVisible && (
          <CheckoutView
            onOrderSubmitted={onOrderSubmitted}
            onHideCheckout={onHideCheckout}
          />
        )}
      </div>
    </section>
  );
});

export default OrderSection;
