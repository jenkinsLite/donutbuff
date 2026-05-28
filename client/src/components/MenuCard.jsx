import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { fmt, calcItemTotal, calcLettersTotal } from '../utils/pricing';
import { assortedEligibleItems, MENU_DATA } from '../data/menuData';

// ── Ingredient list helper ────────────────────────────────────────────────────
function IngredientList({ ingredients }) {
  return (
    <>
      <div className="ingredient-group">
        <h4>Topping</h4>
        <ul role="list">
          {ingredients.topping.map((t) => (
            <li key={t}><span className="ingredient-tag">{t}</span></li>
          ))}
        </ul>
      </div>
      <div className="ingredient-group">
        <h4>Dough</h4>
        <ul role="list">
          {ingredients.dough.map((t) => (
            <li key={t}><span className="ingredient-tag">{t}</span></li>
          ))}
        </ul>
      </div>
    </>
  );
}

// ── Regular order panel ───────────────────────────────────────────────────────
function RegularPanel({ item }) {
  const { getRegularQty, setRegularQty, deleteRegular } = useCart();
  const qty = getRegularQty(item.id);
  const subtotal = calcItemTotal(item, qty);

  return (
    <div className="letters-row">
      <span className="letters-row__label">
        <span className="letters-row__price">{fmt(item.price)}</span> ea
        <span className="order-panel__pricing-sub"> · {fmt(item.dozen)} / dz</span>
      </span>
      <button className="qty-btn minus" onClick={() => setRegularQty(item.id, -1)} aria-label={`Remove one ${item.name}`}>−</button>
      <span className="qty-display" aria-live="polite" aria-label={`${item.name} quantity: ${qty}`}>{qty}</span>
      <button className="qty-btn plus" onClick={() => setRegularQty(item.id, 1)} aria-label={`Add one ${item.name}`}>+</button>
      <span className="item-subtotal" aria-live="polite">{fmt(subtotal)}</span>
    </div>
  );
}

// ── DozenOnly panel ───────────────────────────────────────────────────────────
function DozenOnlyPanel({ item }) {
  const { getRegularQty, setRegularQty, deleteRegular } = useCart();
  const qty = getRegularQty(item.id);
  const subtotal = calcItemTotal(item, qty);

  return (
    <div className="letters-row">
      <span className="letters-row__label">
        <span className="letters-row__price">{fmt(item.dozen)}</span> / dz
      </span>
      <button className="qty-btn minus" onClick={() => setRegularQty(item.id, -1)} aria-label={`Remove one ${item.name}`}>−</button>
      <span className="qty-display" aria-live="polite">{qty}</span>
      <button className="qty-btn plus" onClick={() => setRegularQty(item.id, 1)} aria-label={`Add one ${item.name}`}>+</button>
      <span className="item-subtotal" aria-live="polite">{fmt(subtotal)}</span>
    </div>
  );
}

// ── Letters order panel ───────────────────────────────────────────────────────
function LettersPanel({ item }) {
  const { getLettersMessage, setLettersMessage, getLettersCount } = useCart();
  const message = getLettersMessage(item.id);
  const count = getLettersCount(item.id);
  const subtotal = calcLettersTotal(item, message);

  return (
    <div className="letters-message-panel">
      <label className="letters-message-label" htmlFor={`letters-input-${item.id}`}>
        Your message
        <span className="letters-row__price">
          {fmt(item.pricePerGroup)} / first {item.groupSize} · {fmt(item.pricePerExtra)} ea after
        </span>
      </label>
      <input
        type="text"
        id={`letters-input-${item.id}`}
        className="letters-message-input"
        placeholder="e.g. HAPPY BIRTHDAY"
        maxLength={60}
        autoComplete="off"
        value={message}
        onChange={(e) => setLettersMessage(item.id, e.target.value)}
        aria-label={`Enter your message for ${item.name}`}
        aria-describedby={`letters-count-${item.id}`}
      />
      <div className="letters-message-footer">
        <span className="letters-count" id={`letters-count-${item.id}`} aria-live="polite">
          <span className="letters-count__num">{count}</span> letters
        </span>
        <span className="item-subtotal letters-subtotal" aria-live="polite">{fmt(subtotal)}</span>
      </div>
    </div>
  );
}

// ── Assorted picker panel ─────────────────────────────────────────────────────
function AssortedPanel({ item }) {
  const { getAssortedSubQty, setAssortedSubQty, deleteAssortedSub, getAssortedTotal } = useCart();
  const eligible = assortedEligibleItems();
  const total = getAssortedTotal(item.id);
  const isValid = total >= 12 && total % 12 === 0;

  const statusText =
    total === 0
      ? 'Select any combination of 12'
      : total % 12 !== 0
      ? `${12 - (total % 12)} more to complete a dozen`
      : `${total / 12} dozen`;

  const yeastItems = eligible.filter((m) => m.type === 'Yeast');
  const cakeItems = eligible.filter((m) => m.type === 'Cake');

  const renderSubItem = (sub) => {
    const qty = getAssortedSubQty(item.id, sub.id);
    return (
      <div className="assorted-picker-item" key={sub.id} data-sub-id={sub.id}>
        <div className="assorted-picker-item__img-wrap">
          <img
            src={sub.image}
            alt={sub.name}
            className="assorted-picker-item__img"
            loading="lazy"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
        <span className="assorted-picker-item__name">{sub.name}</span>
        <button className="qty-btn minus" onClick={() => setAssortedSubQty(item.id, sub.id, -1)} aria-label={`Remove one ${sub.name}`}>−</button>
        <span className="qty-display" aria-live="polite">{qty}</span>
        <button className="qty-btn plus" onClick={() => setAssortedSubQty(item.id, sub.id, 1)} aria-label={`Add one ${sub.name}`}>+</button>
        <button className="qty-btn delete" onClick={() => deleteAssortedSub(item.id, sub.id)} aria-label={`Remove all ${sub.name}`} title="Remove">
          <i className="fa-solid fa-trash-can" aria-hidden="true" />
        </button>
      </div>
    );
  };

  return (
    <div className="assorted-panel">
      <div className="assorted-panel__header">
        <span className={`assorted-panel__count${isValid ? ' assorted-panel__count--valid' : ''}`}>
          <span className="assorted-panel__count-num">{total}</span> selected
        </span>
        <span className={`assorted-panel__status${isValid ? ' assorted-panel__status--valid' : ''}`}>
          {statusText}
        </span>
      </div>
      <div className="assorted-panel__section">
        <h4 className="assorted-panel__section-title">Yeast</h4>
        <div className="assorted-panel__items">{yeastItems.map(renderSubItem)}</div>
      </div>
      <div className="assorted-panel__section">
        <h4 className="assorted-panel__section-title">Cake</h4>
        <div className="assorted-panel__items">{cakeItems.map(renderSubItem)}</div>
      </div>
    </div>
  );
}

// ── Price display helper ──────────────────────────────────────────────────────
function PriceDisplay({ item }) {
  if (item.isLetters) {
    return (
      <>
        <div>{fmt(item.pricePerGroup)} / {item.groupSize} letters</div>
        <div className="menu-card__price-dozen">{fmt(item.pricePerExtra)} ea additional</div>
      </>
    );
  }
  if (item.isAssorted) {
    return <div className="menu-card__price-dozen menu-card__price--assorted">{fmt(item.dozen)} / dozen</div>;
  }
  if (item.isDozenOnly) {
    return <div>{fmt(item.dozen)} / dozen</div>;
  }
  return (
    <>
      <div>{fmt(item.price)} each</div>
      <div className="menu-card__price-dozen">{fmt(item.dozen)} / dozen</div>
    </>
  );
}

// ── Main card ─────────────────────────────────────────────────────────────────
export default function MenuCard({ item, onCheckout }) {
  const { deleteRegular } = useCart();
  const [ingredOpen, setIngredOpen] = useState(false);
  const [orderOpen, setOrderOpen] = useState(false);

  const toggleOrder = () => {
    setOrderOpen((v) => !v);
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    const placeholder = e.target.nextElementSibling;
    if (placeholder) placeholder.style.display = 'flex';
  };

  const renderOrderControls = () => {
    if (item.isLetters) return <LettersPanel item={item} />;
    if (item.isAssorted) return <AssortedPanel item={item} />;
    if (item.isDozenOnly) return <DozenOnlyPanel item={item} />;
    return <RegularPanel item={item} />;
  };

  return (
    <article className="menu-card" aria-label={`${item.name} ${item.type} Donut`}>
      <div className="menu-card__image-wrap">
        <img
          className="menu-card__image"
          src={item.image}
          alt={`${item.name} ${item.type} Donut`}
          loading="lazy"
          onError={handleImageError}
        />
        <div
          className="menu-card__image-placeholder"
          style={{ display: 'none' }}
          aria-label={`Photo of ${item.name} donut coming soon`}
        >
          <i className="fa-solid fa-circle-notch" aria-hidden="true" />
          <span>Photo coming soon</span>
        </div>
        <span className="menu-card__type-badge">{item.type}</span>
      </div>

      <div className="menu-card__body">
        <div className="menu-card__header">
          <h3 className="menu-card__name">{item.name}</h3>
          <div className="menu-card__price" aria-label="Prices">
            <PriceDisplay item={item} />
          </div>
        </div>

        <p
          className="menu-card__description"
          dangerouslySetInnerHTML={{ __html: item.description }}
        />

        <div className="menu-card__action-row">
          <button
            className="ingredients-toggle"
            aria-expanded={ingredOpen}
            aria-controls={`ingredients-${item.id}`}
            aria-label={`${ingredOpen ? 'Hide' : 'Show'} ingredients for ${item.name}`}
            onClick={() => setIngredOpen((v) => !v)}
          >
            <i className="fa-solid fa-list-ul" aria-hidden="true" />
            View Ingredients
            <span className="toggle-arrow" aria-hidden="true">
              <i className="fa-solid fa-chevron-down" />
            </span>
          </button>
          <button
            className="order-toggle"
            aria-expanded={orderOpen}
            aria-controls={`order-panel-${item.id}`}
            aria-label={`${orderOpen ? 'Hide' : 'Show'} order for ${item.name}`}
            onClick={toggleOrder}
          >
            Order
            <span className="toggle-arrow" aria-hidden="true">
              <i className="fa-solid fa-chevron-down" />
            </span>
          </button>
        </div>

        <div
          className={`ingredients-panel${ingredOpen ? ' open' : ''}`}
          id={`ingredients-${item.id}`}
          role="region"
          aria-label={`${item.name} ingredients`}
        >
          <div className="ingredients-inner">
            <IngredientList ingredients={item.ingredients} />
          </div>
        </div>

        <div
          className={`order-panel${item.isAssorted ? ' order-panel--assorted' : ''}${orderOpen ? ' open' : ''}`}
          id={`order-panel-${item.id}`}
          role="region"
          aria-label={`Order ${item.name}`}
        >
          <div className="order-panel__inner">
            {renderOrderControls()}
            <div className="order-panel__actions">
              {!item.isLetters && !item.isAssorted && (
                <button
                  className="qty-btn delete order-panel__delete-btn"
                  onClick={() => deleteRegular(item.id)}
                  aria-label={`Remove all ${item.name}`}
                  title="Remove from order"
                >
                  <i className="fa-solid fa-trash-can" aria-hidden="true" />
                </button>
              )}
              <button
                className="btn btn--primary order-panel__checkout-btn"
                type="button"
                aria-label="Proceed to checkout"
                onClick={onCheckout}
              >
                <i className="fa-solid fa-bag-shopping" aria-hidden="true" />
                Checkout
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
