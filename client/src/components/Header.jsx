import React, { useState, useEffect, useRef } from 'react';

export default function Header() {
  const [navOpen, setNavOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const navRef = useRef(null);
  const hamburgerRef = useRef(null);

  // Active nav link on scroll
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, []);

  // Close nav on outside click
  useEffect(() => {
    const handler = (e) => {
      if (
        navRef.current &&
        hamburgerRef.current &&
        !navRef.current.contains(e.target) &&
        !hamburgerRef.current.contains(e.target)
      ) {
        setNavOpen(false);
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const closeNav = () => setNavOpen(false);

  const handleNavClick = (e, sectionId) => {
    e.preventDefault();
    setNavOpen(false);

    const target = document.getElementById(sectionId);
    if (!target) return;

    const offset = parseInt(getComputedStyle(document.documentElement).scrollPaddingTop) || 88;

    // Only subtract nav height on mobile (hamburger visible) where the nav
    // collapses and shifts the page layout as it closes. At 900px+ the nav
    // is always visible in the header row so no correction is needed.
    const isMobileNav = hamburgerRef.current &&
      getComputedStyle(hamburgerRef.current).display !== 'none';
    const navEl = navRef.current;
    const navHeight = isMobileNav && navEl && navEl.offsetHeight > 0
      ? navEl.scrollHeight : 0;

    const top = target.getBoundingClientRect().top + window.scrollY - navHeight - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
  };

  return (
    <header className="site-header" role="banner">
      <div className="header-row">
      <div className="header-inner">
        <div className="brand">
          <div className="logo-wrap">
            <img
              src="/images/donut-buff-logo.png"
              alt="Donut Buff logo"
              className="logo-img"
              width="64"
              height="64"
            />
          </div>
          <div className="brand-text">
            <span className="brand-name">Donut Buff</span>
            <p className="tagline">Made from scratch using simple ingredients.</p>
            <p className="tagline">No bioengineered/GMO ingredients. No preservatives.</p>
          </div>
        </div>

        <button
          ref={hamburgerRef}
          className="hamburger"
          id="hamburger"
          aria-label={navOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-controls="main-nav"
          aria-expanded={navOpen}
          onClick={() => setNavOpen((v) => !v)}
        >
          <span className="bar" aria-hidden="true" />
          <span className="bar" aria-hidden="true" />
          <span className="bar" aria-hidden="true" />
        </button>
      </div>

      <nav
        ref={navRef}
        id="main-nav"
        className={`main-nav${navOpen ? ' open' : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <ul role="list">
          {['home', 'menu', 'order'].map((id) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={`nav-link${activeSection === id ? ' active' : ''}`}
                aria-current={activeSection === id ? 'true' : 'false'}
                aria-label={`Go to ${id.charAt(0).toUpperCase() + id.slice(1)} section`}
                onClick={(e) => handleNavClick(e, id)}
              >
                {id.charAt(0).toUpperCase() + id.slice(1)}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      </div>
    </header>
  );
}
