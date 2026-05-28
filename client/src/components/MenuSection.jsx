import React, { useMemo } from 'react';
import { MENU_DATA } from '../data/menuData';
import MenuCard from './MenuCard';

const getCategories = () => {
  const seen = new Set();
  const cats = ['All'];
  MENU_DATA.forEach((item) => {
    if (!seen.has(item.type)) {
      seen.add(item.type);
      cats.push(`${item.type} Donuts`);
    }
  });
  return cats;
};

export default function MenuSection({ currentCategory, setCurrentCategory, onCheckout }) {
  const categories = useMemo(getCategories, []);

  const items = useMemo(
    () =>
      currentCategory === 'All'
        ? MENU_DATA
        : MENU_DATA.filter((item) => currentCategory.startsWith(item.type)),
    [currentCategory]
  );

  return (
    <section id="menu" className="section section--menu" aria-labelledby="menu-heading">
      <div className="section-inner">
        <h2 id="menu-heading" className="section-title">Our Menu</h2>
        <p className="section-subtitle">
          Tap <strong>View Ingredients</strong> to see what's inside, or tap{' '}
          <strong>Order</strong> to add items to your cart.
        </p>

        <div className="menu-tabs" role="tablist" aria-label="Donut categories">
          {categories.map((cat, i) => (
            <button
              key={cat}
              className="tab-btn"
              role="tab"
              aria-selected={currentCategory === cat || (i === 0 && currentCategory === 'All')}
              aria-label={`Show ${cat}`}
              onClick={() => setCurrentCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="menu-grid" id="menu-grid" aria-live="polite">
          {items.map((item) => (
            <MenuCard key={item.id} item={item} onCheckout={onCheckout} />
          ))}
        </div>

        <aside className="cottage-notice" role="note" aria-label="Cottage food operation notice">
          <p>
            <span className="notice-asterisk">*</span>
            MADE IN A COTTAGE FOOD OPERATION THAT IS NOT SUBJECT TO STATE FOOD SAFETY INSPECTIONS.
          </p>
          <p>
            Cottage license number: <strong>6247031</strong>
          </p>
        </aside>
      </div>
    </section>
  );
}
