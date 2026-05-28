import React, { useEffect, useRef } from 'react';
import { fmt } from '../utils/pricing';
import { fmt12 } from '../utils/businessHours';

export default function ConfirmationModal({ data, onClose }) {
  const closeRef = useRef(null);
  const modalRef = useRef(null);

  useEffect(() => {
    closeRef.current?.focus();
  }, []);

  // Focus trap
  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const handler = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key !== 'Tab') return;

      const focusable = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey) {
        if (document.activeElement === first) { e.preventDefault(); last.focus(); }
      } else {
        if (document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    modal.addEventListener('keydown', handler);
    return () => modal.removeEventListener('keydown', handler);
  }, [onClose]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="modal-overlay"
      id="confirmation-modal"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-body"
      onClick={handleOverlayClick}
    >
      <div className="modal" ref={modalRef}>
        <button
          className="modal-close"
          id="modal-close"
          ref={closeRef}
          aria-label="Close confirmation"
          onClick={onClose}
        >
          <i className="fa-solid fa-xmark" aria-hidden="true" />
        </button>
        <div className="modal-icon" aria-hidden="true">
          <i className="fa-solid fa-circle-check" />
        </div>
        <h2 className="modal-title" id="modal-title">Order Received!</h2>
        <div className="modal-body" id="modal-body">
          <p>Thank you! Your order has been submitted successfully.</p>
          <p>We'll reach out shortly to confirm your pickup details.</p>
          {data && (
            <div className="modal-summary" aria-label="Your order summary">
              {data.items?.map((item) => (
                <div className="modal-summary-row" key={item.id}>
                  <span>
                    {item.label
                      ? `${item.name} — ${item.label}`
                      : item.message
                      ? `${item.name} — "${item.message}" (${item.qty} letters)`
                      : `${item.name} (${item.type}) × ${item.qty}`}
                  </span>
                  <span>{fmt(item.subtotal)}</span>
                </div>
              ))}
              {(data.pickup?.date || data.pickup?.time) && (
                <>
                  <div style={{ borderTop: '1px solid var(--color-border)', margin: '6px 0' }} />
                  <div className="modal-summary-row">
                    <span>Pickup</span>
                    <span>
                      {data.pickup.date || ''}{' '}
                      {data.pickup.time ? fmt12(data.pickup.time) : ''}
                    </span>
                  </div>
                </>
              )}
              {data.orderId && (
                <div className="modal-summary-row">
                  <span>Order #</span>
                  <span>{data.orderId}</span>
                </div>
              )}
              <div className="modal-summary-row total">
                <span>Order Total</span>
                <span>{fmt(data.total || 0)}</span>
              </div>
            </div>
          )}
        </div>
        <button
          className="btn btn--primary modal-done"
          id="modal-done"
          aria-label="Close and return to the page"
          onClick={onClose}
        >
          Done
        </button>
      </div>
    </div>
  );
}
