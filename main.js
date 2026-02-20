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
  return dozens * item.dozen + remainder * item.price;
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

  const toppingList   = item.ingredients.topping.map(t => `<li><span class="ingredient-tag">${t}</span></li>`).join('');
  const doughList     = item.ingredients.dough.map(t =>   `<li><span class="ingredient-tag">${t}</span></li>`).join('');
  const ingredPanelId = `ingredients-${item.id}`;
  const orderPanelId  = `order-panel-${item.id}`;

  const orderControlsHtml = item.isLetters
    ? _buildLettersPanelHtml(item)
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

      <div class="order-panel" id="${orderPanelId}" role="region" aria-label="Order ${item.name}">
        <div class="order-panel__inner">
          ${orderControlsHtml}
          <div class="order-panel__actions">
            ${!item.isLetters ? `<button class="qty-btn delete order-panel__delete-btn" data-action="delete" aria-label="Remove all ${item.name}" title="Remove from order"><i class="fa-solid fa-trash-can" aria-hidden="true"></i></button>` : ''}
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

// ══════════════════════════════════════════════════ CHECKOUT FAB

function initCheckoutFab() {
  const fab = $('#checkout-fab');
  if (!fab) return;
  fab.addEventListener('click', () => showCheckoutView());
}

// ══════════════════════════════════════════════════ CHECKOUT VIEW

function showCheckoutView() {
  const emptyEl   = $('#checkout-empty');
  const viewEl    = $('#checkout-view');
  const cartItems = $('#checkout-cart-items');
  if (!viewEl || !cartItems) return;

  cartItems.innerHTML = '';
  let hasItems = false;

  MENU_DATA.forEach(item => {
    const isOrdered = item.isLetters
      ? (cart[item.id]?.groups || 0) > 0
      : (cart[item.id] || 0) > 0;
    if (!isOrdered) return;
    hasItems = true;
    cartItems.appendChild(_buildCheckoutItem(item));
  });

  if (!hasItems) return;

  if (emptyEl) emptyEl.style.display = "none";
  viewEl.hidden = false;
  const browseBar = $('#checkout-browse-bar');
  if (browseBar) browseBar.hidden = false;
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

  const editRowHtml = item.isLetters
    ? `<div class="checkout-cart-item__edit-row" hidden>
         <span class="checkout-edit-label">Extra letters</span>
         <button class="qty-btn minus" data-action="minus" aria-label="Remove one extra letter">−</button>
         <span class="qty-display">${cart[item.id].extras}</span>
         <button class="qty-btn plus" data-action="plus" aria-label="Add one extra letter">+</button>
         <button class="qty-btn delete" data-action="delete" aria-label="Remove ${item.name} from order" title="Remove item">
           <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
         </button>
       </div>`
    : `<div class="checkout-cart-item__edit-row" hidden>
         <button class="qty-btn minus" data-action="minus" aria-label="Remove one ${item.name}">−</button>
         <span class="qty-display">${cart[item.id]}</span>
         <button class="qty-btn plus" data-action="plus" aria-label="Add one ${item.name}">+</button>
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

  // Toggle edit row
  const editBtn = el.querySelector('.checkout-edit-btn');
  const editRow = el.querySelector('.checkout-cart-item__edit-row');
  editBtn.addEventListener('click', () => {
    const opening = editRow.hidden;
    editRow.hidden = !opening;
    editBtn.setAttribute('aria-expanded', String(opening));
    editBtn.textContent = opening ? 'Done' : 'Edit';
  });

  // Delete button — remove item entirely
  el.querySelector('.checkout-delete-btn').addEventListener('click', () => {
    cart[item.id] = item.isLetters ? { groups: 0, extras: 0 } : 0;
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

function _checkCheckoutEmpty() {
  const cartItems = $('#checkout-cart-items');
  if (!cartItems || cartItems.children.length > 0) return;
  const emptyEl = $('#checkout-empty');
  const viewEl  = $('#checkout-view');
  if (viewEl)  viewEl.hidden = true;
  if (emptyEl) emptyEl.style.display = null;
  const browseBar = $('#checkout-browse-bar');
  if (browseBar) browseBar.hidden = true;
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
  const isOrdered = item.isLetters
    ? (cart[item.id]?.groups || 0) > 0
    : (cart[item.id] || 0) > 0;

  if (isOrdered) {
    if (existing) {
      // Update in place
      const qtyLabelEl   = existing.querySelector('.checkout-cart-item__qty');
      const subtotalEl   = existing.querySelector('.checkout-cart-item__subtotal');
      const qtyDisplayEl = existing.querySelector('.qty-display');

      if (item.isLetters) {
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
      const emptyEl  = $('#checkout-empty');
      const browseBar = $('#checkout-browse-bar');
      if (emptyEl) emptyEl.style.display = "none";
      viewEl.hidden  = false;
      if (browseBar) browseBar.hidden = false;
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

  if (item.isLetters) {
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
    if (st) st.textContent = fmt(qty * item.price);
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
    cart[item.id] = item.isLetters ? { groups: 0, extras: 0 } : 0;
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
    if (item.isLetters) {
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

  // Check that at least one item is in the cart
  let totalItems = 0;
  MENU_DATA.forEach(item => {
    if (item.isLetters) {
      totalItems += cart[item.id]?.groups || 0;
    } else {
      totalItems += cart[item.id] || 0;
    }
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
    const orderedItems = MENU_DATA.filter(item =>
      item.isLetters ? (cart[item.id]?.groups || 0) > 0 : (cart[item.id] || 0) > 0
    );

    orderedItems.forEach(item => {
      let subtotal, label;
      if (item.isLetters) {
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
        cart[item.id] = item.isLetters ? { groups: 0, extras: 0 } : 0;
      });

      // Re-render menu cards (they read from cart{}, all panels show zeroed state)
      renderMenuItems(_currentCategory);

      // Return to empty checkout state
      const checkoutView  = $('#checkout-view');
      const checkoutEmpty = $('#checkout-empty');
      if (checkoutView)  checkoutView.hidden = true;
      if (checkoutEmpty) checkoutEmpty.hidden = false;

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
