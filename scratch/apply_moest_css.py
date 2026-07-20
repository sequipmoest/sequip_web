with open("style.css", "r", encoding="utf-8") as f:
    css = f.read()

moest_css = """

/* ==========================================================================
   OFFICIAL MINISTRY OF EDUCATION (MoEST) BRANDING & STYLING
   ========================================================================== */

/* National Colors Stripe Bar */
.national-stripe-bar {
  display: flex;
  height: 6px;
  width: 100%;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  overflow: hidden;
}

.national-stripe-bar .stripe {
  flex: 1;
  height: 100%;
}

.stripe.green { background-color: #00A859; }
.stripe.gold { background-color: #FCD116; }
.stripe.black { background-color: #0f172a; }
.stripe.blue { background-color: #00A3E0; }

/* Official Header Typography & Coat of Arms Logo */
.brand {
  display: flex;
  align-items: center;
  gap: 16px;
}

.brand-crest {
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-secondary);
  padding: 6px;
  border-radius: 50%;
  border: 1px solid var(--border-card);
  box-shadow: var(--shadow-sm);
}

.coat-of-arms-svg {
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.gov-sub-title {
  font-family: var(--font-title);
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 1.2px;
  color: var(--accent-gold);
  text-transform: uppercase;
}

.gov-main-title {
  font-family: var(--font-title);
  font-size: 0.85rem;
  font-weight: 800;
  letter-spacing: 0.5px;
  color: var(--text-primary);
  text-transform: uppercase;
  margin-top: 1px;
}

.project-app-title {
  font-family: var(--font-title);
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--accent-green);
  margin-top: 2px;
}


/* ==========================================================================
   OFFICIAL ABOUT PAGE STYLING (MoEST Structured Components)
   ========================================================================== */

.about-hero-banner {
  background: linear-gradient(135deg, rgba(31, 78, 91, 0.12) 0%, rgba(0, 168, 89, 0.08) 100%);
  border-left: 5px solid var(--accent-green);
  padding: 24px 28px;
}

.about-banner-badge {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 800;
  letter-spacing: 0.8px;
  text-transform: uppercase;
  color: var(--accent-green);
  background: rgba(0, 230, 118, 0.12);
  padding: 3px 10px;
  border-radius: 12px;
  margin-bottom: 10px;
}

.about-hero-title {
  font-family: var(--font-title);
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-bottom: 10px;
}

.about-hero-lead {
  font-size: 0.95rem;
  color: var(--text-secondary);
  line-height: 1.65;
}

/* PDO Grid */
.pdo-content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin-top: 16px;
}

.pdo-box {
  background: var(--bg-secondary);
  border: 1px solid var(--border-card);
  border-radius: 12px;
  padding: 20px;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.pdo-box:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.pdo-icon {
  font-size: 1.8rem;
  margin-bottom: 10px;
}

.pdo-box h3 {
  font-family: var(--font-title);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.pdo-box p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.55;
}

/* 4 Core Components Grid */
.components-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 20px;
  margin-top: 16px;
}

.component-card {
  background: var(--bg-secondary);
  border: 1px solid var(--border-card);
  border-radius: 12px;
  padding: 22px;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.comp-badge {
  align-self: flex-start;
  font-size: 0.72rem;
  font-weight: 800;
  padding: 4px 10px;
  border-radius: 12px;
  margin-bottom: 12px;
  text-transform: uppercase;
}

.badge-green { background: rgba(0, 230, 118, 0.12); color: #00A859; }
.badge-blue { background: rgba(0, 229, 255, 0.12); color: #0284c7; }
.badge-gold { background: rgba(255, 179, 0, 0.12); color: #d97706; }
.badge-purple { background: rgba(224, 64, 251, 0.12); color: #9333ea; }

.component-card h3 {
  font-family: var(--font-title);
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 10px;
  line-height: 1.35;
}

.component-card p {
  font-size: 0.88rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* Governance Grid */
.governance-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 18px;
  margin-top: 16px;
}

.agency-box {
  background: var(--bg-secondary);
  border: 1px solid var(--border-card);
  border-radius: 12px;
  padding: 20px;
}

.agency-tag {
  font-size: 0.7rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--accent-gold);
  letter-spacing: 0.6px;
}

.agency-header h4 {
  font-family: var(--font-title);
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: 4px;
  margin-bottom: 10px;
}

.agency-box p {
  font-size: 0.85rem;
  color: var(--text-secondary);
  line-height: 1.55;
}


/* ==========================================================================
   OFFICIAL MINISTRY FOOTER STYLING
   ========================================================================== */

.app-footer {
  margin-top: 40px;
  background: var(--bg-secondary);
  border-top: 1px solid var(--border-card);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: var(--shadow-sm);
}

.footer-stripe {
  display: flex;
  height: 4px;
  width: 100%;
}

.footer-stripe .stripe {
  flex: 1;
  height: 100%;
}

.footer-content {
  display: grid;
  grid-template-columns: 2fr 1.5fr 1.5fr;
  gap: 32px;
  padding: 32px 36px;
}

@media (max-width: 992px) {
  .footer-content {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 24px;
  }
}

.footer-brand-header {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 14px;
}

.footer-gov-sub {
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 1px;
  color: var(--accent-gold);
}

.footer-gov-title {
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--text-primary);
}

.footer-desc {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.footer-col h4 {
  font-family: var(--font-title);
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--accent-green);
  margin-bottom: 14px;
  border-bottom: 2px solid rgba(0, 230, 118, 0.15);
  padding-bottom: 6px;
  display: inline-block;
}

.contact-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.contact-list li {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.45;
}

.contact-list svg {
  flex-shrink: 0;
  color: var(--accent-gold);
  margin-top: 2px;
}

.footer-links {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.footer-links a {
  font-size: 0.82rem;
  color: var(--text-secondary);
  text-decoration: none;
  transition: color 0.2s ease, padding-left 0.2s ease;
}

.footer-links a:hover {
  color: var(--accent-green);
  padding-left: 4px;
}

.footer-bottom {
  background: rgba(0, 0, 0, 0.04);
  border-top: 1px solid var(--border-card);
  padding: 16px 36px;
  text-align: center;
  font-size: 0.78rem;
  color: var(--text-secondary);
}

[data-theme="dark"] .footer-bottom {
  background: rgba(0, 0, 0, 0.25);
}
"""

if "OFFICIAL MINISTRY OF EDUCATION" not in css:
    css += moest_css
    with open("style.css", "w", encoding="utf-8") as f:
        f.write(css)
    print("Success: Appended MoEST branding and footer styles to style.css.")
else:
    print("MoEST CSS styles already exist in style.css.")
