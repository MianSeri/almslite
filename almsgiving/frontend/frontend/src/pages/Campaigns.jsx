import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getCampaigns } from "../api/campaigns";

function money(n) {
  const num = Number(n || 0);
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (!campaigns.length) {
    return <p className="p" style={{ padding: 16 }}>No campaigns yet.</p>;
  }

  return (
    <div className="page">
      <div className="container">
        <div className="card card-pad">
          <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
            <div>
              <h1 className="h1" style={{ marginBottom: 6 }}>Campaigns</h1>
              <p className="p" style={{ marginTop: 0 }}>
                Browse public campaigns and support a mission.
              </p>
            </div>

            <Link className="btn btn-primary" to="/campaigns/new">
              Create a campaign
            </Link>
          </div>
        </div>

        <div className="stack" style={{ gap: 12, marginTop: 12 }}>
          {campaigns.map((c) => {
            const id = c?._id;
            const goal = Number(c?.goalAmount || 0);
            const raised = Number(c?.amountRaised || 0);
            const pct = goal ? Math.min(100, Math.round((raised / goal) * 100)) : 0;

            return (
              <div key={id || c?.title} className="card card-pad">
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <div>
                    <div style={{ fontWeight: 900, fontSize: 18 }}>
                      {c?.title || "Untitled campaign"}
                    </div>
                    {c?.description && (
                      <div className="small" style={{ marginTop: 6 }}>
                        {c.description}
                      </div>
                    )}
                  </div>

                  <span className={`badge ${c?.status || "active"}`}>
                    {c?.status || "active"}
                  </span>
                </div>

                <div style={{ marginTop: 10 }}>
                  <div className="progress" aria-label="Campaign progress">
                    <span style={{ width: `${pct}%` }} />
                  </div>

                  <div className="small" style={{ marginTop: 8, display: "flex", gap: 16, flexWrap: "wrap" }}>
                    <span><strong>Raised:</strong> ${money(raised)}</span>
                    <span><strong>Goal:</strong> ${money(goal)}</span>
                    <span><strong>{pct}%</strong> funded</span>
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {id ? (
                    <Link className="btn btn-ghost" to={`/campaigns/${id}`}>
                      View
                    </Link>
                  ) : (
                    <div className="alert alert-error" style={{ margin: 0 }}>
                      Missing campaign ID (_id) from API response.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}