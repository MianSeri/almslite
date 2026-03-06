import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getMyCampaigns, deleteCampaign } from "../api/campaigns";
import { resolveImageUrl } from "../utils/resolveImageUrl";

import "./MyCampaigns.css";

function money(n) {
  const num = Number(n || 0);
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function percentFunded(raised, goal) {
  const g = Number(goal || 0);
  const r = Number(raised || 0);
  if (!g) return 0;
  return Math.min(100, Math.round((r / g) * 100));
}

function placeholderSvgDataUrl(title = "Campaign") {
  const safe = String(title)
    .slice(0, 44)
    .replace(/&/g, "and")
    .replace(/</g, "");

  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
    <defs>
      <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#dbeafe"/>
        <stop offset="52%" stop-color="#e0f2fe"/>
        <stop offset="100%" stop-color="#ffe4e6"/>
      </linearGradient>
      <linearGradient id="pill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0ea5a4"/>
        <stop offset="100%" stop-color="#0f766e"/>
      </linearGradient>
    </defs>

    <rect width="1200" height="630" fill="url(#bg)"/>
    <circle cx="220" cy="170" r="150" fill="#0ea5a4" opacity="0.12"/>
    <circle cx="980" cy="240" r="220" fill="#fb7185" opacity="0.10"/>

    <rect x="70" y="420" width="220" height="56" rx="28" fill="url(#pill)" opacity="0.92"/>
    <text x="92" y="457" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="22" fill="white" font-weight="700">
      Alms
    </text>

    <text x="70" y="335" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="54" fill="#0f172a" font-weight="800">
      ${safe}
    </text>

    <text x="70" y="380" font-family="system-ui, -apple-system, Segoe UI, Roboto" font-size="24" fill="#475569">
      No image yet — still looks great.
    </text>
  </svg>`;

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

function getImgSrc(c) {
  const resolved = resolveImageUrl(c?.imageUrl);
  return resolved || placeholderSvgDataUrl(c?.title || "Campaign");
}

export default function MyCampaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const list = await getMyCampaigns();
      setCampaigns(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || "Failed to load your campaigns");
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(c) {
    const id = c?._id;
    if (!id) return;

    const ok = window.confirm(`Delete "${c.title || "this campaign"}"?\n\nThis cannot be undone.`);
    if (!ok) return;

    try {
      setError("");
      await deleteCampaign(id);
      setCampaigns((prev) => prev.filter((x) => x._id !== id));
    } catch (err) {
      setError(err?.message || "Failed to delete campaign");
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <p className="p" style={{ padding: 16 }}>Loading your campaigns…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        {/* Header */}
        <div className="card card-pad">
          <div className="mcp-header">
            <div className="mcp-headerLeft">
              <Link className="mcp-backBtn" to="/dashboard">
                ← Back to dashboard
              </Link>

              <div>
                <div className="mcp-headlineRow">
                  <h1 className="h1 mcp-h1">My campaigns</h1>
                  <span className="mcp-modeBadge" title="This is your nonprofit management view">
                    Workspace
                  </span>
                </div>

                <p className="p mcp-sub">Manage the campaigns you’ve created.</p>

                <div className="mcp-modeRow">
                  <Link className="mcp-modeLink" to="/campaigns">
                    Switch to Public campaigns →
                  </Link>
                </div>
              </div>
            </div>

            <Link className="btn btn-primary" to="/campaigns/new">
              Create a campaign
            </Link>
          </div>
        </div>

        {/* Workspace callout */}
        <div className="mcp-callout">
          You’re viewing your nonprofit workspace. See the donor experience in{" "}
          <Link to="/campaigns">Public campaigns</Link>.
        </div>

        {/* Error */}
        {error ? (
          <div style={{ marginTop: 12 }}>
            <div className="alert alert-error">Error: {error}</div>
            <button className="btn btn-ghost" onClick={load} style={{ marginTop: 12 }}>
              Retry
            </button>
          </div>
        ) : null}

        {/* Empty state */}
        {campaigns.length === 0 ? (
          <div className="card card-pad" style={{ marginTop: 12 }}>
            <p className="p" style={{ margin: 0 }}>No campaigns yet.</p>
          </div>
        ) : (
          <div className="mcp-list">
            {campaigns.map((c) => {
              const id = c?._id;
              const goal = Number(c?.goalAmount || 0);
              const raised = Number(c?.amountRaised || 0);
              const fundedPct = percentFunded(raised, goal);

              return (
                <article key={id || c?.title} className="card mcp-card">
                  <div className="mcp-media">
                    <img
                      src={getImgSrc(c)}
                      alt={c?.title || "Campaign image"}
                      loading="lazy"
                    />
                    <span className={`mcp-status ${c?.status || "active"}`}>
                      {c?.status || "active"}
                    </span>
                  </div>

                  <div className="mcp-body">
                    <div className="mcp-title">{c?.title || "Untitled campaign"}</div>

                    {c?.description ? <div className="mcp-desc">{c.description}</div> : null}

                    <div className="mcp-progressWrap">
                      <div className="progress" aria-label="Campaign progress">
                        <span style={{ width: `${fundedPct}%` }} />
                      </div>

                      <div className="mcp-metrics small">
                        <span><strong>Raised:</strong> ${money(raised)}</span>
                        <span><strong>Goal:</strong> ${money(goal)}</span>
                        <span><strong>{fundedPct}%</strong> funded</span>
                      </div>
                    </div>

                    <div className="mcp-actions">
                      {id ? (
                        <>
                          <Link className="btn btn-ghost" to={`/campaigns/${id}`}>
                            View public page
                          </Link>

                          <Link className="btn btn-primary" to={`/campaigns/${id}/edit`}>
                            Edit
                          </Link>

                          <button
                            className="btn btn-ghost"
                            type="button"
                            onClick={() => handleDelete(c)}
                            style={{
                              borderColor: "rgba(239,68,68,0.35)",
                              color: "rgb(239,68,68)",
                            }}
                          >
                            Delete
                          </button>
                        </>
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