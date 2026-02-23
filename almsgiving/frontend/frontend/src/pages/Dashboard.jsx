import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useEffect, useMemo, useState } from "react";
import { getMyCampaigns } from "../api/campaigns";

function formatMoney(n) {
  const num = Number(n || 0);
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export default function Dashboard() {
  const { nonprofit, logout } = useAuth();
  const nav = useNavigate();

  const [myCampaigns, setMyCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function handleLogout() {
    logout();
    nav("/login", { replace: true });
  }

  async function reload() {
    try {
      setError("");
      setLoading(true);
      const data = await getMyCampaigns();
      const list = data.campaigns ?? data;  // supports either shape
      setMyCampaigns(Array.isArray(list) ? list : []);
      console.log("getMyCampaigns() returned:", list);
      console.log("first campaign:", Array.isArray(list) ? list[0] : list?.[0]);
    } catch (err) {
      setError(err?.message || "Failed to load your campaigns");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    reload();
  }, []);

  const metrics = useMemo(() => {
    const totalRaised = myCampaigns.reduce((sum, c) => sum + Number(c.amountRaised || 0), 0);
    const activeCount = myCampaigns.filter((c) => (c.status || "active") === "active").length;
    const totalCount = myCampaigns.length;

    // MVP “Impact” proxy until you add /donations (count)
    // Option 1: show number of campaigns launched
    const impactLabel = `${totalCount} campaign${totalCount === 1 ? "" : "s"} launched`;

    return { totalRaised, activeCount, totalCount, impactLabel };
  }, [myCampaigns]);

  const orgName = nonprofit?.organizationName || nonprofit?.email || "Nonprofit";

  return (
    <div className="page">
      <div className="container">
        <div className="stack" style={{ gap: 16 }}>
          <div className="card card-pad stack">
            <h1 className="h1" style={{ marginBottom: 0 }}>Nonprofit Dashboard</h1>

            <p className="p" style={{ marginTop: 0 }}>
              Logged in as: <strong>{orgName}</strong>
            </p>

            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              <Link className="btn btn-primary" to="/campaigns/new">Create a campaign</Link>
              <Link className="btn btn-ghost" to="/campaigns/my">View my campaigns</Link>
              <Link className="btn btn-ghost" to="/campaigns">View public campaigns</Link>
              <button className="btn btn-ghost" onClick={reload} disabled={loading}>
                {loading ? "Refreshing…" : "Refresh"}
              </button>
              <button className="btn btn-ghost" onClick={handleLogout}>Logout</button>
            </div>

            {error && <div className="alert alert-error">Error: {error}</div>}
          </div>

          <div className="grid-3">
            <div className="card card-pad">
              <div className="small">Total Raised</div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em", marginTop: 6 }}>
                ${formatMoney(metrics.totalRaised)}
              </div>
              <div className="small" style={{ marginTop: 6 }}>
                Across all your campaigns
              </div>
            </div>

            <div className="card card-pad">
              <div className="small">Active Campaigns</div>
              <div style={{ fontSize: 28, fontWeight: 900, letterSpacing: "-0.02em", marginTop: 6 }}>
                {metrics.activeCount}
              </div>
              <div className="small" style={{ marginTop: 6 }}>
                Out of {metrics.totalCount} total
              </div>
            </div>

            <div className="card card-pad impact">
              <div className="small" style={{ color: "inherit" }}>Impact</div>
              <div style={{ fontSize: 18, fontWeight: 900, letterSpacing: "-0.02em", marginTop: 8 }}>
                {metrics.impactLabel}
              </div>
              <div className="small" style={{ marginTop: 6, color: "inherit" }}>
                Add donation counts later with a /donations summary endpoint
              </div>
            </div>
          </div>

          <div className="card card-pad stack">
            <div className="section-head">
              <h2 className="h2">Your campaigns</h2>
              <Link className="btn btn-ghost" to="/campaigns/my">Manage</Link>
            </div>

            {loading ? (
              <p className="p">Loading your campaigns…</p>
            ) : myCampaigns.length === 0 ? (
              <p className="p">No campaigns yet. Create one to start raising support.</p>
            ) : (
              <ul className="list">
                {myCampaigns.slice(0, 3).map((c) => {
                  console.log("campaign row:", c);
                  const goal = Number(c.goalAmount || 0);
                  const raised = Number(c.amountRaised || 0);
                  const pct = goal ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

                  return (
                    <li key={c._id} className="item">
                      <div className="item-title">{c.title}</div>
                      <div className="meta-row">
                        <span><strong>Goal:</strong> ${formatMoney(goal)}</span>
                        <span><strong>Raised:</strong> ${formatMoney(raised)}</span>
                        <span><strong>Status:</strong> {c.status || "active"}</span>
                        <span><strong>{pct}%</strong> funded</span>
                      </div>
                      <div className="progress">
                        <span style={{ width: `${pct}%` }} />
                      </div>
                      <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                        <Link className="btn btn-ghost" to={`/campaigns/${c._id}`}>View</Link>
                        <Link className="btn btn-primary" to={`/campaigns/${c._id}/edit`}>Edit</Link>
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