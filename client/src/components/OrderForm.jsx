import React, { useState, useEffect, useRef } from 'react';
import flatpickr from 'flatpickr';
import { useCart } from '../context/CartContext';
import { MENU_DATA } from '../data/menuData';
import { BUSINESS_CONFIG } from '../data/menuData';
import { getHoursForDate, fmt12 } from '../utils/businessHours';
import { calcItemTotal, calcLettersTotal, fmt } from '../utils/pricing';

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone = (v) => /^[\d\s\-().+]{7,}$/.test(v);

const EMPTY_FORM = { name: '', phone: '', email: '', date: '', time: '', notes: '' };
const EMPTY_ERRORS = { name: '', phone: '', email: '', date: '', time: '' };

export default function OrderForm({ onOrderSubmitted }) {
  const {
    getRegularQty, getLettersMessage, getLettersCount, getAssortedTotal,
    getAssortedSubQty, getItemSubtotal, getAssortedCheckoutLabel, getCartTotals,
  } = useCart();

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [cartError, setCartError] = useState('');
  const [lettersErrors, setLettersErrors] = useState({});
  const [assortedError, setAssortedError] = useState('');

  const dateInputRef = useRef(null);
  const timeInputRef = useRef(null);
  const datePickerRef = useRef(null);
  const timePickerRef = useRef(null);

  // ── Flatpickr init ──────────────────────────────────────────────────────────
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];

    datePickerRef.current = flatpickr(dateInputRef.current, {
      minDate: 'today',
      dateFormat: 'Y-m-d',
      disable: [(date) => getHoursForDate(date, BUSINESS_CONFIG) === null],
      onChange: ([selectedDate]) => {
        const val = selectedDate ? selectedDate.toISOString().split('T')[0] : '';
        setForm((prev) => ({ ...prev, date: val, time: '' }));
        if (timePickerRef.current) timePickerRef.current.clear();
        applyTimeConstraints(val);
      },
    });
    datePickerRef.current.setDate(today, false);
    setForm((prev) => ({ ...prev, date: today }));

    timePickerRef.current = flatpickr(timeInputRef.current, {
      enableTime: true,
      noCalendar: true,
      dateFormat: 'H:i',
      altInput: true,
      altFormat: 'h:i K',
      time_24hr: false,
      minuteIncrement: 5,
      onChange: ([selectedDate]) => {
        if (!selectedDate) return;
        const h = String(selectedDate.getHours()).padStart(2, '0');
        const m = String(selectedDate.getMinutes()).padStart(2, '0');
        setForm((prev) => ({ ...prev, time: `${h}:${m}` }));
      },
    });

    applyTimeConstraints(today);

    return () => {
      datePickerRef.current?.destroy();
      timePickerRef.current?.destroy();
    };
  }, []);

  const applyTimeConstraints = (dateStr) => {
    if (!dateStr || !timePickerRef.current) return;
    const date = new Date(dateStr + 'T12:00:00');
    const hours = getHoursForDate(date, BUSINESS_CONFIG);

    if (hours === null) {
      timePickerRef.current.clear();
      if (timeInputRef.current) timeInputRef.current.disabled = true;
      const alt = timePickerRef.current.altInput;
      if (alt) alt.disabled = true;
      setErrors((prev) => ({ ...prev, date: "Sorry, we're closed on this date. Please choose another day." }));
    } else {
      const today = new Date();
      const isToday = date.toDateString() === today.toDateString();
      let minTime = hours[0];
      if (isToday) {
        let h = today.getHours();
        let m = Math.floor(today.getMinutes() / 5) * 5 + 5;
        if (m >= 60) { m -= 60; h += 1; }
        const nowStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        if (nowStr > hours[0]) minTime = nowStr;
      }
      timePickerRef.current.set('minTime', minTime);
      timePickerRef.current.set('maxTime', hours[1]);
      if (timeInputRef.current) timeInputRef.current.disabled = false;
      const alt = timePickerRef.current.altInput;
      if (alt) alt.disabled = false;
      setErrors((prev) => ({ ...prev, date: '' }));
    }
  };

  // ── Field validation ────────────────────────────────────────────────────────
  const validateField = (name, value) => {
    if (name === 'name' && !value.trim()) return 'This field is required.';
    if (name === 'phone') {
      if (!value.trim()) return 'This field is required.';
      if (!isValidPhone(value)) return 'Please enter a valid phone number.';
    }
    if (name === 'email') {
      if (!value.trim()) return 'This field is required.';
      if (!isValidEmail(value)) return 'Please enter a valid email address.';
    }
    if (name === 'date' && !value) return 'This field is required.';
    if (name === 'time' && !value) return 'This field is required.';
    return '';
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({ ...prev, [name]: validateField(name, value) }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // ── Full form validation ────────────────────────────────────────────────────
  const validateAll = () => {
    const newErrors = { ...EMPTY_ERRORS };
    let valid = true;

    ['name', 'phone', 'email', 'date', 'time'].forEach((f) => {
      const msg = validateField(f, form[f]);
      if (msg) { newErrors[f] = msg; valid = false; }
    });

    // Business hours check
    if (form.date) {
      const date = new Date(form.date + 'T12:00:00');
      const hours = getHoursForDate(date, BUSINESS_CONFIG);
      if (hours === null) {
        newErrors.date = "Sorry, we're closed on this date. Please choose another day.";
        valid = false;
      } else if (form.time && (form.time < hours[0] || form.time > hours[1])) {
        newErrors.time = `We're open ${fmt12(hours[0])} – ${fmt12(hours[1])} on this day.`;
        valid = false;
      }
    }

    setErrors(newErrors);

    // Letters validation
    const newLettersErrors = {};
    MENU_DATA.forEach((item) => {
      if (!item.isLetters) return;
      const count = getLettersCount(item.id);
      if (count === 0) return;
      if (count < item.groupSize) {
        newLettersErrors[item.id] = `${item.name}: Please enter at least ${item.groupSize} letters (you have ${count}).`;
        valid = false;
      }
    });
    setLettersErrors(newLettersErrors);

    // Assorted validation
    let newAssortedError = '';
    MENU_DATA.forEach((item) => {
      if (!item.isAssorted) return;
      const total = getAssortedTotal(item.id);
      if (total === 0) return;
      const remaining = total % 12;
      if (total < 12 || remaining !== 0) {
        const need = remaining === 0 ? 0 : 12 - remaining;
        newAssortedError = total < 12
          ? `Build Your Box: You have ${total} selected. Please select at least 12 to make a dozen.`
          : `Build Your Box: You have ${total} selected. Please add ${need} more to complete the next dozen.`;
        valid = false;
      }
    });
    setAssortedError(newAssortedError);

    // Cart empty check
    const { totalQty } = getCartTotals();
    if (totalQty === 0) {
      setCartError('Please add at least one donut to your order.');
      valid = false;
    } else {
      setCartError('');
    }

    return valid;
  };

  // ── Build order payload ─────────────────────────────────────────────────────
  const buildOrderPayload = () => {
    const items = [];
    MENU_DATA.forEach((item) => {
      if (item.isAssorted) {
        const total = getAssortedTotal(item.id);
        if (total === 0) return;
        items.push({
          id: item.id,
          name: item.name,
          type: item.type,
          qty: total,
          subtotal: Math.floor(total / 12) * item.dozen,
          label: getAssortedCheckoutLabel(item),
        });
      } else if (item.isLetters) {
        const message = getLettersMessage(item.id);
        const count = getLettersCount(item.id);
        if (count === 0) return;
        items.push({
          id: item.id,
          name: item.name,
          type: item.type,
          message,
          qty: count,
          subtotal: getItemSubtotal(item),
        });
      } else {
        const qty = getRegularQty(item.id);
        if (qty === 0) return;
        items.push({
          id: item.id,
          name: item.name,
          type: item.type,
          qty,
          subtotal: getItemSubtotal(item),
        });
      }
    });

    const { totalPrice } = getCartTotals();
    return {
      customer: {
        name: form.name,
        phone: form.phone,
        email: form.email,
      },
      pickup: {
        date: form.date,
        time: form.time,
      },
      notes: form.notes,
      items,
      total: totalPrice,
    };
  };

  // ── Submit handlers ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateAll()) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = buildOrderPayload();
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Order submission failed');
      const data = await res.json();
      onOrderSubmitted({ ...payload, orderId: data.orderId });
    } catch (err) {
      setSubmitError('There was a problem submitting your order. Please try again or call us.');
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayNow = async () => {
    if (!validateAll()) return;

    setSubmitting(true);
    setSubmitError('');
    try {
      const payload = buildOrderPayload();
      const res = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Could not create checkout session');
      const { url } = await res.json();
      window.location.href = url;
    } catch (err) {
      setSubmitError('There was a problem starting payment. Please try again or call us.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form id="order-form" className="order-form" noValidate aria-label="Order form" onSubmit={handleSubmit}>
      <fieldset className="form-fieldset">
        <legend className="form-legend">Your Information</legend>

        <div className="form-group">
          <label htmlFor="customer-name">Full Name <span aria-hidden="true" className="required">*</span></label>
          <input
            type="text"
            id="customer-name"
            name="name"
            autoComplete="name"
            placeholder="Jane Smith"
            required
            aria-required="true"
            aria-describedby="name-error"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.name ? 'input-error' : ''}
            aria-invalid={!!errors.name}
          />
          <span className="field-error" id="name-error" role="alert" aria-live="polite">
            {errors.name}
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="customer-phone">Phone Number <span aria-hidden="true" className="required">*</span></label>
          <input
            type="tel"
            id="customer-phone"
            name="phone"
            autoComplete="tel"
            placeholder="(555) 555-5555"
            required
            aria-required="true"
            aria-describedby="phone-error"
            value={form.phone}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.phone ? 'input-error' : ''}
            aria-invalid={!!errors.phone}
          />
          <span className="field-error" id="phone-error" role="alert" aria-live="polite">
            {errors.phone}
          </span>
        </div>

        <div className="form-group">
          <label htmlFor="customer-email">Email Address <span aria-hidden="true" className="required">*</span></label>
          <input
            type="email"
            id="customer-email"
            name="email"
            autoComplete="email"
            placeholder="jane@example.com"
            required
            aria-required="true"
            aria-describedby="email-error"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            className={errors.email ? 'input-error' : ''}
            aria-invalid={!!errors.email}
          />
          <span className="field-error" id="email-error" role="alert" aria-live="polite">
            {errors.email}
          </span>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="order-date">Pickup Date <span aria-hidden="true" className="required">*</span></label>
            <input
              type="text"
              id="order-date"
              name="date"
              ref={dateInputRef}
              required
              aria-required="true"
              aria-describedby="date-error"
              className={errors.date ? 'input-error' : ''}
              aria-invalid={!!errors.date}
              readOnly
            />
            <span className="field-error" id="date-error" role="alert" aria-live="polite">
              {errors.date}
            </span>
          </div>

          <div className="form-group">
            <label htmlFor="order-time">Pickup Time <span aria-hidden="true" className="required">*</span></label>
            <input
              type="text"
              id="order-time"
              name="time"
              ref={timeInputRef}
              required
              aria-required="true"
              aria-describedby="time-error"
              placeholder="Select a time"
              readOnly
              className={errors.time ? 'input-error' : ''}
              aria-invalid={!!errors.time}
            />
            <span className="field-error" id="time-error" role="alert" aria-live="polite">
              {errors.time}
            </span>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="order-notes">Special Requests / Notes</label>
          <textarea
            id="order-notes"
            name="notes"
            rows={3}
            placeholder="Any allergies, special requests, or notes..."
            aria-label="Special requests or notes"
            value={form.notes}
            onChange={handleChange}
          />
        </div>
      </fieldset>

      {/* Validation error messages */}
      {Object.values(lettersErrors).map((msg) => (
        <p key={msg} className="field-error" role="alert" style={{ marginBottom: 'var(--space-sm)' }}>{msg}</p>
      ))}
      {assortedError && (
        <p className="field-error" role="alert" style={{ marginBottom: 'var(--space-sm)' }}>{assortedError}</p>
      )}
      {cartError && (
        <p className="field-error" role="alert" style={{ marginBottom: 'var(--space-sm)' }}>{cartError}</p>
      )}
      {submitError && (
        <p className="field-error" role="alert" style={{ marginBottom: 'var(--space-sm)' }}>{submitError}</p>
      )}

      <div className="form-actions">
        <button
          type="button"
          className="btn btn--secondary"
          aria-label="Proceed to payment via Stripe"
          disabled={submitting}
          onClick={handlePayNow}
        >
          <i className="fa-solid fa-credit-card" aria-hidden="true" />
          Pay Now
        </button>
        <button
          type="submit"
          className="btn btn--primary"
          id="submit-order-btn"
          aria-label="Submit your order"
          disabled={submitting}
        >
          <i className="fa-solid fa-paper-plane" aria-hidden="true" />
          {submitting ? 'Submitting…' : 'Submit Order'}
        </button>
      </div>
    </form>
  );
}
