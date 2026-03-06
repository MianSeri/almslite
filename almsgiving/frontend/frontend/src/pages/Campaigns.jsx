import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getCampaigns } from "../api/campaigns";
import { resolveImageUrl } from "../utils/resolveImageUrl";
import "./Campaigns.css";

function money(n) {
  const num = Number(n || 0);
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function pct(raised, goal) {
  const g = Number(goal || 0);
  const r = Number(raised || 0);
  if (!g) return 0;
  return Math.min(100, Math.round((r / g) * 100));
}

function placeholderSvgDataUrl(title = "Campaign") {
  const safe = String(title)
    .slice(0, 42)
    .replace(/&/g, "and")
    .replace(/</g, "")
    .replace(/>/g, "");

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#dbeafe"/>
        <stop offset="55%" stop-color="#e0f2fe"/>
        <stop offset="100%" stop-color="#ffe4e6"/>
      </linearGradient>
      <linearGradient id="pill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0ea5a4"/>
        <stop offset="100%" stop-color="#0f766e"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#bg)"/>
    <circle cx="230" cy="170" r="160" fill="#0ea5a4" opacity="0.12"/>
    <circle cx="980" cy="250" r="230" fill="#fb7185" opacity="0.10"/>
    <rect x="70" y="430" width="220" height="56" rx="28" fill="url(#pill)" opacity="0.92"/>
    <text x="92" y="467" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="22" fill="white" font-weight="800">
      Alms
    </text>
    <text x="70" y="335" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="54" fill="#0f172a" font-weight="900">
      ${safe}
    </text>
    <text x="70" y="382" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="24" fill="#475569">
      Campaign image coming soon.
    </text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getImgSrc(c) {
  const resolved = resolveImageUrl?.(c?.imageUrl);
  return resolved || placeholderSvgDataUrl(c?.title || "Campaign");
}

export default function Campaigns() {
  const nav = useNavigate();

  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const hasToken = Boolean(localStorage.getItem("token"));
  const isAuthed = hasToken;

  async function load() {
    try {
      setLoading(true);
      setError("");
      const list = await getCampaigns();
      setCampaigns(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || "Failed to load campaigns");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const subtitle = useMemo(() => {
    if (!campaigns.length) return "Browse public campaigns and support a mission.";
    return `Browse ${campaigns.length} campaign${
      campaigns.length === 1 ? "" : "s"
    } and support a mission.`;
  }, [campaigns.length]);

  if (loading) return <p className="p" style={{ padding: 16 }}>Loading campaigns…</p>;

  if (error) {
    return (
      <div style={{ padding: 16 }}>
        <div className="alert alert-error">Error: {error}</div>
        <button className="btn btn-ghost" onClick={load} style={{ marginTop: 12 }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        {/* Header (Public view) */}
        <div className="card card-pad cpg-header">
          <div className="cpg-headerLeft">
            <button
              type="button"
              className="cpg-backBtn"
              onClick={() => nav(isAuthed ? "/welcome" : "/", { replace: true })}
              aria-label="Go back"
            >
              Back
            </button>

            <div>
              <div className="cpg-headlineRow">
                <h1 className="h1 cpg-h1">Public campaigns</h1>
                <span className="cpg-modeBadge" title="This is the public donor view">
                  Public view
                </span>
              </div>

              <p className="p cpg-sub">{subtitle}</p>

              {isAuthed && (
                <div className="cpg-modeRow">
                  <Link className="cpg-modeLink" to="/campaigns/my">
                    Switch to My campaigns →
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="cpg-headerRight">
            {isAuthed ? (
              <>
                <Link className="btn btn-ghost" to="/campaigns/my">
                  My campaigns
                </Link>
                <Link className="btn btn-primary" to="/campaigns/new">
                  Create a campaign
                </Link>
              </>
            ) : (
              <Link className="btn btn-primary" to="/nonprofit/login">
                Nonprofit login
              </Link>
            )}
          </div>
        </div>

        {/* Optional callout (only when authed) */}
        {isAuthed && (
          <div className="cpg-callout">
            You’re viewing the public donor experience. Manage your campaigns in{" "}
            <Link to="/campaigns/my">My campaigns</Link>.
          </div>
        )}

        {/* Empty state */}
        {!campaigns.length ? (
          <div className="card card-pad" style={{ marginTop: 12 }}>
            <p className="p" style={{ margin: 0 }}>No campaigns yet.</p>
          </div>
        ) : (
          <div className="cpg-list">
            {campaigns.map((c) => {
              const id = c?._id;
              const goal = Number(c?.goalAmount || 0);
              const raised = Number(c?.amountRaised || 0);
              const progress = pct(raised, goal);

              return (
                <article key={id || c?.title} className="card cpg-card">
                  <div className="cpg-media">
                    <img
                      src={getImgSrc(c)}
                      alt={c?.title || "Campaign image"}
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = placeholderSvgDataUrl(c?.title || "Campaign");
                      }}
                    />
                    <span className={`cpg-status ${c?.status || "active"}`}>
                      {c?.status || "active"}
                    </span>
                  </div>

                  <div className="cpg-body">
                    <div className="cpg-topRow">
                      <div className="cpg-title">{c?.title || "Untitled campaign"}</div>
                    </div>

                    {c?.description ? <div className="cpg-desc">{c.description}</div> : null}

                    <div className="cpg-progressWrap">
                      <div className="progress" aria-label="Campaign progress">
                        <span style={{ width: `${progress}%` }} />
                      </div>

                      <div className="cpg-metrics small">
                        <span><strong>Raised:</strong> ${money(raised)}</span>
                        <span><strong>Goal:</strong> ${money(goal)}</span>
                        <span><strong>{progress}%</strong> funded</span>
                      </div>
                    </div>

                    <div className="cpg-actions">
                      {id ? (
                        <Link className="btn btn-ghost" to={`/campaigns/${id}`}>
                          View &amp; donate
                        </Link>
                      ) : (
                        <div className="alert alert-error" style={{ margin: 0 }}>
                          Missing campaign ID (_id) from API response.
                        </div>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}