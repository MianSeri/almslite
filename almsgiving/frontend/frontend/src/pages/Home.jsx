import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getCampaigns } from "../api/campaigns";
import "./Home.css";
import { resolveImageUrl } from "../utils/resolveImageUrl";

function IconShield(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M12 2l7 4v6c0 5-3 9-7 10-4-1-7-5-7-10V6l7-4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M9.5 12l1.8 1.8L15.5 9.6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconChart(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M4 19V5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 19h16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M8 15v-5M12 15V7M16 15v-3" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function IconRefresh(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path d="M20 12a8 8 0 10-2.3 5.7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M20 7v5h-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function formatCurrency(n) {
  const num = Number(n || 0);
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(num);
  } catch {
    return `$${num}`;
  }
}

function statusLabel(status) {
  const s = String(status || "active").toLowerCase();
  if (s === "draft") return "Draft";
  if (s === "paused") return "Paused";
  return "Active";
}

function isUsableImageUrl(url) {
  if (!url) return false;
  const u = String(url).trim();
  if (!u) return false;
  if (u.startsWith("file://")) return false;
  if (u.toLowerCase().endsWith(".pdf")) return false;
  return true;
}

function placeholderSvgDataUrl(title = "Campaign") {
  const safe = String(title).slice(0, 40).replace(/&/g, "and").replace(/</g, "");
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#dbeafe"/>
        <stop offset="45%" stop-color="#e0f2fe"/>
        <stop offset="100%" stop-color="#ffe4e6"/>
      </linearGradient>
      <linearGradient id="pill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0ea5a4"/>
        <stop offset="100%" stop-color="#0f766e"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <circle cx="260" cy="210" r="160" fill="#0ea5a4" opacity="0.12"/>
    <circle cx="960" cy="240" r="240" fill="#fb7185" opacity="0.10"/>
    <rect x="70" y="420" width="220" height="56" rx="28" fill="url(#pill)" opacity="0.92"/>
    <text x="92" y="457" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="22" fill="white" font-weight="700">
      Alms
    </text>
    <text x="70" y="335" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="54" fill="#0f172a" font-weight="800">
      ${safe}
    </text>
    <text x="70" y="380" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="24" fill="#475569">
      Add a flyer image anytime.
    </text>
  </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getCardImgSrc(c) {
  const raw = c?.imageUrl;
  if (!isUsableImageUrl(raw)) return placeholderSvgDataUrl(c?.title);
  const resolved = resolveImageUrl(raw);
  return resolved || placeholderSvgDataUrl(c?.title);
}

export default function Home() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);

  const hasToken = Boolean(localStorage.getItem("token"));
  const [animateIn, setAnimateIn] = useState(false);

  const targetRaised = 12480;
  const targetDonors = 132;
  const [raisedDisplay, setRaisedDisplay] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const list = await getCampaigns();
        const arr = Array.isArray(list) ? list : (list?.campaigns ?? []);
        setCampaigns(arr);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => setAnimateIn(true), 50);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    let rafId;
    const durationMs = 900;
    const start = performance.now();
    const from = 0;
    const to = targetRaised;

    function tick(now) {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      const value = Math.round(from + (to - from) * eased);
      setRaisedDisplay(value);
      if (t < 1) rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [targetRaised]);

  const featured = campaigns.slice(0, 3);
  const featuredProgressKey = useMemo(() => (animateIn ? "in" : "out"), [animateIn]);

  return (
    <div className="page">
      <div className="container stack">
        {/* HERO */}
        <section className="hero">
          <div className="hero-illus" aria-hidden="true" />

          <div className="hero-left stack">
            <p className="kicker">Trusted giving, beautifully simple</p>
            <h1 className="hero-title">
              Give with confidence. <span className="hero-accent">See your impact.</span>
            </h1>
            <p className="hero-sub">
              Launch transparent campaigns and empower donors with real-time impact tracking.
            </p>

            <div className="hero-cta">
              <Link className="btn btn-primary" to="/campaigns">
                Explore campaigns
              </Link>
              <Link className="btn btn-outline" to={hasToken ? "/campaigns/new" : "/nonprofit/login"}>
                Create a campaign
              </Link>
            </div>

            <div className="trust-row">
              <div className="trust-item"><IconShield className="trust-ico" /><span>Secure payments</span></div>
              <div className="trust-item"><IconChart className="trust-ico" /><span>Transparent goals</span></div>
              <div className="trust-item"><IconRefresh className="trust-ico" /><span>Real-time updates</span></div>
            </div>
          </div>

          <div className="hero-right">
            <div className={`hero-card ${animateIn ? "in" : ""}`}>
              <div className="hero-card-top">
                <span className="badge">Impact</span>
                <span className="small">This month</span>
              </div>

              <div className="hero-metric">
                <div className="hero-metric-num">{formatCurrency(raisedDisplay)}</div>
                <div className="small">Raised this month by {targetDonors} donors.</div>
              </div>

              <div className="progress thick" style={{ marginTop: 14 }}>
                <span className={animateIn ? "bar-in" : ""} style={{ width: "68%" }} />
              </div>

              <div className="quote">“Clarity builds trust — and trust increases giving.”</div>
            </div>
          </div>
        </section>

        {/* FEATURED */}
        <section className="stack featured" style={{ gap: 10 }}>
          <div className="section-head">
            <h2 className="h2">Featured campaigns</h2>
            <Link className="btn btn-ghost" to="/campaigns">View all</Link>
          </div>

          {loading ? (
            <p className="p">Loading campaigns…</p>
          ) : (
            <div className="grid-3">
              {featured.map((c) => {
                const goal = Number(c.goalAmount || 0);
                const raised = Number(c.amountRaised || 0);
                const pct = goal ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

                const imgSrc = getCardImgSrc(c);
                const badgeText = statusLabel(c.status);

                return (
                  <Link key={c._id} to={`/campaigns/${c._id}`} className="campaign-card">
                    {/* REAL image (or generated placeholder) */}
                    <div className="campaign-img">
                      <img
                        src={imgSrc}
                        alt={c.title}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.src = placeholderSvgDataUrl(c.title);
                        }}
                      />
                      <div className="campaign-img-badge">{badgeText}</div>
                    </div>

                    <div className="campaign-body">
                      <div className="campaign-top">
                        <div>
                          <div className="campaign-title">{c.title}</div>
                          <div className="small">{badgeText} · {pct}%</div>
                        </div>
                      </div>

                      <div className="progress thick" data-anim={featuredProgressKey}>
                        <span className={animateIn ? "bar-in" : ""} style={{ width: `${pct}%` }} />
                      </div>

                      <div className="campaign-meta">
                        <span><strong>Goal</strong> {formatCurrency(goal)}</span>
                        <span><strong>Raised</strong> {formatCurrency(raised)}</span>
                      </div>

                      <div className="campaign-cta">
                        <span className="btn btn-primary mini" style={{ pointerEvents: "none" }}>View & donate</span>
                        <span className="btn btn-ghost mini" style={{ pointerEvents: "none" }}>Details</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </section>

        {/* HOW IT WORKS */}
        <section className="how">
          <h2 className="h2">How Alms works</h2>
          <div className="how-grid">
            <div className="how-card">
              <div className="how-num">1</div>
              <div className="how-title">Discover a cause</div>
              <p className="p">Browse campaigns and understand exactly what your donation supports.</p>
            </div>
            <div className="how-card">
              <div className="how-num">2</div>
              <div className="how-title">Give in seconds</div>
              <p className="p">Fast checkout, secure payments, and a donation experience that feels good.</p>
            </div>
            <div className="how-card">
              <div className="how-num">3</div>
              <div className="how-title">Track progress</div>
              <p className="p">See goals and raised amounts update — transparency builds trust.</p>
            </div>
          </div>
        </section>

        <footer className="footer">
          <div className="small">© {new Date().getFullYear()} AlmsGiving</div>
          <div className="small">Built for trust, designed for impact.</div>
        </footer>
      </div>
    </div>
  );
}