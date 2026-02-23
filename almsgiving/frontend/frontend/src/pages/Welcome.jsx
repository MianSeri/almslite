import { Link } from "react-router-dom";
import "./Welcome.css";

export default function Welcome() {
  const hasToken = Boolean(localStorage.getItem("token"));

  return (
    <main className="welcome">
      <section className="welcome-hero">
        <div className="welcome-hero__content">
          <p className="welcome-kicker">AlmsGiving Lite</p>

          <h1 className="welcome-title">
            A clean, secure way to support causes you care about.
          </h1>

          <p className="welcome-subtitle">
            Discover verified nonprofit campaigns, donate in minutes, and see impact with
            transparent updates.
          </p>

          <div className="welcome-actions">
            {/* Trust CTA (teal) */}
            <Link className="btn btn--primary" to="/campaigns">
              Browse campaigns
            </Link>

            {/* Donation CTA (rose/coral) */}
            <Link className="btn btn--donate" to="/campaigns">
              Donate now
            </Link>

            {/* Optional nonprofit CTA */}
            <Link
              className="btn btn--ghost"
              to={hasToken ? "/dashboard" : "/nonprofit/register"}
            >
              {hasToken ? "Go to dashboard" : "Start a campaign"}
            </Link>
          </div>

          <div className="welcome-meta">
            <span className="badge">Stripe payments</span>
            <span className="badge">Receipts</span>
            <span className="badge">Campaign tracking</span>
          </div>
        </div>

        <div className="welcome-hero__panel" aria-hidden="true">
          <div className="panel-card">
            <div className="panel-row">
              <div className="dot" />
              <div className="panel-lines">
                <div className="line line--lg" />
                <div className="line" />
              </div>
            </div>

            <div className="panel-stats">
              <div className="stat">
                <p className="stat-label">Today’s impact</p>
                <p className="stat-value">$2,450</p>
              </div>
              <div className="stat">
                <p className="stat-label">Recurring donors</p>
                <p className="stat-value">128</p>
              </div>
            </div>

            <div className="panel-progress">
              <div className="progress-top">
                <span className="progress-label">Education Fund</span>
                <span className="progress-value">68%</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" />
              </div>

              <button className="mini-cta" type="button">
                Make a donation
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="welcome-features">
        <h2 className="section-title">Built for trust, made for generosity</h2>

        <div className="feature-grid">
          <article className="feature-card">
            <h3>Secure checkout</h3>
            <p>
              Payments run through Stripe. Donation status is confirmed safely before totals update.
            </p>
          </article>

          <article className="feature-card">
            <h3>Verified nonprofits</h3>
            <p>
              Nonprofits register and manage campaigns through protected dashboards and review steps.
            </p>
          </article>

          <article className="feature-card">
            <h3>Transparent progress</h3>
            <p>
              Track campaign totals and see where your support is going—clearly and consistently.
            </p>
          </article>
        </div>
      </section>

      <section className="welcome-footer-cta">
        <div className="footer-cta">
          <div>
            <h2 className="footer-title">Ready to make an impact?</h2>
            <p className="footer-subtitle">
              Explore campaigns and support one today — one-time or recurring.
            </p>
          </div>

          <div className="footer-actions">
            <Link className="btn btn--donate" to="/campaigns">
              Find a campaign
            </Link>
            <Link className="btn btn--ghost" to="/nonprofit/login">
              Nonprofit login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}