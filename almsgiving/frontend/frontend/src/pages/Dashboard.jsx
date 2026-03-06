import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useMemo, useState, useCallback } from "react";
import { getMyCampaigns } from "../api/campaigns";
import { deleteMyNonprofit } from "../api/nonprofits";

import "./Dashboard.css";

function formatMoney(n) {
  const num = Number(n || 0);
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function clampPct(n) {
  const x = Number.isFinite(n) ? n : 0;
  return Math.max(0, Math.min(100, x));
}

function campaignPct(raised, goal) {
  const g = Number(goal || 0);
  const r = Number(raised || 0);
  if (!g) return 0;
  return clampPct(Math.round((r / g) * 100));
}

export default function Dashboard() {
  const { nonprofit, logout } = useAuth();
  const nav = useNavigate();

  const [myCampaigns, setMyCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [justRefreshed, setJustRefreshed] = useState(false);

  function handleLogout() {
    logout();
    nav("/nonprofit/login", { replace: true });
  }

  const reload = useCallback(async () => {
    try {
      setError("");
      setLoading(true);

      const data = await getMyCampaigns();
      const list = data?.campaigns ?? data;
      setMyCampaigns(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || "Failed to load your campaigns");
      setMyCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const [dangerErr, setDangerErr] = useState("");
const [deleting, setDeleting] = useState(false);

async function handleDeleteAccount() {
  const ok = window.confirm(
    "Delete your nonprofit account? This cannot be undone."
  );
  if (!ok) return;

  setDeleting(true);
  setDangerErr("");

  try {
    await deleteMyNonprofit();
    logout();
    nav("/nonprofit/register", { replace: true });
  } catch (e) {
    setDangerErr(e?.data?.error || e?.message || "Delete failed");
  } finally {
    setDeleting(false);
  }
}

  const handleRefresh = useCallback(async () => {
    setJustRefreshed(true);
    await reload();
    window.setTimeout(() => setJustRefreshed(false), 260);
  }, [reload]);

  useEffect(() => {
    reload();
  }, [reload]);

  const computed = useMemo(() => {
    const totalCount = myCampaigns.length;

    const activeCampaigns = myCampaigns.filter(
      (c) => (c?.status || "active") === "active"
    );

    const totalRaised = myCampaigns.reduce(
      (sum, c) => sum + Number(c?.amountRaised || 0),
      0
    );

    const totalGoal = myCampaigns.reduce(
      (sum, c) => sum + Number(c?.goalAmount || 0),
      0
    );

    const remaining = Math.max(0, totalGoal - totalRaised);
    const overallPct = totalGoal
      ? clampPct(Math.round((totalRaised / totalGoal) * 100))
      : 0;

    const needsAttention = activeCampaigns.filter((c) => {
      const pct = campaignPct(c?.amountRaised, c?.goalAmount);
      return pct > 0 && pct < 25;
    });

    const nearGoal = activeCampaigns.filter((c) => {
      const pct = campaignPct(c?.amountRaised, c?.goalAmount);
      return pct >= 75 && pct < 100;
    });

    const missingImage = myCampaigns.filter((c) => !c?.imageUrl);
    const missingDescription = myCampaigns.filter((c) => !c?.description);

    const suggestions = [];

    if (missingImage.length) {
      suggestions.push({
        key: "add-images",
        title: "Add campaign images",
        detail: `${missingImage.length} campaign${
          missingImage.length === 1 ? "" : "s"
        } missing an image.`,
        ctaLabel: "Manage campaigns",
        ctaTo: "/campaigns/my",
      });
    }

    if (missingDescription.length) {
      suggestions.push({
        key: "add-descriptions",
        title: "Strengthen descriptions",
        detail: `${missingDescription.length} campaign${
          missingDescription.length === 1 ? "" : "s"
        } missing a description.`,
        ctaLabel: "Manage campaigns",
        ctaTo: "/campaigns/my",
      });
    }

    if (nearGoal.length) {
      suggestions.push({
        key: "final-push",
        title: "Run a final push",
        detail: `${nearGoal.length} campaign${
          nearGoal.length === 1 ? "" : "s"
        } are 75%+ funded.`,
        ctaLabel: "View campaigns",
        ctaTo: "/campaigns/my",
      });
    }

    if (needsAttention.length) {
      suggestions.push({
        key: "needs-attention",
        title: "Review low-progress campaigns",
        detail: `${needsAttention.length} active campaign${
          needsAttention.length === 1 ? "" : "s"
        } under 25% funded.`,
        ctaLabel: "View campaigns",
        ctaTo: "/campaigns/my",
      });
    }

    if (!totalCount) {
      suggestions.push({
        key: "create-first",
        title: "Create your first campaign",
        detail: "Start with a clear goal, a strong image, and a short story.",
        ctaLabel: "Create a campaign",
        ctaTo: "/campaigns/new",
      });
    }

    let insightTitle = "All set";
    let insightSub = "No high-priority actions right now.";

    if (suggestions.length) {
      insightTitle = `${suggestions.length} suggested action${
        suggestions.length === 1 ? "" : "s"
      }`;
      insightSub = suggestions[0].title;
    }

    // Primary campaign: near-goal first, else highest raised, else first
    const primaryCampaign =
      nearGoal[0] ||
      activeCampaigns
        .slice()
        .sort(
          (a, b) => Number(b?.amountRaised || 0) - Number(a?.amountRaised || 0)
        )[0] ||
      myCampaigns[0] ||
      null;

    const primaryCampaignId = primaryCampaign?._id || null;

    return {
      totalCount,
      totalRaised,
      totalGoal,
      remaining,
      overallPct,
      suggestions,
      insightTitle,
      insightSub,
      primaryCampaignId,
      primaryCampaignTitle: primaryCampaign?.title || null,
    };
  }, [myCampaigns]);

  const orgName = nonprofit?.organizationName || nonprofit?.email || "Nonprofit";
  const hasCampaigns = computed.totalCount > 0;

  // =========================
  // ZERO STATE DASHBOARD (unchanged)
  // =========================
  if (!loading && !hasCampaigns) {
    return (
      <div className="page">
        <div className="container">
          <div className="stack" style={{ gap: 16 }}>
            <div className="card card-pad dash-emptyHero">
              <div className="dash-emptyHeroGrid">
                <div>
                  <p className="dash-kicker">Workspace</p>
                  <h1 className="h1 dash-title">{orgName} — Getting started</h1>

                  <p className="p dash-subtitle">
                    Create your first campaign to start collecting donations and build trust with
                    transparent progress.
                  </p>

                  <div className="dash-actions">
                    <Link className="btn btn-primary" to="/campaigns/new">
                      Create your first campaign
                    </Link>
                    <Link className="btn btn-ghost" to="/campaigns">
                      Preview public view
                    </Link>

                    <button
                      className="iconBtn"
                      type="button"
                      onClick={handleRefresh}
                      disabled={loading}
                      aria-label="Refresh"
                      title="Refresh"
                    >
                      ↻
                    </button>

                    <button
                      className="iconBtn iconBtn--danger"
                      type="button"
                      onClick={handleLogout}
                      aria-label="Logout"
                      title="Logout"
                    >
                      ⎋
                    </button>
                  </div>

                  <div className="dash-meta">
                    <span className="badge">Stripe-ready</span>
                    <span className="badge">Receipts & records</span>
                    <span className="badge">Shareable campaign page</span>
                  </div>

                  {error && (
                    <div className="alert alert-error" style={{ marginTop: 12 }}>
                      Error: {error}
                    </div>
                  )}
                </div>

                <div className="dash-checkCard">
                  <div className="dash-checkHead">
                    <span className="dash-pill">Quick start</span>
                    <span className="dash-muted">~ 3 minutes</span>
                  </div>

                  <div className="dash-checkItem">
                    <span className="dash-checkDot" />
                    <div>
                      <div className="dash-checkTitle">Create a campaign</div>
                      <div className="dash-checkDesc">Add a title, goal, and short story.</div>
                    </div>
                  </div>

                  <div className="dash-checkItem">
                    <span className="dash-checkDot" />
                    <div>
                      <div className="dash-checkTitle">Add a cover image</div>
                      <div className="dash-checkDesc">Images increase trust and conversion.</div>
                    </div>
                  </div>

                  <div className="dash-checkItem">
                    <span className="dash-checkDot" />
                    <div>
                      <div className="dash-checkTitle">Share your link</div>
                      <div className="dash-checkDesc">Post to WhatsApp, email, or social.</div>
                    </div>
                  </div>

                  <Link
                    className="btn btn-primary"
                    to="/campaigns/new"
                    style={{ width: "100%", marginTop: 12 }}
                  >
                    Create campaign
                  </Link>

                  <div className="dash-checkFoot">
                    <span className="small dash-muted">
                      Once created, your campaign will appear below.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="card card-pad dash-emptyCampaigns">
              <div className="dash-emptyCampaignsRow">
                <h2 className="h2 dash-h2">Your campaigns</h2>
                <Link className="btn btn-ghost" to="/campaigns/new">
                  Create
                </Link>
              </div>

              <p className="p dash-muted" style={{ marginTop: 10 }}>
                No campaigns yet — create one to unlock analytics and AI insights.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================
  // NORMAL DASHBOARD (design refined)
  // =========================
  return (
    <div className="page">
      <div className="container">
        <div className="stack" style={{ gap: 16 }}>
          {/* Header */}
          <div className="card card-pad stack">
            <div className="dash-headRow">
              <div>
                <h1 className="h1" style={{ marginBottom: 0 }}>
                  {orgName} — Performance Overview
                </h1>

                <p className="p" style={{ marginTop: 6 }}>
                  Overall progress: <strong>{computed.overallPct}%</strong>
                  {computed.totalGoal ? (
                    <>
                      {" "}
                      · Remaining: <strong>${formatMoney(computed.remaining)}</strong>
                    </>
                  ) : null}
                </p>

                <div className="dash-secondaryLinks">
                  <Link className="dash-link" to="/campaigns">
                    View public directory →
                  </Link>
                </div>
              </div>

              {/* Primary actions + grouped utilities */}
              <div className="dashTopActions">
                <Link className="btn btn-primary" to="/campaigns/new">
                  Create a campaign
                </Link>

                <Link className="btn btn-ghost" to="/campaigns/my">
                  Manage campaigns
                </Link>

                <div className="dashIconGroup" role="group" aria-label="Dashboard utilities">
                  <button
                    className="iconBtn"
                    type="button"
                    onClick={handleRefresh}
                    disabled={loading}
                    aria-label="Refresh dashboard"
                    title="Refresh"
                  >
                    ↻
                  </button>

                  <button
                    className="iconBtn iconBtn--danger"
                    type="button"
                    onClick={handleLogout}
                    aria-label="Logout"
                    title="Logout"
                  >
                    ⎋
                  </button>
                </div>
              </div>
            </div>

            {error && <div className="alert alert-error">Error: {error}</div>}
          </div>

          {/* Metrics */}
          <div className={`ai-metrics ${justRefreshed ? "refresh-fade" : ""}`}>
            <div className="ai-metrics-left">
              <div className="card card-pad ai-stat">
                <div className="small">Total Raised</div>
                <div className="ai-statValue">${formatMoney(computed.totalRaised)}</div>
                <div className="small" style={{ marginTop: 6 }}>
                  Across {computed.totalCount} campaign{computed.totalCount === 1 ? "" : "s"}
                </div>
              </div>

              <div className="card card-pad ai-stat">
                <div className="small">Remaining</div>
                <div className="ai-statValue">${formatMoney(computed.remaining)}</div>
                <div className="small" style={{ marginTop: 6 }}>
                  Goal: ${formatMoney(computed.totalGoal)} · {computed.overallPct}% funded
                </div>
              </div>
            </div>

            {/* AI Insights */}
            <div
              className={`card card-pad stat-impact ai-insights ${
                computed.suggestions.length ? "" : "ai-insights--calm"
              }`}
            >
              <div className="label">AI Insights</div>
              <div className="value" style={{ marginTop: 10 }}>
                {computed.insightTitle}
              </div>
              <div className="sub" style={{ marginTop: 6 }}>
                {computed.insightSub}
              </div>

              {/* If calm, keep ONE subtle “open campaign” link (not another “share” CTA) */}
              {!computed.suggestions.length && computed.primaryCampaignId ? (
                <div style={{ marginTop: 12 }}>
                  <Link className="btn btn-ghost" to={`/campaigns/${computed.primaryCampaignId}`}>
                    Open campaign
                  </Link>
                </div>
              ) : null}
            </div>
          </div>

          {/* Recommended next steps (NO RAIL — teal orb like insights) */}
          <div
            className={`card card-pad stack ai-panel ai-panel-orb ${
              justRefreshed ? "refresh-fade" : ""
            }`}
          >
            <div className="section-head">
              <h2 className="h2">
                Recommended next steps <span className="ai-pill">System guidance</span>
              </h2>
              <Link className="btn btn-ghost" to="/campaigns/my">
                Manage
              </Link>
            </div>

            {computed.suggestions.length === 0 ? (
              <div className="ai-empty ai-empty--tight">
                <div className="ai-emptyTitle">You’re on track.</div>
                <div className="ai-emptySub">
                  Next best move: share your campaign to keep momentum.
                </div>

                <div className="ai-emptyCtaRow">
                  {computed.primaryCampaignId ? (
                    <Link className="btn btn-ghost" to={`/campaigns/${computed.primaryCampaignId}`}>
                      Get share link
                    </Link>
                  ) : (
                    <Link className="btn btn-ghost" to="/campaigns/my">
                      Manage campaigns
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <ul className="list">
                {computed.suggestions.slice(0, 2).map((s) => (
                  <li key={s.key} className="item">
                    <div className="item-title">{s.title}</div>
                    <div className="meta-row">
                      <span>{s.detail}</span>
                    </div>
                    <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <Link className="btn btn-primary" to={s.ctaTo}>
                        {s.ctaLabel}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Danger zone */}
<div className="card card-pad stack dash-danger">
  <div className="section-head">
    <h2 className="h2">Danger zone</h2>
  </div>

  <p className="p dash-muted" style={{ marginTop: -6 }}>
    Permanently delete your nonprofit account. This cannot be undone.
  </p>

  {dangerErr ? <div className="alert alert-error">Error: {dangerErr}</div> : null}

  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
    <button
      className="btn btn-danger"
      type="button"
      onClick={handleDeleteAccount}
      disabled={deleting}
      title="Delete account"
    >
      {deleting ? "Deleting…" : "Delete account"}
    </button>

    <span className="small dash-muted" style={{ alignSelf: "center" }}>
      Tip: use this to clean up test accounts before demo day.
    </span>
  </div>
</div>

          {/* Your campaigns */}
          <div className="card card-pad stack">
            <div className="section-head">
              <h2 className="h2">Your campaigns</h2>
              <Link className="btn btn-ghost" to="/campaigns/my">
                Manage
              </Link>
            </div>

            {loading ? (
              <p className="p">Loading your campaigns…</p>
            ) : myCampaigns.length === 0 ? (
              <p className="p">No campaigns yet.</p>
            ) : (
              <ul className="list">
                {myCampaigns.slice(0, 3).map((c) => {
                  const goal = Number(c?.goalAmount || 0);
                  const raised = Number(c?.amountRaised || 0);
                  const pct = campaignPct(raised, goal);

                  return (
                    <li key={c?._id || c?.title} className="item">
                      <div className="item-title">{c?.title || "Untitled campaign"}</div>

                      <div className="meta-row">
                        <span><strong>Goal:</strong> ${formatMoney(goal)}</span>
                        <span><strong>Raised:</strong> ${formatMoney(raised)}</span>
                        <span><strong>Status:</strong> {c?.status || "active"}</span>
                        <span><strong>{pct}%</strong> funded</span>
                      </div>

                      <div className="progress" aria-label="Campaign progress">
                        <span style={{ width: `${pct}%` }} />
                      </div>

                      <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        {c?._id ? (
                          <>
                            <Link className="btn btn-ghost" to={`/campaigns/${c._id}`}>
                              View
                            </Link>
                            <Link className="btn btn-outline" to={`/campaigns/${c._id}/edit`}>
                              Edit
                            </Link>
                          </>
                        ) : (
                          <div className="alert alert-error" style={{ margin: 0 }}>
                            Missing campaign ID (_id) from API response.
                          </div>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}