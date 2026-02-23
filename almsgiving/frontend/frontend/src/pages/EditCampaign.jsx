import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { getCampaign, updateCampaign } from "../api/campaigns";
import "./EditCampaign.css";

export default function EditCampaign() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    goalAmount: "",
    description: "",
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError("");
        const c = await getCampaign(id);

        setForm({
          title: c?.title ?? "",
          goalAmount: c?.goalAmount ?? "",
          description: c?.description ?? "",
        });
      } catch (err) {
        setError(err?.message || "Failed to load campaign");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault(); // prevents full page reload (common cause of “Not found”)
    try {
      setSaving(true);
      setError("");

      // Validate
      const goal = Number(form.goalAmount);
      if (!form.title.trim()) return setError("Title is required.");
      if (!Number.isFinite(goal) || goal <= 0) return setError("Goal amount must be a positive number.");

      await updateCampaign(id, {
        title: form.title.trim(),
        goalAmount: goal,
        description: form.description.trim(),
      });

      // Redirect to a REAL route that exists:
      navigate(`/campaigns/${id}`);
      // If your detail route is different, change this line to match your App routes.
    } catch (err) {
      setError(err?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="container">
          <p className="p">Loading…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="container">
        <div className="edit-shell">
          <div className="edit-head">
            <div>
              <h1 className="h1">Edit Campaign</h1>
              <p className="muted">Update details donors will see on your campaign page.</p>
            </div>
            <Link className="btn btn-ghost" to={`/campaigns/${id}`}>
              Back
            </Link>
          </div>

          {error && <div className="alert">{error}</div>}

          <form className="card form" onSubmit={onSubmit}>
            <label className="field">
              <span className="label">Title</span>
              <input
                className="input"
                name="title"
                value={form.title}
                onChange={onChange}
                placeholder="Food Bank"
                autoComplete="off"
              />
            </label>

            <label className="field">
              <span className="label">Goal Amount</span>
              <input
                className="input"
                name="goalAmount"
                value={form.goalAmount}
                onChange={onChange}
                placeholder="5000"
                inputMode="numeric"
              />
            </label>

            <label className="field">
              <span className="label">Description</span>
              <textarea
                className="textarea"
                name="description"
                value={form.description}
                onChange={onChange}
                rows={5}
                placeholder="What will this campaign accomplish?"
              />
            </label>

            <div className="actions">
              <button className="btn btn-primary" type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save changes"}
              </button>

              <Link className="btn btn-outline" to={`/campaigns/${id}`}>
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}