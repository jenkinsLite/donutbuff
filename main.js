/**
 * Donut Buff — Main Application Script
 *
 * Responsibilities:
 *  1. Render menu cards from MENU_DATA (data.js)
 *  2. Menu category filtering tabs
 *  3. Ingredient accordion (slide-down) per card
 *  4. Order panel accordion per card (cart controls)
 *  5. Hamburger nav toggle
 *  6. Active nav link tracking on scroll
 *  7. Checkout FAB (shown when cart has items)
 *  8. Checkout view (itemized cart + Your Information form)
 *  9. Order form validation
 * 10. Confirmation modal
 * 11. Footer copyright year
 */

'use strict';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** @param {string} sel @param {Element|Document} ctx */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
/** @param {string} sel @param {Element|Document} ctx */
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const fmt = (n) => `$${n.toFixed(2)}`;

/** Total cost for `qty` of a regular (non-letters) item.
 *  Every complete dozen uses the dozen price; leftovers use the each price. */
const calcItemTotal = (item, qty) => {
  const dozens    = Math.floor(qty / 12);
  const remainder = qty % 12;
  return item.isDozenOnly ? (qty * item.dozen) : (dozens * item.dozen + remainder * item.price);
};

/** Menu items eligible for the Build Your Box assorted picker
 *  (excludes apple fritter, letters, and the assorted item itself). */
const _assortedEligibleItems = () =>
  // MENU_DATA.filter(m => !m.isLetters && !m.isAssorted && m.id !== 'yeast-apple-fritter');
  MENU_DATA.filter(m => m.type !== 'Special' && !m.id.includes("filled") && !m.id.includes("fritter") && !m.id.includes("holes"));

/** Total donuts selected inside an assorted box. */
const _assortedTotal = (itemId) =>
  Object.values(cart[itemId] || {}).reduce((a, b) => a + b, 0);

/** Human-readable summary of assorted selections for checkout/modal display. */
const _assortedCheckoutLabel = (item) => {
  const total  = _assortedTotal(item.id);
  const dozens = Math.floor(total / 12);
  const parts  = Object.entries(cart[item.id] || {})
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => {
      const sub = MENU_DATA.find(m => m.id === id);
      return sub ? `${sub.name} ×${qty}` : '';
    })
    .filter(Boolean);
  return `${dozens} dozen (${total} total): ${parts.join(', ')}`;
};

// ── State ─────────────────────────────────────────────────────────────────────
/**
 * Cart: { [itemId]: number | { groups: number, extras: number } }
 */
const cart = {};

/** Flatpickr instance for the date picker (set in initOrderSection). */
let _datePicker = null;
/** Flatpickr instance for the time picker (set in initOrderSection). */
let _timePicker = null;
/** Currently displayed menu category (tracked for post-reset re-render). */
let _currentCategory = 'All';

// ── On DOM Ready ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initFooterYear();
  initHamburger();
  initNavHighlight();
  initMenuSection();
  initOrderSection();
  initForm();
  initModal();
  initCheckoutFab();
});

// ── Footer year ───────────────────────────────────────────────────────────────
function initFooterYear() {
  const el = $('#footer-year');
  if (el) el.textContent = new Date().getFullYear();
}

// ── Hamburger nav ─────────────────────────────────────────────────────────────
function initHamburger() {
  const hamburger = $('#hamburger');
  const nav       = $('#main-nav');
  if (!hamburger || !nav) return;

  hamburger.addEventListener('click', () => {
    const expanded = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!expanded));
    nav.classList.toggle('open', !expanded);
    hamburger.setAttribute('aria-label', expanded ? 'Open navigation menu' : 'Close navigation menu');
  });

  // Close on link click (mobile)
  $$('.nav-link', nav).forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open navigation menu');
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && !hamburger.contains(e.target)) {
      nav.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}

// ── Active nav highlighting on scroll ─────────────────────────────────────────
function initNavHighlight() {
  const sections = $$('section[id]');
  const links    = $$('.nav-link');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => {
        const active = link.getAttribute('href') === `#${entry.target.id}`;
        link.classList.toggle('active', active);
        link.setAttribute('aria-current', active ? 'true' : 'false');
      });
    });
  }, { rootMargin: '-40% 0px -55% 0px' });

  sections.forEach(s => observer.observe(s));
}

// ══════════════════════════════════════════════════ MENU SECTION

function initMenuSection() {
  buildMenuTabs();
  renderMenuItems('All');
}

function getCategories() {
  const seen = new Set();
  const cats = ['All'];
  MENU_DATA.forEach(item => {
    if (!seen.has(item.type)) { seen.add(item.type); cats.push(item.type + ' Donuts'); }
  });
  return cats;
}

function buildMenuTabs() {
  const container = $('#menu-tabs');
  if (!container) return;

  const cats = getCategories();
  cats.forEach((cat, i) => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn';
    btn.textContent = cat;
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', i === 0 ? 'true' : 'false');
    btn.setAttribute('aria-label', `Show ${cat}`);
    btn.addEventListener('click', () => {
      $$('.tab-btn', container).forEach(b => b.setAttribute('aria-selected', 'false'));
      btn.setAttribute('aria-selected', 'true');
      _currentCategory = cat;
      renderMenuItems(cat);
    });
    container.appendChild(btn);
  });
}

function renderMenuItems(category) {
  const grid = $('#menu-grid');
  if (!grid) return;

  grid.innerHTML = '';

  const items = category === 'All'
    ? MENU_DATA
    : MENU_DATA.filter(item => category.startsWith(item.type));

  items.forEach(item => {
    grid.appendChild(buildMenuCard(item));
  });
}

function buildMenuCard(item) {
  const card = document.createElement('article');
  card.className = 'menu-card';
  card.setAttribute('aria-label', `${item.name} ${item.type} Donut`);

  const makeIngredientList = (arr) =>
    arr.map(t => `<li><span class="ingredient-tag">${t}</span></li>`).join('');
  const toppingList = makeIngredientList(item.ingredients.topping);
  const doughList   = makeIngredientList(item.ingredients.dough);

  const ingredPanelId = `ingredients-${item.id}`;
  const orderPanelId  = `order-panel-${item.id}`;

  const orderControlsHtml = item.isLetters
    ? _buildLettersPanelHtml(item)
    : item.isAssorted
      ? _buildAssortedPanelHtml(item)
      : _buildRegularPanelHtml(item);

  card.innerHTML = `
    <div class="menu-card__image-wrap">
      <img
        class="menu-card__image"
        src="${item.image}"
        alt="${item.name} ${item.type} Donut"
        loading="lazy"
        onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"
      />
      <div class="menu-card__image-placeholder" style="display:none;" aria-label="Photo of ${item.name} donut coming soon">
        <i class="fa-solid fa-circle-notch" aria-hidden="true"></i>
        <span>Photo coming soon</span>
      </div>
      <span class="menu-card__type-badge">${item.type}</span>
    </div>

    <div class="menu-card__body">
      <div class="menu-card__header">
        <h3 class="menu-card__name">${item.name}</h3>
        <div class="menu-card__price" aria-label="Prices">
          ${item.isLetters
            ? `<div>${fmt(item.pricePerGroup)} / ${item.groupSize} letters</div>
               <div class="menu-card__price-dozen">${fmt(item.pricePerExtra)} ea additional</div>`
            : item.isAssorted
              ? `<div class="menu-card__price-dozen menu-card__price--assorted">${fmt(item.dozen)} / dozen</div>`
              : item.isDozenOnly
              ? `<div>${fmt(item.dozen)} / dozen</div>`
              : `<div>${fmt(item.price)} each</div>
                 <div class="menu-card__price-dozen">${fmt(item.dozen)} / dozen</div>`
          }
        </div>
      </div>

      <p class="menu-card__description">${item.description}</p>

      <div class="menu-card__action-row">
        <button
          class="ingredients-toggle"
          aria-expanded="false"
          aria-controls="${ingredPanelId}"
          aria-label="Show ingredients for ${item.name}"
        >
          <i class="fa-solid fa-list-ul" aria-hidden="true"></i>
          View Ingredients
          <span class="toggle-arrow" aria-hidden="true"><i class="fa-solid fa-chevron-down"></i></span>
        </button>
        <button
          class="order-toggle"
          aria-expanded="false"
          aria-controls="${orderPanelId}"
          aria-label="Order ${item.name}"
        >
          Order
          <span class="toggle-arrow" aria-hidden="true"><i class="fa-solid fa-chevron-down"></i></span>
        </button>
      </div>

      <div class="ingredients-panel" id="${ingredPanelId}" role="region" aria-label="${item.name} ingredients">
        <div class="ingredients-inner">
          <div class="ingredient-group">
            <h4>Topping</h4>
            <ul role="list">${toppingList}</ul>
          </div>
          <div class="ingredient-group">
            <h4>Dough</h4>
            <ul role="list">${doughList}</ul>
          </div>
        </div>
      </div>

      <div class="order-panel${item.isAssorted ? ' order-panel--assorted' : ''}" id="${orderPanelId}" role="region" aria-label="Order ${item.name}">
        <div class="order-panel__inner">
          ${orderControlsHtml}
          <div class="order-panel__actions">
            ${(!item.isLetters && !item.isAssorted) ? `<button class="qty-btn delete order-panel__delete-btn" data-action="delete" aria-label="Remove all ${item.name}" title="Remove from order"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button>` : ''}
            <button class="btn btn--primary order-panel__checkout-btn" type="button" aria-label="Proceed to checkout">
              <i class="fa-solid fa-bag-shopping" aria-hidden="true"></i>
              Checkout
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Ingredients accordion
  const ingredToggle = card.querySelector('.ingredients-toggle');
  const ingredPanel  = card.querySelector('.ingredients-panel');
  ingredToggle.addEventListener('click', () => {
    const open = ingredPanel.classList.toggle('open');
    ingredToggle.setAttribute('aria-expanded', String(open));
    ingredToggle.setAttribute('aria-label', `${open ? 'Hide' : 'Show'} ingredients for ${item.name}`);
  });

  // Order accordion
  const orderToggle = card.querySelector('.order-toggle');
  const orderPanel  = card.querySelector('.order-panel');
  orderToggle.addEventListener('click', () => {
    const opening = !orderPanel.classList.contains('open');

    // Close every other open order panel first
    if (opening) {
      document.querySelectorAll('.order-panel.open').forEach(p => {
        p.classList.remove('open');
        const t = p.closest('.menu-card')?.querySelector('.order-toggle');
        if (t) {
          t.setAttribute('aria-expanded', 'false');
          t.setAttribute('aria-label', t.getAttribute('aria-label').replace('Hide', 'Show'));
        }
      });
    }

    orderPanel.classList.toggle('open', opening);
    orderToggle.setAttribute('aria-expanded', String(opening));
    orderToggle.setAttribute('aria-label', `${opening ? 'Hide' : 'Show'} order for ${item.name}`);
  });

  // Wire up cart controls
  if (item.isLetters) {
    _wireLettersPanelControls(card, item);
  } else if (item.isAssorted) {
    _wireAssortedPanelControls(card, item);
  } else {
    _wireRegularPanelControls(card, item);
  }

  // Checkout button inside order panel
  card.querySelector('.order-panel__checkout-btn').addEventListener('click', () => {
    showCheckoutView();
  });

  return card;
}

function _buildRegularPanelHtml(item) {
  const qty = cart[item.id] || 0;
  return `
    <div class="letters-row">
      <span class="letters-row__label">
        <span class="letters-row__price">${fmt(item.price)}</span> ea
        <span class="order-panel__pricing-sub"> · ${fmt(item.dozen)} / dz</span>
      </span>
      <button class="qty-btn minus" data-action="minus" aria-label="Remove one ${item.name}">−</button>
      <span class="qty-display" aria-live="polite" aria-label="${item.name} quantity: ${qty}">${qty}</span>
      <button class="qty-btn plus" data-action="plus" aria-label="Add one ${item.name}">+</button>
      <span class="item-subtotal" aria-live="polite">${fmt(calcItemTotal(item, qty))}</span>
    </div>
  `;
}

function _buildLettersPanelHtml(item) {
  const cbId    = `pack-cb-${item.id}`;
  const groups  = cart[item.id]?.groups || 0;
  const extras  = cart[item.id]?.extras || 0;
  const locked  = groups === 0;
  return `
    <div class="order-item__controls order-item__controls--letters">
      <div class="letters-row letters-row--pack" data-row="groups">
        <label class="pack-checkbox-label" for="${cbId}">
          <span class="letters-row__label">6-letter pack <span class="letters-row__price">${fmt(item.pricePerGroup)}</span></span>
          <input type="checkbox" class="pack-checkbox" id="${cbId}"
            aria-label="Add 6-letter pack for ${fmt(item.pricePerGroup)}"
            ${groups > 0 ? 'checked' : ''} />
          <span class="pack-checkbox-custom" aria-hidden="true"></span>
        </label>
        <span class="item-subtotal" data-target="groups" aria-live="polite">${fmt(groups * item.pricePerGroup)}</span>
      </div>
      <div class="letters-row letters-row--extras${locked ? ' letters-row--disabled' : ''}" data-row="extras">
        <span class="letters-row__label">Extra letter <span class="letters-row__price">${fmt(item.pricePerExtra)} ea</span></span>
        <button class="qty-btn minus" data-action="minus" data-target="extras"
          aria-label="Remove one extra letter" ${locked ? 'disabled' : ''}>−</button>
        <span class="qty-display" data-target="extras" aria-live="polite" aria-label="Extra letters: ${extras}">${extras}</span>
        <button class="qty-btn plus" data-action="plus" data-target="extras"
          aria-label="Add one extra letter" ${locked ? 'disabled' : ''}>+</button>
        <span class="item-subtotal" data-target="extras" aria-live="polite">${fmt(extras * item.pricePerExtra)}</span>
      </div>
    </div>
  `;
}

function _wireRegularPanelControls(card, item) {
  const qtyDisplay = card.querySelector('.qty-display');
  const subtotal   = card.querySelector('.item-subtotal');

  card.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'plus')        cart[item.id]++;
      else if (action === 'minus')  { if (cart[item.id] > 0) cart[item.id]--; }
      else if (action === 'delete') cart[item.id] = 0;

      const qty = cart[item.id];
      qtyDisplay.textContent = qty;
      qtyDisplay.setAttribute('aria-label', `${item.name} quantity: ${qty}`);
      subtotal.textContent = fmt(calcItemTotal(item, qty));
      updateOrderSummary();
      _syncCheckoutItem(item);
    });
  });
}

function _wireLettersPanelControls(card, item) {
  const checkbox   = card.querySelector('.pack-checkbox');
  const extrasRow  = card.querySelector('[data-row="extras"]');
  const extrasBtns = card.querySelectorAll('.qty-btn[data-target="extras"]');

  function refreshExtrasLock() {
    const locked = cart[item.id].groups === 0;
    extrasRow.classList.toggle('letters-row--disabled', locked);
    extrasBtns.forEach(btn => { btn.disabled = locked; });
    if (locked && cart[item.id].extras > 0) {
      cart[item.id].extras = 0;
      card.querySelector('.qty-display[data-target="extras"]').textContent = '0';
      card.querySelector('.item-subtotal[data-target="extras"]').textContent = '$0.00';
    }
  }

  checkbox.addEventListener('change', () => {
    cart[item.id].groups = checkbox.checked ? 1 : 0;
    card.querySelector('.item-subtotal[data-target="groups"]').textContent =
      checkbox.checked ? fmt(item.pricePerGroup) : '$0.00';
    refreshExtrasLock();
    updateOrderSummary();
    _syncCheckoutItem(item);
  });

  card.querySelectorAll('.qty-btn[data-target="extras"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'plus')       cart[item.id].extras++;
      else if (action === 'minus') { if (cart[item.id].extras > 0) cart[item.id].extras--; }

      const extras = cart[item.id].extras;
      card.querySelector('.qty-display[data-target="extras"]').textContent = extras;
      card.querySelector('.item-subtotal[data-target="extras"]').textContent = fmt(extras * item.pricePerExtra);
      updateOrderSummary();
      _syncCheckoutItem(item);
    });
  });
}

// ══════════════════════════════════════════════════ ASSORTED PANEL

function _buildAssortedPanelHtml(item) {
  const eligible = _assortedEligibleItems();
  const total    = _assortedTotal(item.id);
  const isValid  = total >= 12 && total % 12 === 0;

  const statusText = total === 0
    ? 'Select any combination of 12'
    : total % 12 !== 0
      ? `${12 - (total % 12)} more to complete a dozen`
      : `${total / 12} dozen`;

  const buildItemHtml = (sub) => {
    const qty = (cart[item.id] || {})[sub.id] || 0;
    return `
      <div class="assorted-picker-item" data-sub-id="${sub.id}">
        <div class="assorted-picker-item__img-wrap">
          <img src="${sub.image}" alt="${sub.name}" class="assorted-picker-item__img" loading="lazy"
               onerror="this.style.display='none'" />
        </div>
        <span class="assorted-picker-item__name">${sub.name}</span>
        <button class="qty-btn minus" data-action="minus" data-sub="${sub.id}" aria-label="Remove one ${sub.name}">−</button>
        <span class="qty-display" data-sub="${sub.id}" aria-live="polite">${qty}</span>
        <button class="qty-btn plus" data-action="plus" data-sub="${sub.id}" aria-label="Add one ${sub.name}">+</button>
        <button class="qty-btn delete" data-action="delete" data-sub="${sub.id}" aria-label="Remove all ${sub.name}" title="Remove">
          <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
        </button>
      </div>`;
  };

  const yeastItems = eligible.filter(m => m.type === 'Yeast');
  const cakeItems  = eligible.filter(m => m.type === 'Cake');

  return `
    <div class="assorted-panel">
      <div class="assorted-panel__header">
        <span class="assorted-panel__count${isValid ? ' assorted-panel__count--valid' : ''}">
          <span class="assorted-panel__count-num">${total}</span> selected
        </span>
        <span class="assorted-panel__status${isValid ? ' assorted-panel__status--valid' : ''}">${statusText}</span>
      </div>
      <div class="assorted-panel__section">
        <h4 class="assorted-panel__section-title">Yeast</h4>
        <div class="assorted-panel__items">${yeastItems.map(buildItemHtml).join('')}</div>
      </div>
      <div class="assorted-panel__section">
        <h4 class="assorted-panel__section-title">Cake</h4>
        <div class="assorted-panel__items">${cakeItems.map(buildItemHtml).join('')}</div>
      </div>
    </div>`;
}

function _refreshAssortedPanelHeader(panel, item) {
  const total   = _assortedTotal(item.id);
  const isValid = total >= 12 && total % 12 === 0;

  const countNumEl = panel.querySelector('.assorted-panel__count-num');
  const countEl    = panel.querySelector('.assorted-panel__count');
  const statusEl   = panel.querySelector('.assorted-panel__status');

  if (countNumEl) countNumEl.textContent = total;
  if (countEl)    countEl.classList.toggle('assorted-panel__count--valid', isValid);

  let statusText;
  if (total === 0)           statusText = 'Select at least 12 (must be a multiple of 12)';
  else if (total % 12 !== 0) statusText = `${12 - (total % 12)} more to complete a dozen`;
  else                       statusText = `${total / 12} dozen`;

  if (statusEl) {
    statusEl.textContent = statusText;
    statusEl.classList.toggle('assorted-panel__status--valid', isValid);
  }
}

function _wireAssortedPanelControls(card, item) {
  const panel = card.querySelector('.assorted-panel');
  if (!panel) return;

  panel.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const subId  = btn.dataset.sub;
      if (!cart[item.id]) cart[item.id] = {};

      if (action === 'plus')        cart[item.id][subId]++;
      else if (action === 'minus')  { if (cart[item.id][subId] > 0) cart[item.id][subId]--; }
      else if (action === 'delete') cart[item.id][subId] = 0;

      const qtyEl = panel.querySelector(`.qty-display[data-sub="${subId}"]`);
      if (qtyEl) qtyEl.textContent = cart[item.id][subId];

      _refreshAssortedPanelHeader(panel, item);
      updateOrderSummary();
      _syncCheckoutItem(item);
    });
  });
}

// ══════════════════════════════════════════════════ CHECKOUT FAB

function initCheckoutFab() {
  const fab = $('#checkout-fab');
  if (!fab) return;
  fab.addEventListener('click', () => showCheckoutView());
}

// ══════════════════════════════════════════════════ CHECKOUT VIEW

function showCheckoutView() {
  const viewEl    = $('#checkout-view');
  const cartItems = $('#checkout-cart-items');
  if (!viewEl || !cartItems) return;

  cartItems.innerHTML = '';
  let hasItems = false;

  MENU_DATA.forEach(item => {
    const isOrdered = item.isAssorted
      ? _assortedTotal(item.id) > 0
      : item.isLetters
        ? (cart[item.id]?.groups || 0) > 0
        : (cart[item.id] || 0) > 0;
    if (!isOrdered) return;
    hasItems = true;
    cartItems.appendChild(_buildCheckoutItem(item));
  });

  if (!hasItems) return;

  _setCheckoutVisible(true);
  updateOrderSummary();
  document.getElementById('order')?.scrollIntoView({ behavior: 'smooth' });
  // preventScroll stops focus from triggering a second competing scroll
  setTimeout(() => $('#customer-name')?.focus({ preventScroll: true }), 500);
}

/** Build and wire a single checkout cart item element. */
function _buildCheckoutItem(item) {
  const el = document.createElement('div');
  el.className = 'checkout-cart-item';
  el.setAttribute('role', 'listitem');
  el.dataset.itemId = item.id;

  if (item.isAssorted) {
    el.classList.add('checkout-cart-item--assorted-box');
    _buildAssortedCheckoutBox(el, item);
    return el;
  }

  let qtyLabel, subtotal;
  if (item.isLetters) {
    const { groups, extras } = cart[item.id];
    subtotal = groups * item.pricePerGroup + extras * item.pricePerExtra;
    qtyLabel = `${groups} pack of ${item.groupSize}${extras > 0 ? ` + ${extras} extra` : ''}`;
  } else {
    const qty = cart[item.id];
    subtotal = calcItemTotal(item, qty);
    qtyLabel = `× ${qty}`;
  }

  const editLabel  = item.isLetters ? '<span class="checkout-edit-label">Extra letters</span>' : '';
  const minusLabel = item.isLetters ? 'Remove one extra letter' : `Remove one ${item.name}`;
  const plusLabel  = item.isLetters ? 'Add one extra letter'    : `Add one ${item.name}`;
  const initQty    = item.isLetters ? cart[item.id].extras      : cart[item.id];
  const editRowHtml = `
    <div class="checkout-cart-item__edit-row" hidden>
      ${editLabel}
      <button class="qty-btn minus" data-action="minus" aria-label="${minusLabel}">−</button>
      <span class="qty-display">${initQty}</span>
      <button class="qty-btn plus" data-action="plus" aria-label="${plusLabel}">+</button>
      <button class="qty-btn delete" data-action="delete" aria-label="Remove ${item.name} from order" title="Remove item">
        <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
      </button>
    </div>`;

  el.innerHTML = `
    <div class="checkout-cart-item__thumb" aria-hidden="true">
      <img
        src="${item.image}"
        alt="${item.name} donut"
        loading="lazy"
        onerror="this.parentElement.innerHTML='<i class=&quot;fa-solid fa-circle-notch&quot; aria-hidden=&quot;true&quot;></i>'"
      />
    </div>
    <div class="checkout-cart-item__info">
      <div class="checkout-cart-item__name">${item.name} ${item.type}</div>
      <div class="checkout-cart-item__qty">${qtyLabel}</div>
    </div>
    <div class="checkout-cart-item__price-col">
      <span class="checkout-cart-item__subtotal">${fmt(subtotal)}</span>
      <div class="checkout-item__btns">
        <button class="checkout-delete-btn" aria-label="Remove ${item.name} from order">Delete</button>
        <button class="checkout-edit-btn" aria-expanded="false" aria-label="Edit ${item.name} in order">Edit</button>
      </div>
    </div>
    ${editRowHtml}
  `;

  // Toggle edit row (not shown for assorted items)
  const editBtn = el.querySelector('.checkout-edit-btn');
  const editRow = el.querySelector('.checkout-cart-item__edit-row');
  if (editBtn && editRow) {
    editBtn.addEventListener('click', () => {
      const opening = editRow.hidden;
      editRow.hidden = !opening;
      editBtn.setAttribute('aria-expanded', String(opening));
      editBtn.textContent = opening ? 'Done' : 'Edit';
    });
  }

  // Delete button — remove item entirely
  el.querySelector('.checkout-delete-btn').addEventListener('click', () => {
    if (item.isLetters)  cart[item.id] = { groups: 0, extras: 0 };
    else                 cart[item.id] = 0;
    _syncMenuCard(item);
    el.remove();
    _checkCheckoutEmpty();
    updateOrderSummary();
  });

  // Wire qty controls
  const qtyDisplayEl = el.querySelector('.qty-display');
  const qtyLabelEl   = el.querySelector('.checkout-cart-item__qty');
  const subtotalEl   = el.querySelector('.checkout-cart-item__subtotal');

  el.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;

      if (item.isLetters) {
        if (action === 'plus')        cart[item.id].extras++;
        else if (action === 'minus')  { if (cart[item.id].extras > 0) cart[item.id].extras--; }
        else if (action === 'delete') { cart[item.id] = { groups: 0, extras: 0 }; }

        _syncMenuCard(item);

        if (cart[item.id].groups === 0) {
          el.remove();
          _checkCheckoutEmpty();
          updateOrderSummary();
          return;
        }

        const { groups, extras } = cart[item.id];
        const newSubtotal = groups * item.pricePerGroup + extras * item.pricePerExtra;
        qtyDisplayEl.textContent = extras;
        qtyLabelEl.textContent   = `${groups} pack of ${item.groupSize}${extras > 0 ? ` + ${extras} extra` : ''}`;
        subtotalEl.textContent   = fmt(newSubtotal);
      } else {
        if (action === 'plus')        cart[item.id]++;
        else if (action === 'minus')  { if (cart[item.id] > 0) cart[item.id]--; }
        else if (action === 'delete') cart[item.id] = 0;

        _syncMenuCard(item);

        if (cart[item.id] === 0) {
          el.remove();
          _checkCheckoutEmpty();
          updateOrderSummary();
          return;
        }

        const qty = cart[item.id];
        qtyDisplayEl.textContent = qty;
        qtyLabelEl.textContent   = `× ${qty}`;
        subtotalEl.textContent   = fmt(calcItemTotal(item, qty));
      }

      updateOrderSummary();
    });
  });

  return el;
}

/** Build and wire the assorted box structure inside a checkout-cart-item el. */
function _buildAssortedCheckoutBox(el, item) {
  const total    = _assortedTotal(item.id);
  const dozens   = Math.floor(total / 12);
  const subtotal = dozens * item.dozen;

  const header = document.createElement('div');
  header.className = 'assorted-box-header';
  header.innerHTML = `
    <div class="checkout-cart-item__thumb" aria-hidden="true">
      <img
        src="${item.image}"
        alt="${item.name}"
        loading="lazy"
        onerror="this.parentElement.innerHTML='<i class=&quot;fa-solid fa-circle-notch&quot; aria-hidden=&quot;true&quot;></i>'"
      />
    </div>
    <div class="checkout-cart-item__info">
      <div class="checkout-cart-item__name">${item.name}</div>
      <div class="checkout-cart-item__qty assorted-box__count">${total} selected — ${dozens} dozen</div>
    </div>
    <div class="checkout-cart-item__price-col">
      <span class="checkout-cart-item__subtotal assorted-box__total">${fmt(subtotal)}</span>
      <div class="checkout-item__btns">
        <button class="checkout-delete-btn" aria-label="Remove Build Your Box from order">Delete All</button>
      </div>
    </div>
  `;
  el.appendChild(header);

  const subRowsContainer = document.createElement('div');
  subRowsContainer.className = 'assorted-box-sub-rows';
  _assortedEligibleItems().forEach(sub => {
    if ((cart[item.id][sub.id] || 0) === 0) return;
    subRowsContainer.appendChild(_buildAssortedSubRowEl(item, sub));
  });
  el.appendChild(subRowsContainer);

  header.querySelector('.checkout-delete-btn').addEventListener('click', () => {
    Object.keys(cart[item.id]).forEach(k => { cart[item.id][k] = 0; });
    _syncMenuCard(item);
    el.remove();
    _checkCheckoutEmpty();
    updateOrderSummary();
  });
}

/** Build a single sub-row element for one donut type inside the assorted box. */
function _buildAssortedSubRowEl(boxItem, sub) {
  const qty   = cart[boxItem.id][sub.id] || 0;
  const subEl = document.createElement('div');
  subEl.className = 'assorted-box-sub-row';
  subEl.dataset.subId = sub.id;

  subEl.innerHTML = `
    <div class="assorted-box-sub-row__thumb" aria-hidden="true">
      <img
        src="${sub.image}"
        alt="${sub.name}"
        loading="lazy"
        onerror="this.parentElement.innerHTML='<i class=&quot;fa-solid fa-circle-notch&quot; aria-hidden=&quot;true&quot;></i>'"
      />
    </div>
    <div class="assorted-box-sub-row__name">
      ${sub.name} <span class="assorted-box-sub-row__type">${sub.type}</span>
    </div>
    <div class="assorted-box-sub-row__price-col">
      <span class="assorted-box-sub-row__qty">× ${qty}</span>
      <div class="checkout-item__btns">
        <button class="checkout-edit-btn" aria-expanded="false" aria-label="Edit ${sub.name} quantity">Edit</button>
      </div>
    </div>
    <div class="assorted-box-sub-row__edit-row" hidden>
      <button class="qty-btn minus" data-action="minus" aria-label="Remove one ${sub.name}">−</button>
      <span class="qty-display">${qty}</span>
      <button class="qty-btn plus" data-action="plus" aria-label="Add one ${sub.name}">+</button>
      <button class="qty-btn delete" data-action="delete" aria-label="Remove ${sub.name} from box" title="Remove">
        <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
      </button>
    </div>
  `;

  // Wire edit toggle
  const editBtn = subEl.querySelector('.checkout-edit-btn');
  const editRow = subEl.querySelector('.assorted-box-sub-row__edit-row');
  editBtn.addEventListener('click', () => {
    const opening = editRow.hidden;
    editRow.hidden = !opening;
    editBtn.setAttribute('aria-expanded', String(opening));
    editBtn.textContent = opening ? 'Done' : 'Edit';
  });

  // Wire qty buttons — update cart, sync menu picker, sync checkout header+rows
  subEl.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (action === 'plus')        cart[boxItem.id][sub.id]++;
      else if (action === 'minus')  { if (cart[boxItem.id][sub.id] > 0) cart[boxItem.id][sub.id]--; }
      else if (action === 'delete') cart[boxItem.id][sub.id] = 0;

      // Sync menu card picker display
      const menuCard = document.querySelector(`#order-panel-${boxItem.id}`)?.closest('.menu-card');
      if (menuCard) {
        const assortedPanel = menuCard.querySelector('.assorted-panel');
        const qtyEl = assortedPanel?.querySelector(`.qty-display[data-sub="${sub.id}"]`);
        if (qtyEl) qtyEl.textContent = cart[boxItem.id][sub.id];
        if (assortedPanel) _refreshAssortedPanelHeader(assortedPanel, boxItem);
      }

      _syncCheckoutItem(boxItem);
      updateOrderSummary();
    });
  });

  return subEl;
}

/** Show or hide the checkout view, empty-state placeholder, and browse bar together. */
function _setCheckoutVisible(visible) {
  const emptyEl   = $('#checkout-empty');
  const viewEl    = $('#checkout-view');
  const browseBar = $('#checkout-browse-bar');
  if (emptyEl)   emptyEl.hidden   = visible;
  if (viewEl)    viewEl.hidden    = !visible;
  if (browseBar) browseBar.hidden = !visible;
}

function _checkCheckoutEmpty() {
  const cartItems = $('#checkout-cart-items');
  if (!cartItems || cartItems.children.length > 0) return;
  _setCheckoutVisible(false);
}

/**
 * Called from menu card controls to keep the checkout view in sync.
 * Adds, updates, or removes the checkout row for this item without
 * rebuilding the whole list.
 */
function _syncCheckoutItem(item) {
  const viewEl = $('#checkout-view');
  if (!viewEl) return;

  const cartItems = $('#checkout-cart-items');
  if (!cartItems) return;

  const existing  = cartItems.querySelector(`[data-item-id="${item.id}"]`);
  const isOrdered = item.isAssorted
    ? _assortedTotal(item.id) > 0
    : item.isLetters
      ? (cart[item.id]?.groups || 0) > 0
      : (cart[item.id] || 0) > 0;

  if (isOrdered) {
    if (existing) {
      // Update in place
      const qtyLabelEl   = existing.querySelector('.checkout-cart-item__qty');
      const subtotalEl   = existing.querySelector('.checkout-cart-item__subtotal');
      const qtyDisplayEl = existing.querySelector('.qty-display');

      if (item.isAssorted) {
        const total   = _assortedTotal(item.id);
        const dozens  = Math.floor(total / 12);
        const countEl = existing.querySelector('.assorted-box__count');
        const totalEl = existing.querySelector('.assorted-box__total');
        if (countEl) countEl.textContent = `${total} selected — ${dozens} dozen`;
        if (totalEl) totalEl.textContent = fmt(dozens * item.dozen);

        const subRowsContainer = existing.querySelector('.assorted-box-sub-rows');
        _assortedEligibleItems().forEach(sub => {
          const qty         = cart[item.id][sub.id] || 0;
          const existingSub = subRowsContainer.querySelector(`[data-sub-id="${sub.id}"]`);
          if (qty === 0) {
            if (existingSub) existingSub.remove();
          } else if (existingSub) {
            const qtySpan = existingSub.querySelector('.assorted-box-sub-row__qty');
            const qtyDisp = existingSub.querySelector('.qty-display');
            if (qtySpan) qtySpan.textContent = `× ${qty}`;
            if (qtyDisp) qtyDisp.textContent = qty;
          } else {
            subRowsContainer.appendChild(_buildAssortedSubRowEl(item, sub));
          }
        });
      } else if (item.isLetters) {
        const { groups, extras } = cart[item.id];
        const newSubtotal = groups * item.pricePerGroup + extras * item.pricePerExtra;
        if (qtyLabelEl)   qtyLabelEl.textContent   = `${groups} pack of ${item.groupSize}${extras > 0 ? ` + ${extras} extra` : ''}`;
        if (subtotalEl)   subtotalEl.textContent   = fmt(newSubtotal);
        if (qtyDisplayEl) qtyDisplayEl.textContent = extras;
      } else {
        const qty = cart[item.id];
        if (qtyLabelEl)   qtyLabelEl.textContent   = `× ${qty}`;
        if (subtotalEl)   subtotalEl.textContent   = fmt(calcItemTotal(item, qty));
        if (qtyDisplayEl) qtyDisplayEl.textContent = qty;
      }
    } else {
      // First time this item is ordered — append a new row and reveal checkout view
      cartItems.appendChild(_buildCheckoutItem(item));
      _setCheckoutVisible(true);
    }
  } else if (existing) {
    existing.remove();
    _checkCheckoutEmpty();
  }
}

/** Push current cart state back into the visible menu card for this item. */
function _syncMenuCard(item) {
  const menuCard = document.querySelector(`#order-panel-${item.id}`)?.closest('.menu-card');
  if (!menuCard) return;

  if (item.isAssorted) {
    Object.keys(cart[item.id]).forEach(k => { cart[item.id][k] = 0; });
    const assortedPanel = menuCard.querySelector('.assorted-panel');
    if (assortedPanel) {
      assortedPanel.querySelectorAll('.qty-display[data-sub]').forEach(el => { el.textContent = '0'; });
      _refreshAssortedPanelHeader(assortedPanel, item);
    }
  } else if (item.isLetters) {
    const { groups = 0, extras = 0 } = cart[item.id] || {};
    const checkbox   = menuCard.querySelector('.pack-checkbox');
    const extrasRow  = menuCard.querySelector('[data-row="extras"]');
    const extrasBtns = menuCard.querySelectorAll('.qty-btn[data-target="extras"]');
    const extrasQd   = menuCard.querySelector('.qty-display[data-target="extras"]');
    const extrasSt   = menuCard.querySelector('.item-subtotal[data-target="extras"]');
    const groupsSt   = menuCard.querySelector('.item-subtotal[data-target="groups"]');

    if (checkbox)  checkbox.checked = groups > 0;
    if (extrasQd)  extrasQd.textContent = extras;
    if (extrasSt)  extrasSt.textContent = fmt(extras * item.pricePerExtra);
    if (groupsSt)  groupsSt.textContent = fmt(groups * item.pricePerGroup);
    const locked = groups === 0;
    if (extrasRow) extrasRow.classList.toggle('letters-row--disabled', locked);
    extrasBtns.forEach(btn => { btn.disabled = locked; });
  } else {
    const qty = cart[item.id] || 0;
    const qd  = menuCard.querySelector('.qty-display');
    const st  = menuCard.querySelector('.item-subtotal');
    if (qd) qd.textContent = qty;
    if (st) st.textContent = fmt(calcItemTotal(item, qty));
  }
}

// ══════════════════════════════════════════════════ BUSINESS HOURS

const _DAY_KEYS   = ['sunday','monday','tuesday','wednesday','thursday','friday','saturday'];
const _MONTH_KEYS = ['january','february','march','april','may','june',
                     'july','august','september','october','november','december'];

/** Returns true if `date` matches any entry in BUSINESS_CONFIG.closedDates. */
function isClosedDate(date) {
  for (const entry of BUSINESS_CONFIG.closedDates) {
    if (typeof entry === 'string') {
      if (_DAY_KEYS[date.getDay()] === entry.toLowerCase()) return true;
    } else if (Array.isArray(entry)) {
      const [month, day, year] = entry;
      const mIdx = _MONTH_KEYS.indexOf(month.toLowerCase());
      if (mIdx !== -1 &&
          date.getMonth() === mIdx &&
          date.getDate() === parseInt(day, 10) &&
          date.getFullYear() === parseInt(year, 10)) return true;
    }
  }
  return false;
}

/**
 * Returns [openTime, closeTime] strings for `date`, or null if closed.
 */
function getHoursForDate(date) {
  if (isClosedDate(date)) return null;
  const h = BUSINESS_CONFIG.hours[_DAY_KEYS[date.getDay()]];
  if (!h || (h[0] === '00:00' && h[1] === '00:00')) return null;
  return h;
}

/** Formats a 24-h "HH:MM" string to "h:MM AM/PM". */
function fmt12(t) {
  const [h, m] = t.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12  = h % 12 || 12;
  return m === 0 ? `${h12} ${ampm}` : `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
}

/**
 * Reads the selected date, then enables/disables the time input and sets
 * its min/max to the business hours for that day.
 */
function applyTimeConstraints(dateInput, timeInput) {
  const dateErrEl = $('#date-error');
  const altInput  = _timePicker?.altInput ?? null;

  if (!dateInput.value) {
    timeInput.disabled = false;
    if (altInput) altInput.disabled = false;
    if (_timePicker) { _timePicker.set('minTime', null); _timePicker.set('maxTime', null); }
    return;
  }

  const date  = new Date(dateInput.value + 'T12:00:00');
  const hours = getHoursForDate(date);

  if (hours === null) {
    setError(dateInput, dateErrEl, "Sorry, we're closed on this date. Please choose another day.");
    if (_timePicker) _timePicker.clear();
    timeInput.disabled = true;
    if (altInput) altInput.disabled = true;
    clearError(timeInput);
    if (altInput) clearError(altInput);
  } else {
    clearError(dateInput);
    timeInput.disabled = false;
    if (altInput) altInput.disabled = false;
    if (_timePicker) {
      // On today, don't allow times already in the past
      const today  = new Date();
      const isToday = date.toDateString() === today.toDateString();
      let minTime = hours[0];
      if (isToday) {
        let h = today.getHours();
        let m = Math.floor(today.getMinutes() / 5) * 5 + 5; // next 5-min slot
        if (m >= 60) { m -= 60; h += 1; }
        if (h >= 24) { h = 23; m = 55; }
        const nowStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        if (nowStr > hours[0]) minTime = nowStr;
      }

      _timePicker.set('minTime', minTime);
      _timePicker.set('maxTime', hours[1]);
      if (timeInput.value && (timeInput.value < minTime || timeInput.value > hours[1])) {
        _timePicker.clear();
      }
    }
  }
}

// ══════════════════════════════════════════════════ ORDER SECTION

function initOrderSection() {
  // Initialise cart state for all items
  MENU_DATA.forEach(item => {
    if (item.isLetters) {
      cart[item.id] = { groups: 0, extras: 0 };
    } else if (item.isAssorted) {
      cart[item.id] = {};
      _assortedEligibleItems().forEach(sub => { cart[item.id][sub.id] = 0; });
    } else {
      cart[item.id] = 0;
    }
  });

  const dateInputEl = $('#order-date');
  const timeInput   = $('#order-time');

  if (dateInputEl) {
    const today = new Date().toISOString().split('T')[0];

    _datePicker = flatpickr(dateInputEl, {
      minDate: 'today',
      dateFormat: 'Y-m-d',
      disable: [date => getHoursForDate(date) === null],
      onChange: () => { if (timeInput) applyTimeConstraints(dateInputEl, timeInput); },
    });

    _datePicker.setDate(today, false);

    if (timeInput) {
      _timePicker = flatpickr(timeInput, {
        enableTime: true,
        noCalendar: true,
        dateFormat: 'H:i',
        altInput: true,
        altFormat: 'h:i K',
        time_24hr: false,
        minuteIncrement: 5,
      });

      const calContainer = _timePicker.calendarContainer;
      if (calContainer) {
        const hourInp = calContainer.querySelector('.flatpickr-hour');
        const minInp  = calContainer.querySelector('.flatpickr-minute');

        if (hourInp) {
          hourInp.addEventListener('click', () => {
            hourInp._saved = hourInp.value;
            hourInp.value = '';
          });
          hourInp.addEventListener('blur', () => {
            if (hourInp.value === '' && hourInp._saved != null) hourInp.value = hourInp._saved;
          });
        }

        if (minInp) {
          minInp.addEventListener('click', () => {
            minInp._saved = minInp.value;
            minInp.value = '';
          });
          minInp.addEventListener('blur', () => {
            if (minInp.value === '') {
              minInp.value = minInp._saved ?? '00';
              return;
            }
            const val = parseInt(minInp.value, 10);
            if (isNaN(val)) return;
            let snapped = Math.round(val / 5) * 5;
            if (snapped >= 60) snapped = 55;
            const snappedStr = String(snapped).padStart(2, '0');
            if (minInp.value !== snappedStr) {
              minInp.value = snappedStr;
              const current = _timePicker.selectedDates[0];
              if (current) { current.setMinutes(snapped); _timePicker.setDate(current, false); }
            }
          });
        }
      }

      applyTimeConstraints(dateInputEl, timeInput);
    }
  }
}

function updateOrderSummary() {
  let totalQty   = 0;
  let totalPrice = 0;

  MENU_DATA.forEach(item => {
    if (item.isAssorted) {
      const total = _assortedTotal(item.id);
      totalQty   += total;
      totalPrice += Math.floor(total / 12) * item.dozen;
    } else if (item.isLetters) {
      const { groups = 0, extras = 0 } = cart[item.id] || {};
      totalQty   += groups + extras;
      totalPrice += groups * item.pricePerGroup + extras * item.pricePerExtra;
    } else {
      const qty = cart[item.id] || 0;
      totalQty   += qty;
      totalPrice += calcItemTotal(item, qty);
    }
  });

  const countEl = $('#summary-count');
  const totalEl = $('#summary-total');
  if (countEl) countEl.textContent = totalQty;
  if (totalEl) totalEl.textContent = fmt(totalPrice);

  // Update checkout FAB
  const fab      = $('#checkout-fab');
  const fabCount = $('#checkout-fab-count');
  if (fab) {
    fab.hidden = totalQty === 0;
    fab.setAttribute('aria-label', `Checkout — ${totalQty} item${totalQty !== 1 ? 's' : ''} in cart`);
  }
  if (fabCount) fabCount.textContent = totalQty;

  // Update dynamic anchors: Order Now hero button + Order nav link
  const target      = totalQty > 0 ? '#order' : '#menu';
  const heroCta     = $('.hero-cta');
  const orderNavLink = $$('.nav-link').find(l => l.textContent.trim() === 'Order');
  if (heroCta)      heroCta.href = target;
  if (orderNavLink) orderNavLink.href = target;
}

// ══════════════════════════════════════════════════ FORM VALIDATION & SUBMIT

function initForm() {
  const form = $('#order-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validateForm(form)) {
      showConfirmationModal(form);
    }
  });

  // Real-time field validation on blur
  const fields = $$('input[required], input[type="email"]', form);
  fields.forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => clearError(field));
  });
}

function validateField(field) {
  if (field.disabled) return true;
  clearError(field);
  const errEl = $(`#${field.getAttribute('aria-describedby')}`) ||
                field.nextElementSibling;

  if (field.required && !field.value.trim()) {
    setError(field, errEl, 'This field is required.');
    return false;
  }

  if (field.type === 'email' && field.value && !isValidEmail(field.value)) {
    setError(field, errEl, 'Please enter a valid email address.');
    return false;
  }

  if (field.type === 'tel' && field.value && !isValidPhone(field.value)) {
    setError(field, errEl, 'Please enter a valid phone number.');
    return false;
  }

  return true;
}

function validateForm(form) {
  const fields = $$('input[required]', form);
  let valid = true;
  fields.forEach(field => {
    if (!validateField(field)) valid = false;
  });

  // Business-hours validation
  const dateInput = $('#order-date');
  const timeInput = $('#order-time');
  if (dateInput && dateInput.value) {
    const date      = new Date(dateInput.value + 'T12:00:00');
    const hours     = getHoursForDate(date);
    const dateErrEl = $('#date-error');
    const timeErrEl = $('#time-error');
    if (hours === null) {
      setError(dateInput, dateErrEl, "Sorry, we're closed on this date. Please choose another day.");
      valid = false;
    } else if (timeInput && !timeInput.disabled && timeInput.value) {
      if (timeInput.value < hours[0] || timeInput.value > hours[1]) {
        const displayInput = _timePicker?.altInput || timeInput;
        setError(displayInput, timeErrEl, `We're open ${fmt12(hours[0])} – ${fmt12(hours[1])} on this day.`);
        valid = false;
      }
    }
  }

  // Validate assorted box quantities (must be ≥12 and a multiple of 12 if anything selected)
  MENU_DATA.forEach(item => {
    if (!item.isAssorted) return;
    const total = _assortedTotal(item.id);
    if (total === 0) return; // nothing selected — caught by empty-cart check below
    const remaining = total % 12;
    if (total < 12 || remaining !== 0) {
      const need = remaining === 0 ? 0 : 12 - remaining;
      let assortedErr = $('#assorted-error');
      if (!assortedErr) {
        assortedErr = document.createElement('p');
        assortedErr.id = 'assorted-error';
        assortedErr.className = 'field-error';
        assortedErr.setAttribute('role', 'alert');
        assortedErr.style.marginBottom = 'var(--space-sm)';
        const actions = form.querySelector('.form-actions');
        if (actions) form.insertBefore(assortedErr, actions);
        else form.appendChild(assortedErr);
      }
      assortedErr.textContent = total < 12
        ? `Build Your Box: You have ${total} selected. Please select at least 12 to make a dozen.`
        : `Build Your Box: You have ${total} selected. Please add ${need} more to complete the next dozen.`;
      assortedErr.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      valid = false;
    } else {
      const assortedErr = $('#assorted-error');
      if (assortedErr) assortedErr.remove();
    }
  });

  // Check that at least one item is in the cart
  let totalItems = 0;
  MENU_DATA.forEach(item => {
    if (item.isAssorted)     totalItems += _assortedTotal(item.id);
    else if (item.isLetters) totalItems += cart[item.id]?.groups || 0;
    else                     totalItems += cart[item.id] || 0;
  });

  if (totalItems === 0) {
    let cartError = $('#cart-error');
    if (!cartError) {
      cartError = document.createElement('p');
      cartError.id = 'cart-error';
      cartError.className = 'field-error';
      cartError.setAttribute('role', 'alert');
      cartError.style.marginBottom = 'var(--space-sm)';
      const actions = form.querySelector('.form-actions');
      if (actions) form.insertBefore(cartError, actions);
      else form.appendChild(cartError);
    }
    cartError.textContent = 'Please add at least one donut to your order.';
    cartError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    valid = false;
  } else {
    const cartError = $('#cart-error');
    if (cartError) cartError.remove();
  }

  return valid;
}

function setError(field, errEl, msg) {
  field.classList.add('input-error');
  field.setAttribute('aria-invalid', 'true');
  if (errEl) errEl.textContent = msg;
}

function clearError(field) {
  field.classList.remove('input-error');
  field.setAttribute('aria-invalid', 'false');
  const errId = field.getAttribute('aria-describedby');
  const errEl = errId ? $(`#${errId}`) : field.nextElementSibling;
  if (errEl && errEl.classList.contains('field-error')) errEl.textContent = '';
}

function isValidEmail(v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); }
function isValidPhone(v)  { return /^[\d\s\-().+]{7,}$/.test(v); }

// ══════════════════════════════════════════════════ CONFIRMATION MODAL

function initModal() {
  const modal    = $('#confirmation-modal');
  const closeBtn = $('#modal-close');
  const doneBtn  = $('#modal-done');
  if (!modal) return;

  const close = () => {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    const submitBtn = $('#submit-order-btn');
    if (submitBtn) submitBtn.focus();
  };

  closeBtn?.addEventListener('click', close);
  doneBtn?.addEventListener('click', close);

  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  modal.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
    if (e.key === 'Tab') {
      const focusable = $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal);
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    }
  });
}

function showConfirmationModal(form) {
  const modal   = $('#confirmation-modal');
  const summary = $('#modal-summary');
  if (!modal) return;

  if (summary) {
    summary.innerHTML = '';

    let total = 0;
    const orderedItems = MENU_DATA.filter(item => {
      if (item.isAssorted) return _assortedTotal(item.id) > 0;
      if (item.isLetters)  return (cart[item.id]?.groups || 0) > 0;
      return (cart[item.id] || 0) > 0;
    });

    orderedItems.forEach(item => {
      let subtotal, label;
      if (item.isAssorted) {
        const assortedQty = _assortedTotal(item.id);
        subtotal = Math.floor(assortedQty / 12) * item.dozen;
        label = `${item.name} — ${_assortedCheckoutLabel(item)}`;
      } else if (item.isLetters) {
        const { groups, extras } = cart[item.id];
        subtotal = groups * item.pricePerGroup + extras * item.pricePerExtra;
        label = `${item.name} — ${groups} pack${groups !== 1 ? 's' : ''} of ${item.groupSize}${extras > 0 ? ` + ${extras} extra` : ''}`;
      } else {
        const qty = cart[item.id];
        subtotal = calcItemTotal(item, qty);
        label = `${item.name} (${item.type}) × ${qty}`;
      }
      total += subtotal;

      const row = document.createElement('div');
      row.className = 'modal-summary-row';
      row.innerHTML = `<span>${label}</span><span>${fmt(subtotal)}</span>`;
      summary.appendChild(row);
    });

    const dateVal = $('#order-date')?.value;
    const timeVal = $('#order-time')?.value;
    if (dateVal || timeVal) {
      const divider = document.createElement('div');
      divider.style.cssText = 'border-top:1px solid var(--color-border); margin: 6px 0;';
      summary.appendChild(divider);

      const pickupRow = document.createElement('div');
      pickupRow.className = 'modal-summary-row';
      pickupRow.innerHTML = `
        <span>Pickup</span>
        <span>${dateVal || ''} ${timeVal ? fmt12(timeVal) : ''}</span>
      `;
      summary.appendChild(pickupRow);
    }

    const totalRow = document.createElement('div');
    totalRow.className = 'modal-summary-row total';
    totalRow.innerHTML = `<span>Order Total</span><span>${fmt(total)}</span>`;
    summary.appendChild(totalRow);
  }

  modal.hidden = false;
  modal.removeAttribute('aria-hidden');
  setTimeout(() => $('#modal-close')?.focus(), 50);

  const doneBtn = $('#modal-done');
  if (doneBtn) {
    const originalClick = doneBtn._resetHandler;
    if (originalClick) doneBtn.removeEventListener('click', originalClick);

    const resetHandler = () => {
      form.reset();

      // Reset cart state
      MENU_DATA.forEach(item => {
        if (item.isLetters)       cart[item.id] = { groups: 0, extras: 0 };
        else if (item.isAssorted) Object.keys(cart[item.id]).forEach(k => { cart[item.id][k] = 0; });
        else                      cart[item.id] = 0;
      });

      // Re-render menu cards (they read from cart{}, all panels show zeroed state)
      renderMenuItems(_currentCategory);

      // Return to empty checkout state
      _setCheckoutVisible(false);

      updateOrderSummary();

      // Reset date/time pickers
      const today = new Date().toISOString().split('T')[0];
      if (_datePicker) _datePicker.setDate(today, false);
      if (_timePicker) _timePicker.clear();
      const dateInputEl = $('#order-date');
      const timeInputEl = $('#order-time');
      if (dateInputEl && timeInputEl) applyTimeConstraints(dateInputEl, timeInputEl);
    };

    doneBtn._resetHandler = resetHandler;
    doneBtn.addEventListener('click', resetHandler, { once: true });
  }
}
