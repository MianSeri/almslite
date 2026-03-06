"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { deleteCampaign, getMyCampaigns, type Campaign } from "@/lib/campaigns";
import { resolveImageUrl } from "@/lib/resolveImageUrl";
import "./MyCampaigns.css";

function money(n: any) {
  const num = Number(n || 0);
  return num.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function percentFunded(raised: any, goal: any) {
  const g = Number(goal || 0);
  const r = Number(raised || 0);
  if (!g) return 0;
  return Math.max(0, Math.min(100, Math.round((r / g) * 100)));
}

export default function MyCampaignsPage() {
  const [items, setItems] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  async function load() {
    try {
      setLoading(true);
      setErr("");
      const data = await getMyCampaigns();
      setItems(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setErr(e?.message || "Failed to load campaigns");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onDelete(id: string) {
    if (!confirm("Delete this campaign? This cannot be undone.")) return;
    try {
      await deleteCampaign(id);
      await load();
    } catch (e: any) {
      alert(e?.message || "Failed to delete campaign");
    }
  }

  if (loading) return <div style={{ padding: 16 }}>Loading…</div>;
  if (err) return <div style={{ padding: 16 }}>Error: {err}</div>;

  return (
    <main className="page">
      <div className="container">
        <div className="mcp-header">
          <div className="mcp-headerLeft">
            <div>
              <div className="mcp-headlineRow">
                <h1 className="mcp-h1">My campaigns</h1>
                <span className="mcp-modeBadge">
                  {items.length} campaign{items.length === 1 ? "" : "s"}
                </span>
              </div>
              <p className="mcp-sub">Manage, edit, and review your fundraising campaigns.</p>
            </div>
          </div>

          <Link href="/campaigns/create" className="btn btn-primary">
            Create campaign
          </Link>
        </div>

        <div className="mcp-list">
          {items.map((c) => {
            const img = resolveImageUrl(c.imageUrl) || "";
            const pct = percentFunded(c.amountRaised, c.goalAmount);
            const raised = Number(c.amountRaised || 0);
            const goal = Number(c.goalAmount || 0);
            const status = (c.status || "active").toLowerCase();

            return (
              <article key={c._id} className="mcp-card">
                <div className="mcp-media">
                  {img ? (
                    <img src={img} alt={c.title || "Campaign"} />
                  ) : null}

                  <span className={`mcp-status ${status}`}>{status}</span>
                </div>

                <div className="mcp-body">
                  <div>
                    <h2 className="mcp-title">{c.title || "Untitled campaign"}</h2>

                    <div className="mcp-metrics">
                      <span>
                        <strong>Status:</strong> {c.status || "active"}
                      </span>
                      <span>
                        <strong>Goal:</strong> ${money(goal)}
                      </span>
                      <span>
                        <strong>Raised:</strong> ${money(raised)}
                      </span>
                      <span>
                        <strong>{pct}%</strong> funded
                      </span>
                    </div>

                    {c.description ? (
                      <p className="mcp-desc">{c.description}</p>
                    ) : (
                      <div className="mcp-callout">Add a short description to strengthen trust and clarity.</div>
                    )}
                  </div>

                  <div className="mcp-progressWrap">
                    <div className="progress" aria-label="Campaign progress">
                      <span style={{ width: `${pct}%` }} />
                    </div>
                  </div>

                  <div className="mcp-actions">
                    <Link className="btn btn-ghost" href={`/campaigns/${c._id}`}>
                      View
                    </Link>

                    <Link className="btn btn-outline" href={`/campaigns/${c._id}/edit`}>
                      Edit
                    </Link>

                    <button className="btn btn-danger" onClick={() => onDelete(c._id)}>
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </main>
  );
}