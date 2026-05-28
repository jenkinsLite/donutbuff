import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo" aria-label="Donut Buff">
            <img
              src="/images/donut-buff-logo.png"
              alt="Donut Buff logo"
              className="footer-logo-img"
              width="48"
              height="48"
            />
            <span>Donut Buff</span>
          </div>
          <p className="footer-tagline">Made from scratch. Always fresh.</p>
        </div>

        <div className="footer-contact" aria-label="Contact information">
          <h3 className="footer-heading">Contact Us</h3>
          <ul className="contact-list" role="list">
            <li>
              <i className="fa-solid fa-phone" aria-hidden="true" />
              <a href="tel:+14705430577" aria-label="Call or text us at 470-543-0577">
                470-543-0577
              </a>
              <span className="contact-note">(Call or Text)</span>
            </li>
          </ul>
        </div>

        <div className="footer-social" aria-label="Social media links">
          <h3 className="footer-heading">Follow Us</h3>
          <ul className="social-list" role="list">
            <li>
              <a
                href="https://www.instagram.com/realdonutbuff"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link social-link--instagram"
                aria-label="Follow Donut Buff on Instagram (@realdonutbuff) — opens in new tab"
              >
                <i className="fa-brands fa-instagram" aria-hidden="true" />
                @realdonutbuff
              </a>
            </li>
            <li>
              <a
                href="https://www.facebook.com/donutbuff"
                target="_blank"
                rel="noopener noreferrer"
                className="social-link social-link--facebook"
                aria-label="Follow Donut Buff on Facebook (donutbuff) — opens in new tab"
              >
                <i className="fa-brands fa-facebook" aria-hidden="true" />
                donutbuff
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-legal">
        <p>&copy; {new Date().getFullYear()} Donut Buff. All rights reserved.</p>
        <p className="legal-note">
          * Made in a cottage food operation that is not subject to state food safety
          inspections. Cottage license #6247031.
        </p>
      </div>
    </footer>
  );
}
