/**
 * Donut Buff — Main Application Script
 *
 * Responsibilities:
 *  1. Render menu cards from MENU_DATA (menu-data.js)
 *  2. Menu category filtering tabs
 *  3. Ingredient accordion (slide-down)
 *  4. Hamburger nav toggle
 *  5. Active nav link tracking on scroll
 *  6. Order form cart (add / remove / quantity)
 *  7. Order form validation
 *  8. Confirmation modal
 *  9. Footer copyright year
 */

'use strict';

// ── Helpers ──────────────────────────────────────────────────────────────────

/** @param {string} sel @param {Element|Document} ctx */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
/** @param {string} sel @param {Element|Document} ctx */
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const fmt = (n) => `$${n.toFixed(2)}`;

// ── State ─────────────────────────────────────────────────────────────────────
/**
 * Cart: { [itemId]: number }  — quantity per item
 */
const cart = {};

/** Flatpickr instance for the date picker (set in initOrderSection). */
let _datePicker = null;
/** Flatpickr instance for the time picker (set in initOrderSection). */
let _timePicker = null;

// ── On DOM Ready ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initFooterYear();
  initHamburger();
  initNavHighlight();
  initMenuSection();
  initOrderSection();
  initForm();
  initModal();
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

  const toppingList  = item.ingredients.topping.map(t => `<li><span class="ingredient-tag">${t}</span></li>`).join('');
  const doughList    = item.ingredients.dough.map(t =>   `<li><span class="ingredient-tag">${t}</span></li>`).join('');
  const toggleId     = `ingredients-${item.id}`;

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

      <button
        class="ingredients-toggle"
        aria-expanded="false"
        aria-controls="${toggleId}"
        aria-label="Show ingredients for ${item.name}"
      >
        <i class="fa-solid fa-list-ul" aria-hidden="true"></i>
        View Ingredients
        <span class="toggle-arrow" aria-hidden="true"><i class="fa-solid fa-chevron-down"></i></span>
      </button>

      <div class="ingredients-panel" id="${toggleId}" role="region" aria-label="${item.name} ingredients">
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
    </div>
  `;

  // Accordion toggle
  const toggle = card.querySelector('.ingredients-toggle');
  const panel  = card.querySelector('.ingredients-panel');

  toggle.addEventListener('click', () => {
    const open = panel.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', `${open ? 'Hide' : 'Show'} ingredients for ${item.name}`);
  });

  return card;
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
 * closedDates entries take priority over the weekly hours schedule.
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

  // Use T12:00:00 so Date() parses in local time, not UTC
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
      _timePicker.set('minTime', hours[0]);
      _timePicker.set('maxTime', hours[1]);
      // Clear a previously-set time that's now out of range
      if (timeInput.value && (timeInput.value < hours[0] || timeInput.value > hours[1])) {
        _timePicker.clear();
      }
    }
  }
}

// ══════════════════════════════════════════════════ ORDER SECTION

function initOrderSection() {
  const list = $('#order-item-list');
  if (!list) return;

  MENU_DATA.forEach(item => {
    cart[item.id] = item.isLetters ? { groups: 0, extras: 0 } : 0;
    list.appendChild(buildOrderItem(item));
  });

  const dateInputEl = $('#order-date');
  const timeInput   = $('#order-time');

  if (dateInputEl) {
    const today = new Date().toISOString().split('T')[0];

    // Flatpickr: disables closed dates visually in the calendar
    _datePicker = flatpickr(dateInputEl, {
      minDate: 'today',
      dateFormat: 'Y-m-d',
      disable: [date => getHoursForDate(date) === null],
      onChange: () => { if (timeInput) applyTimeConstraints(dateInputEl, timeInput); },
    });

    _datePicker.setDate(today, false); // pre-select today without triggering onChange

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

      // Click-to-clear: only clears the field the user explicitly clicks, not on auto-open
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
            // Restore if user typed nothing
            if (minInp.value === '') {
              minInp.value = minInp._saved ?? '00';
              return;
            }
            // Snap to nearest 5-minute boundary
            const val = parseInt(minInp.value, 10);
            if (isNaN(val)) return;
            let snapped = Math.round(val / 5) * 5;
            if (snapped >= 60) snapped = 55;
            const snappedStr = String(snapped).padStart(2, '0');
            if (minInp.value !== snappedStr) {
              minInp.value = snappedStr;
              // Sync flatpickr's internal selected date to the snapped minute
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

function buildOrderItem(item) {
  if (item.isLetters) return buildLettersOrderItem(item);
  const row = document.createElement('div');
  row.className = 'order-item';
  row.setAttribute('role', 'listitem');
  row.setAttribute('data-item-id', item.id);
  row.setAttribute('aria-label', `${item.name} — quantity selector`);

  row.innerHTML = `
    <div class="order-item__thumb" aria-hidden="true">
      <img
        src="${item.image}"
        alt="${item.name} donut"
        loading="lazy"
        onerror="this.parentElement.innerHTML='<i class=&quot;fa-solid fa-circle-notch&quot; aria-hidden=&quot;true&quot;></i>'"
      />
    </div>

    <div class="order-item__info">
      <div class="order-item__name">${item.name}</div>
      <div class="order-item__type">${item.type} Donut</div>
      <div class="order-item__unit-price">${fmt(item.price)} each</div>
    </div>

    <div class="order-item__controls">
      <button
        class="qty-btn minus"
        data-action="minus"
        aria-label="Remove one ${item.name} from order"
      >−</button>
      <span class="qty-display" aria-live="polite" aria-label="${item.name} quantity">0</span>
      <button
        class="qty-btn plus"
        data-action="plus"
        aria-label="Add one ${item.name} to order"
      >+</button>
      <button
        class="qty-btn delete"
        data-action="delete"
        aria-label="Remove all ${item.name} from order"
        title="Remove all"
      >
        <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
      </button>
      <span class="item-subtotal" aria-live="polite" aria-label="${item.name} subtotal">$0.00</span>
    </div>
  `;

  const qtyDisplay = row.querySelector('.qty-display');
  const subtotal   = row.querySelector('.item-subtotal');

  row.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;

      if (action === 'plus') {
        cart[item.id]++;
      } else if (action === 'minus') {
        if (cart[item.id] > 0) cart[item.id]--;
      } else if (action === 'delete') {
        cart[item.id] = 0;
      }

      const qty = cart[item.id];
      qtyDisplay.textContent = qty;
      qtyDisplay.setAttribute('aria-label', `${item.name} quantity: ${qty}`);
      subtotal.textContent = fmt(qty * item.price);
      subtotal.setAttribute('aria-label', `${item.name} subtotal: ${fmt(qty * item.price)}`);

      row.classList.toggle('has-items', qty > 0);
      updateOrderSummary();
    });
  });

  return row;
}

function buildLettersOrderItem(item) {
  const row = document.createElement('div');
  row.className = 'order-item order-item--letters';
  row.setAttribute('role', 'listitem');
  row.setAttribute('data-item-id', item.id);
  row.setAttribute('aria-label', `${item.name} — quantity selector`);

  row.innerHTML = `
    <div class="order-item__thumb" aria-hidden="true">
      <img
        src="${item.image}"
        alt="${item.name} donut"
        loading="lazy"
        onerror="this.parentElement.innerHTML='<i class=&quot;fa-solid fa-circle-notch&quot; aria-hidden=&quot;true&quot;></i>'"
      />
    </div>

    <div class="order-item__info">
      <div class="order-item__name">${item.name}</div>
      <div class="order-item__type">${item.type} Donut</div>
    </div>

    <div class="order-item__controls order-item__controls--letters">
      <div class="letters-row" data-row="groups">
        <span class="letters-row__label">6-letter pack <span class="letters-row__price">${fmt(item.pricePerGroup)}</span></span>
        <button class="qty-btn minus" data-action="minus" data-target="groups" aria-label="Remove one 6-letter pack">−</button>
        <span class="qty-display" data-target="groups" aria-live="polite" aria-label="6-letter packs: 0">0</span>
        <button class="qty-btn plus" data-action="plus" data-target="groups" aria-label="Add one 6-letter pack">+</button>
        <button class="qty-btn delete" data-action="delete" data-target="groups" aria-label="Remove all 6-letter packs" title="Remove all">
          <i class="fa-solid fa-trash-can" aria-hidden="true"></i>
        </button>
        <span class="item-subtotal" data-target="groups" aria-live="polite">$0.00</span>
      </div>

      <div class="letters-row letters-row--extras letters-row--disabled" data-row="extras">
        <span class="letters-row__label">Extra letter <span class="letters-row__price">${fmt(item.pricePerExtra)} ea</span></span>
        <button class="qty-btn minus" data-action="minus" data-target="extras" aria-label="Remove one extra letter" disabled>−</button>
        <span class="qty-display" data-target="extras" aria-live="polite" aria-label="Extra letters: 0">0</span>
        <button class="qty-btn plus" data-action="plus" data-target="extras" aria-label="Add one extra letter" disabled>+</button>
        <span class="item-subtotal" data-target="extras" aria-live="polite">$0.00</span>
      </div>
    </div>
  `;

  const extrasRow  = row.querySelector('[data-row="extras"]');
  const extrasBtns = row.querySelectorAll('.qty-btn[data-target="extras"]');

  function refreshExtrasLock() {
    const locked = cart[item.id].groups === 0;
    extrasRow.classList.toggle('letters-row--disabled', locked);
    extrasBtns.forEach(btn => { btn.disabled = locked; });
    if (locked && cart[item.id].extras > 0) {
      cart[item.id].extras = 0;
      row.querySelector('.qty-display[data-target="extras"]').textContent = '0';
      row.querySelector('.item-subtotal[data-target="extras"]').textContent = '$0.00';
    }
  }

  row.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      const target = btn.dataset.target; // "groups" or "extras"

      if (action === 'plus') {
        cart[item.id][target]++;
        // Auto-upgrade: every groupSize extras converts to +1 group
        if (target === 'extras' && cart[item.id].extras >= item.groupSize) {
          cart[item.id].groups++;
          cart[item.id].extras = 0;
        }
      } else if (action === 'minus') {
        if (cart[item.id][target] > 0) cart[item.id][target]--;
      } else if (action === 'delete') {
        cart[item.id][target] = 0;
        if (target === 'groups') cart[item.id].extras = 0;
      }

      // Always refresh both rows since either can change
      const { groups, extras } = cart[item.id];
      row.querySelector('.qty-display[data-target="groups"]').textContent = groups;
      row.querySelector('.item-subtotal[data-target="groups"]').textContent = fmt(groups * item.pricePerGroup);
      row.querySelector('.qty-display[data-target="extras"]').textContent = extras;
      row.querySelector('.item-subtotal[data-target="extras"]').textContent = fmt(extras * item.pricePerExtra);

      row.classList.toggle('has-items', groups > 0 || extras > 0);
      refreshExtrasLock();
      updateOrderSummary();
    });
  });

  return row;
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
      totalPrice += qty * item.price;
    }
  });

  const countEl = $('#summary-count');
  const totalEl = $('#summary-total');
  if (countEl) countEl.textContent = totalQty;
  if (totalEl) totalEl.textContent = fmt(totalPrice);
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
  if (field.disabled) return true; // disabled fields (e.g. time on a closed day) are exempt
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
    const date     = new Date(dateInput.value + 'T12:00:00');
    const hours    = getHoursForDate(date);
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
    const list = $('#order-item-list');
    if (list) {
      // Scroll the item list into view and briefly highlight it
      list.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      list.style.outline = '3px solid var(--color-error)';
      list.setAttribute('aria-label', 'Please select at least one donut');
      setTimeout(() => {
        list.style.outline = '';
        list.setAttribute('aria-label', 'Donut selection list');
      }, 2500);
    }
    // Insert an inline error notice above the list
    let cartError = $('#cart-error');
    if (!cartError) {
      cartError = document.createElement('p');
      cartError.id = 'cart-error';
      cartError.className = 'field-error';
      cartError.setAttribute('role', 'alert');
      cartError.style.marginBottom = 'var(--space-sm)';
      list.parentElement.insertBefore(cartError, list);
    }
    cartError.textContent = 'Please add at least one donut to your order.';
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
  const modal   = $('#confirmation-modal');
  const closeBtn = $('#modal-close');
  const doneBtn  = $('#modal-done');
  if (!modal) return;

  const close = () => {
    modal.hidden = true;
    modal.setAttribute('aria-hidden', 'true');
    // Return focus to submit button
    const submitBtn = $('#submit-order-btn');
    if (submitBtn) submitBtn.focus();
  };

  closeBtn?.addEventListener('click', close);
  doneBtn?.addEventListener('click', close);

  // Close on backdrop click
  modal.addEventListener('click', (e) => { if (e.target === modal) close(); });

  // Trap focus inside modal when open
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

  // Build summary rows
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
        subtotal = qty * item.price;
        label = `${item.name} (${item.type}) × ${qty}`;
      }
      total += subtotal;

      const row = document.createElement('div');
      row.className = 'modal-summary-row';
      row.innerHTML = `
        <span>${label}</span>
        <span>${fmt(subtotal)}</span>
      `;
      summary.appendChild(row);
    });

    // Pickup details
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

    // Total row
    const totalRow = document.createElement('div');
    totalRow.className = 'modal-summary-row total';
    totalRow.innerHTML = `<span>Order Total</span><span>${fmt(total)}</span>`;
    summary.appendChild(totalRow);
  }

  // Show modal
  modal.hidden = false;
  modal.removeAttribute('aria-hidden');

  // Focus close button
  setTimeout(() => $('#modal-close')?.focus(), 50);

  // Reset form and cart after a short delay (so user can read the modal first)
  // The actual reset happens when user clicks Done
  const doneBtn = $('#modal-done');
  if (doneBtn) {
    const originalClick = doneBtn._resetHandler;
    if (originalClick) doneBtn.removeEventListener('click', originalClick);
    const resetHandler = () => {
      form.reset();
      MENU_DATA.forEach(item => {
        cart[item.id] = item.isLetters ? { groups: 0, extras: 0 } : 0;
        const row = $(`[data-item-id="${item.id}"]`);
        if (row) {
          if (item.isLetters) {
            row.querySelectorAll('.qty-display').forEach(d => { d.textContent = '0'; });
            row.querySelectorAll('.item-subtotal').forEach(d => { d.textContent = '$0.00'; });
            const extrasRow = row.querySelector('[data-row="extras"]');
            if (extrasRow) extrasRow.classList.add('letters-row--disabled');
            row.querySelectorAll('.qty-btn[data-target="extras"]').forEach(btn => { btn.disabled = true; });
          } else {
            row.querySelector('.qty-display').textContent = '0';
            row.querySelector('.item-subtotal').textContent = '$0.00';
          }
          row.classList.remove('has-items');
        }
      });
      updateOrderSummary();
      // Reset date/time pickers and re-apply constraints
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
