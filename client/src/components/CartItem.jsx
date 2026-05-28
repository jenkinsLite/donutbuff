import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { fmt, calcItemTotal, calcLettersTotal } from '../utils/pricing';
import { MENU_DATA } from '../data/menuData';
import { assortedEligibleItems } from '../data/menuData';

// ── Assorted box sub-row ──────────────────────────────────────────────────────
function AssortedSubRow({ boxItem, sub }) {
  const { getAssortedSubQty, setAssortedSubQty, deleteAssortedSub } = useCart();
  const [editOpen, setEditOpen] = useState(false);
  const qty = getAssortedSubQty(boxItem.id, sub.id);

  return (
    <div className="assorted-box-sub-row" data-sub-id={sub.id}>
      <div className="assorted-box-sub-row__thumb" aria-hidden="true">
        <img
          src={sub.image}
          alt={sub.name}
          loading="lazy"
          onError={(e) => { e.target.parentElement.innerHTML = '<i class="fa-solid fa-circle-notch" aria-hidden="true"></i>'; }}
        />
      </div>
      <div className="assorted-box-sub-row__name">
        {sub.name} <span className="assorted-box-sub-row__type">{sub.type}</span>
      </div>
      <div className="assorted-box-sub-row__price-col">
        <span className="assorted-box-sub-row__qty">× {qty}</span>
        <div className="checkout-item__btns">
          <button
            className="checkout-edit-btn"
            aria-expanded={editOpen}
            aria-label={`Edit ${sub.name} quantity`}
            onClick={() => setEditOpen((v) => !v)}
          >
            {editOpen ? 'Done' : 'Edit'}
          </button>
        </div>
      </div>
      {editOpen && (
        <div className="assorted-box-sub-row__edit-row">
          <button className="qty-btn minus" onClick={() => setAssortedSubQty(boxItem.id, sub.id, -1)} aria-label={`Remove one ${sub.name}`}>−</button>
          <span className="qty-display">{qty}</span>
          <button className="qty-btn plus" onClick={() => setAssortedSubQty(boxItem.id, sub.id, 1)} aria-label={`Add one ${sub.name}`}>+</button>
          <button className="qty-btn delete" onClick={() => deleteAssortedSub(boxItem.id, sub.id)} aria-label={`Remove ${sub.name} from box`} title="Remove">
            <i className="fa-solid fa-trash-can" aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

// ── Assorted cart item ────────────────────────────────────────────────────────
function AssortedCartItem({ item }) {
  const { getAssortedTotal, clearAssorted } = useCart();
  const total = getAssortedTotal(item.id);
  const dozens = Math.floor(total / 12);
  const subtotal = dozens * item.dozen;
  const eligible = assortedEligibleItems();

  return (
    <div className="checkout-cart-item checkout-cart-item--assorted-box" role="listitem" data-item-id={item.id}>
      <div className="assorted-box-header">
        <div className="checkout-cart-item__thumb" aria-hidden="true">
          <img
            src={item.image}
            alt={item.name}
            loading="lazy"
            onError={(e) => { e.target.parentElement.innerHTML = '<i class="fa-solid fa-circle-notch" aria-hidden="true"></i>'; }}
          />
        </div>
        <div className="checkout-cart-item__info">
          <div className="checkout-cart-item__name">{item.name}</div>
          <div className="checkout-cart-item__qty assorted-box__count">
            {total} selected — {dozens} dozen
          </div>
        </div>
        <div className="checkout-cart-item__price-col">
          <span className="checkout-cart-item__subtotal assorted-box__total">{fmt(subtotal)}</span>
          <div className="checkout-item__btns">
            <button
              className="checkout-delete-btn"
              aria-label="Remove Build Your Box from order"
              onClick={() => clearAssorted(item.id)}
            >
              Delete All
            </button>
          </div>
        </div>
      </div>

      <div className="assorted-box-sub-rows">
        {eligible.map((sub) => (
          <ConnectedSubRow key={sub.id} boxItem={item} sub={sub} />
        ))}
      </div>
    </div>
  );
}

function ConnectedSubRow({ boxItem, sub }) {
  const { getAssortedSubQty } = useCart();
  const qty = getAssortedSubQty(boxItem.id, sub.id);
  if (qty === 0) return null;
  return <AssortedSubRow boxItem={boxItem} sub={sub} />;
}

// ── Regular / Letters cart item ───────────────────────────────────────────────
function StandardCartItem({ item }) {
  const {
    getRegularQty, setRegularQty, deleteRegular,
    getLettersMessage, setLettersMessage, clearLetters, getLettersCount,
  } = useCart();
  const [editOpen, setEditOpen] = useState(false);

  const isLetters = item.isLetters;
  const qty = isLetters ? null : getRegularQty(item.id);
  const message = isLetters ? getLettersMessage(item.id) : '';
  const count = isLetters ? getLettersCount(item.id) : 0;
  const subtotal = isLetters
    ? calcLettersTotal(item, message)
    : calcItemTotal(item, qty);

  const qtyLabel = isLetters
    ? count > 0 ? `"${message}" (${count} letters)` : '(no message entered)'
    : `× ${qty}`;

  const handleDelete = () => {
    if (isLetters) clearLetters(item.id);
    else deleteRegular(item.id);
  };

  if (isLetters && count === 0) return null;
  if (!isLetters && qty === 0) return null;

  return (
    <div className="checkout-cart-item" role="listitem" data-item-id={item.id}>
      <div className="checkout-cart-item__thumb" aria-hidden="true">
        <img
          src={item.image}
          alt={`${item.name} donut`}
          loading="lazy"
          onError={(e) => { e.target.parentElement.innerHTML = '<i class="fa-solid fa-circle-notch" aria-hidden="true"></i>'; }}
        />
      </div>
      <div className="checkout-cart-item__info">
        <div className="checkout-cart-item__name">{item.name} {item.type}</div>
        <div className="checkout-cart-item__qty">{qtyLabel}</div>
      </div>
      <div className="checkout-cart-item__price-col">
        <span className="checkout-cart-item__subtotal">{fmt(subtotal)}</span>
        <div className="checkout-item__btns">
          <button className="checkout-delete-btn" aria-label={`Remove ${item.name} from order`} onClick={handleDelete}>
            Delete
          </button>
          <button
            className="checkout-edit-btn"
            aria-expanded={editOpen}
            aria-label={`Edit ${item.name} in order`}
            onClick={() => setEditOpen((v) => !v)}
          >
            {editOpen ? 'Done' : 'Edit'}
          </button>
        </div>
      </div>

      {editOpen && (
        isLetters ? (
          <div className="checkout-cart-item__edit-row checkout-cart-item__edit-row--letters">
            <input
              type="text"
              className="letters-message-input letters-message-input--checkout"
              maxLength={60}
              autoComplete="off"
              value={message}
              onChange={(e) => setLettersMessage(item.id, e.target.value)}
              aria-label={`Edit your message for ${item.name}`}
            />
            <span className="letters-count" aria-live="polite">
              <span className="letters-count__num">{count}</span> letters
            </span>
          </div>
        ) : (
          <div className="checkout-cart-item__edit-row">
            <button className="qty-btn minus" onClick={() => setRegularQty(item.id, -1)} aria-label={`Remove one ${item.name}`}>−</button>
            <span className="qty-display">{qty}</span>
            <button className="qty-btn plus" onClick={() => setRegularQty(item.id, 1)} aria-label={`Add one ${item.name}`}>+</button>
            <button className="qty-btn delete" onClick={() => deleteRegular(item.id)} aria-label={`Remove ${item.name} from order`} title="Remove item">
              <i className="fa-solid fa-trash-can" aria-hidden="true" />
            </button>
          </div>
        )
      )}
    </div>
  );
}

// ── Exported CartItem dispatcher ──────────────────────────────────────────────
export default function CartItem({ item }) {
  if (item.isAssorted) return <AssortedCartItem item={item} />;
  return <StandardCartItem item={item} />;
}
