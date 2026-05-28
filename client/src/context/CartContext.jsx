import React, { createContext, useContext, useState, useCallback } from 'react';
import { MENU_DATA, assortedEligibleItems } from '../data/menuData';
import { calcItemTotal, calcLettersTotal, calcCartTotals } from '../utils/pricing';

const CartContext = createContext(null);

const initCart = () => {
  const cart = {};
  MENU_DATA.forEach((item) => {
    if (item.isLetters) {
      cart[item.id] = { message: '' };
    } else if (item.isAssorted) {
      cart[item.id] = {};
      assortedEligibleItems().forEach((sub) => { cart[item.id][sub.id] = 0; });
    } else {
      cart[item.id] = 0;
    }
  });
  return cart;
};

export function CartProvider({ children }) {
  const [cart, setCart] = useState(initCart);

  // ── Regular item ──────────────────────────────────────────────────────────
  const setRegularQty = useCallback((itemId, delta) => {
    setCart((prev) => {
      const qty = Math.max(0, (prev[itemId] || 0) + delta);
      return { ...prev, [itemId]: qty };
    });
  }, []);

  const deleteRegular = useCallback((itemId) => {
    setCart((prev) => ({ ...prev, [itemId]: 0 }));
  }, []);

  const setRegularQtyDirect = useCallback((itemId, qty) => {
    setCart((prev) => ({ ...prev, [itemId]: Math.max(0, qty) }));
  }, []);

  // ── Letters item ──────────────────────────────────────────────────────────
  const setLettersMessage = useCallback((itemId, message) => {
    const filtered = message.toUpperCase().replace(/[^A-Z0-9 ]/g, '');
    setCart((prev) => ({ ...prev, [itemId]: { message: filtered } }));
  }, []);

  const clearLetters = useCallback((itemId) => {
    setCart((prev) => ({ ...prev, [itemId]: { message: '' } }));
  }, []);

  // ── Assorted item ─────────────────────────────────────────────────────────
  const setAssortedSubQty = useCallback((boxId, subId, delta) => {
    setCart((prev) => {
      const box = { ...prev[boxId] };
      box[subId] = Math.max(0, (box[subId] || 0) + delta);
      return { ...prev, [boxId]: box };
    });
  }, []);

  const deleteAssortedSub = useCallback((boxId, subId) => {
    setCart((prev) => {
      const box = { ...prev[boxId], [subId]: 0 };
      return { ...prev, [boxId]: box };
    });
  }, []);

  const clearAssorted = useCallback((boxId) => {
    setCart((prev) => {
      const box = { ...prev[boxId] };
      Object.keys(box).forEach((k) => { box[k] = 0; });
      return { ...prev, [boxId]: box };
    });
  }, []);

  // ── Full cart reset ───────────────────────────────────────────────────────
  const clearCart = useCallback(() => {
    setCart(initCart());
  }, []);

  // ── Derived helpers (read-only, not stored in state) ─────────────────────
  const getRegularQty = (itemId) => cart[itemId] || 0;

  const getLettersMessage = (itemId) => cart[itemId]?.message || '';

  const getLettersCount = (itemId) => (cart[itemId]?.message || '').replace(/\s/g, '').length;

  const getAssortedSubQty = (boxId, subId) => (cart[boxId] || {})[subId] || 0;

  const getAssortedTotal = (boxId) =>
    Object.values(cart[boxId] || {}).reduce((a, b) => a + b, 0);

  const isItemOrdered = (item) => {
    if (item.isAssorted) return getAssortedTotal(item.id) > 0;
    if (item.isLetters) return getLettersCount(item.id) > 0;
    return (cart[item.id] || 0) > 0;
  };

  const getItemSubtotal = (item) => {
    if (item.isAssorted) {
      const total = getAssortedTotal(item.id);
      return Math.floor(total / 12) * item.dozen;
    }
    if (item.isLetters) return calcLettersTotal(item, getLettersMessage(item.id));
    return calcItemTotal(item, getRegularQty(item.id));
  };

  const getCartTotals = () => calcCartTotals(cart, MENU_DATA);

  const getAssortedCheckoutLabel = (item) => {
    const total = getAssortedTotal(item.id);
    const dozens = Math.floor(total / 12);
    const parts = Object.entries(cart[item.id] || {})
      .filter(([, qty]) => qty > 0)
      .map(([id, qty]) => {
        const sub = MENU_DATA.find((m) => m.id === id);
        return sub ? `${sub.name} ×${qty}` : '';
      })
      .filter(Boolean);
    return `${dozens} dozen (${total} total): ${parts.join(', ')}`;
  };

  const value = {
    cart,
    // mutators
    setRegularQty,
    deleteRegular,
    setRegularQtyDirect,
    setLettersMessage,
    clearLetters,
    setAssortedSubQty,
    deleteAssortedSub,
    clearAssorted,
    clearCart,
    // readers
    getRegularQty,
    getLettersMessage,
    getLettersCount,
    getAssortedSubQty,
    getAssortedTotal,
    isItemOrdered,
    getItemSubtotal,
    getCartTotals,
    getAssortedCheckoutLabel,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
