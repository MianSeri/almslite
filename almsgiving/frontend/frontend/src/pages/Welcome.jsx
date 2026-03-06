import { Link } from "react-router-dom";
import "./Welcome.css";

export default function Welcome() {
  const hasToken = Boolean(localStorage.getItem("token"));

  return (
    <main className="welcome">
      {/* HERO (Nonprofit-first) */}
      <section className="welcome-hero welcome-hero--nonprofit">
        <div className="welcome-hero__content">
          <p className="welcome-kicker">
            {hasToken ? "Welcome back" : "Nonprofit onboarding"}
          </p>

          <h1 className="welcome-title">
            {hasToken ? "Build your next impact." : "Launch campaigns with clarity and trust."}
          </h1>

          <p className="welcome-subtitle">
            {hasToken
              ? "Create campaigns, track donations, and share a page that donors trust - without the chaos."
              : "Create a verified profile, publish your first campaign, and start collecting donations securely."}
          </p>

          <div className="welcome-actions">
            {/* Primary (teal / system) */}
            <Link
              className="btn btn--primary"
              to={hasToken ? "/dashboard" : "/nonprofit/register"}
            >
              {hasToken ? "Open dashboard" : "Create nonprofit account"}
            </Link>

            {/* Secondary */}
            <Link className="btn btn--ghost" to="/campaigns">
              Preview public campaigns
            </Link>

            {/* Tertiary (quiet link style button) */}
            <Link className="btn btn--link" to={hasToken ? "/campaigns/new" : "/nonprofit/login"}>
              {hasToken ? "Create a campaign" : "Already have an account? Log in"}
            </Link>
          </div>

          <div className="welcome-meta">
            <span className="badge">Stripe-powered checkout</span>
            <span className="badge">Receipts & records</span>
            <span className="badge">Real-time totals</span>
          </div>
        </div>

        {/* Right panel = nonprofit workspace preview */}
        <div className="welcome-hero__panel" aria-hidden="true">
          <div className="panel-card panel-card--workspace">
            <div className="panel-row">
              <div className="dot" />
              <div className="panel-lines">
                <div className="line line--lg" />
                <div className="line" />
              </div>
              <span className="panel-chip">Workspace</span>
            </div>

            <div className="panel-stats">
              <div className="stat">
                <p className="stat-label">Donations (30 days)</p>
                <p className="stat-value">$12,480</p>
                <p className="stat-sub">132 donors</p>
              </div>
              <div className="stat">
                <p className="stat-label">Active campaigns</p>
                <p className="stat-value">3</p>
                <p className="stat-sub">1 draft</p>
              </div>
            </div>

            <div className="panel-progress">
              <div className="progress-top">
                <span className="progress-label">Next milestone</span>
                <span className="progress-value">68%</span>
              </div>

              <div className="progress-bar">
                <div className="progress-fill" />
              </div>

              <div className="panel-todos">
                <div className="todo">
                  <span className="todo-dot" />
                  <span className="todo-text">Finish campaign story</span>
                  <span className="todo-tag">Draft</span>
                </div>
                <div className="todo">
                  <span className="todo-dot" />
                  <span className="todo-text">Add cover image</span>
                  <span className="todo-tag">Recommended</span>
                </div>
                <div className="todo">
                  <span className="todo-dot" />
                  <span className="todo-text">Share campaign link</span>
                  <span className="todo-tag">Ready</span>
                </div>
              </div>

              <button className="mini-cta mini-cta--teal" type="button">
                Create campaign
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Keep the rest as-is for now */}
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
              Create a campaign in minutes and share a page donors trust.
            </p>
          </div>

          <div className="footer-actions">
            <Link className="btn btn--primary" to="/campaigns/new">
              Create a campaign
            </Link>
            <Link className="btn btn--ghost" to="/dashboard">
              Open dashboard
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}