import React from 'react';

export default function HomeSection({ totalQty }) {
  const ctaHref = totalQty > 0 ? '#order' : '#menu';

  return (
    <section id="home" className="section section--home" aria-labelledby="home-heading">
      <div className="section-inner">
        <img
          src="/images/donut-buff-logo.png"
          alt="Donut Buff logo"
          className="hero-logo"
        />
        <h1 id="home-heading" className="hero-title">
          <span className="brand-highlight">Donut Buff</span>
        </h1>
        <p className="hero-subtitle">
          Made from scratch using simple ingredients.
          No bioengineered/GMO ingredients. No preservatives.
        </p>
        <div className="hero-badges" aria-label="Key qualities">
          <span className="badge">
            <i className="fa-solid fa-seedling" aria-hidden="true" /> Non-GMO
          </span>
          <span className="badge">
            <i className="fa-solid fa-leaf" aria-hidden="true" /> No Preservatives
          </span>
          <span className="badge">
            <i className="fa-solid fa-wheat-awn" aria-hidden="true" /> From Scratch
          </span>
          <span className="badge">
            <i className="fa-solid fa-egg" aria-hidden="true" /> Real Ingredients
          </span>
        </div>
        <a href={ctaHref} className="btn btn--primary hero-cta" aria-label="Browse our menu">
          Order Now
        </a>
      </div>
      <div className="hero-donut-deco" aria-hidden="true">
        <div className="deco-donut deco-donut--1"><img src="/images/donut-bg.png" alt="" /></div>
        <div className="deco-donut deco-donut--2"><img src="/images/donut-bg.png" alt="" /></div>
        <div className="deco-donut deco-donut--3"><img src="/images/donut-bg.png" alt="" /></div>
        <div className="deco-donut deco-donut--4"><img src="/images/donut-bg.png" alt="" /></div>
        <div className="deco-donut deco-donut--5"><img src="/images/donut-bg.png" alt="" /></div>
      </div>
    </section>
  );
}
