import { Link, useNavigate } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import "./CreateCampaign.css";
import { createCampaign } from "../api/campaigns";

function formatUSD(value) {
  const n = Number(String(value).replace(/[^\d.]/g, ""));
  if (!Number.isFinite(n)) return "";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function CreateCampaign() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    title: "",
    description: "",
    goalAmount: "",
    imageUrl: "",
    status: "active",
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  // Upload preview (MVP: preview only, not persisted)
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  // Prevent memory leaks from object URLs
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const titleCount = form.title.length;
  const descCount = form.description.length;

  // Accept only real web URLs (not file://)
  const imagePreviewOk = useMemo(() => {
    const u = (form.imageUrl || "").trim();
    if (!u) return false;
    if (u.startsWith("file://")) return false;
    return /^https?:\/\/.+/i.test(u);
  }, [form.imageUrl]);

  // One source of truth for previewing an image:
  const previewSrc = imagePreview || (imagePreviewOk ? form.imageUrl.trim() : "");

  const goalPretty = useMemo(() => formatUSD(form.goalAmount), [form.goalAmount]);

  const impactLine = useMemo(() => {
    const goalNum = Number(String(form.goalAmount).replace(/[^\d.]/g, ""));
    if (!Number.isFinite(goalNum) || goalNum <= 0) return "Set a goal to define your impact.";
    if (goalNum < 500) return "A focused micro-goal can move fast.";
    if (goalNum < 5000) return "A strong goal for a clear community outcome.";
    return "A major goal — perfect for a full campaign story.";
  }, [form.goalAmount]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        goalAmount: Number(String(form.goalAmount).replace(/[^\d.]/g, "")),
        status: form.status,
      };

      // Only send imageUrl if it’s a real http(s) URL.
      // Uploaded file is preview-only for MVP (not persisted yet).
      if (imagePreviewOk) payload.imageUrl = form.imageUrl.trim();

      await createCampaign(payload);

      nav("/campaigns/my", { replace: true });
    } catch (e) {
      setErr(e?.data?.error || e?.message || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="cc-page">
      <div className="cc-shell">
        {/* LEFT: Builder */}
        <section className="cc-card">
          <header className="cc-header">
            <div>
              <p className="cc-kicker">Campaign Builder</p>
              <h1>Create a campaign</h1>
              <p className="cc-subtitle">
                Turn a need into a clear story donors can trust — and support in minutes.
              </p>
            </div>

            <Link className="cc-back" to="/dashboard">
              ← Back to dashboard
            </Link>
          </header>

          {/* Visual stepper */}
          <div className="cc-steps" aria-label="Campaign setup steps">
            <div className="cc-step cc-step--active">
              <span className="cc-stepDot" />
              <span>Details</span>
            </div>
            <div className="cc-step">
              <span className="cc-stepDot" />
              <span>Funding</span>
            </div>
            <div className="cc-step">
              <span className="cc-stepDot" />
              <span>Finish</span>
            </div>
          </div>

          {/* Impact strip */}
          <div className="cc-impact">
            <div className="cc-impactLeft">
              <p className="cc-impactLabel">Impact</p>
              <p className="cc-impactText">{impactLine}</p>
            </div>
            <div className="cc-impactRight">
              <p className="cc-impactGoal">{goalPretty || "$—"}</p>
              <p className="cc-impactHint">Goal preview</p>
            </div>
          </div>

          {err ? <div className="cc-alert">{err}</div> : null}

          <form className="cc-form" onSubmit={onSubmit}>
            {/* Title */}
            <div className="cc-field">
              <div className="cc-labelRow">
                <label htmlFor="title">Title</label>
                <span className="cc-count">{titleCount}/80</span>
              </div>
              <input
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                maxLength={80}
                placeholder="e.g., School supplies for 200 students"
                required
              />
              <p className="cc-hint">Make it specific and outcome-focused.</p>
            </div>

            {/* Description */}
            <div className="cc-field">
              <div className="cc-labelRow">
                <label htmlFor="description">Description</label>
                <span className="cc-count">{descCount}/500</span>
              </div>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                maxLength={500}
                placeholder="What is this campaign raising funds for? Who will it help?"
                rows={6}
                required
              />
              <p className="cc-hint">Add who, what, where, and why it matters.</p>
            </div>

            {/* Goal + Status */}
            <div className="cc-grid">
              <div className="cc-field">
                <label htmlFor="goalAmount">Goal amount (USD)</label>
                <input
                  id="goalAmount"
                  name="goalAmount"
                  value={form.goalAmount}
                  onChange={handleChange}
                  placeholder="5000"
                  inputMode="numeric"
                  required
                />
                <p className="cc-hint">
                  Preview: <span className="cc-mono">{goalPretty || "—"}</span>
                </p>
              </div>

              <div className="cc-field">
                <label htmlFor="status">Status</label>
                <select
                  id="status"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                >
                  <option value="active">Active (public)</option>
                  <option value="draft">Draft (private)</option>
                  <option value="paused">Paused</option>
                </select>
                <p className="cc-hint">Draft won’t show on public campaigns.</p>
              </div>
            </div>

            {/* Image URL + Upload */}
            <div className="cc-grid">
              <div className="cc-field">
                <label htmlFor="imageUrl">Image URL (optional)</label>
                <input
                  id="imageUrl"
                  name="imageUrl"
                  value={form.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/photo.jpg"
                />
                <p className="cc-hint">
                  Use a direct link to a jpg/png image (not a file:// path).
                </p>
              </div>

              <div className="cc-field">
                <label htmlFor="imageFile">Upload image (jpg/png)</label>
                <input
                  id="imageFile"
                  type="file"
                  accept="image/jpeg,image/png"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setImageFile(file);

                    if (file) {
                      const url = URL.createObjectURL(file);
                      setImagePreview(url);
                    } else {
                      setImagePreview("");
                    }
                  }}
                />
                <p className="cc-hint">
                  Preview only for now (we’ll add actual uploads next).
                </p>
              </div>
            </div>

            {/* Preview */}
            {previewSrc ? (
              <div className="cc-preview">
                <p className="cc-preview__label">Image preview</p>
                <img src={previewSrc} alt="Campaign preview" />
              </div>
            ) : null}

            {/* Actions */}
            <div className="cc-actions">
              <Link className="btn btn--ghost" to="/dashboard">
                Cancel
              </Link>

              <button className="btn btn--primary" type="submit" disabled={loading}>
                {loading ? "Creating…" : "Create campaign"}
              </button>
            </div>
          </form>
        </section>

        {/* RIGHT: Live preview */}
        <aside className="cc-previewCard" aria-label="Live campaign preview">
          <div className="cc-miniHeader">
            <p className="cc-miniTitle">Live preview</p>
            <span className={`cc-pill cc-pill--${form.status}`}>{form.status}</span>
          </div>

          <div className="cc-miniMedia">
            {previewSrc ? (
              <img src={previewSrc} alt="Preview" />
            ) : (
              <div className="cc-miniPlaceholder">
                <div className="cc-miniIcon" />
                <p>Add an image to bring the story to life.</p>
              </div>
            )}
          </div>

          <div className="cc-miniBody">
            <h3 className="cc-miniH">
              {form.title.trim() || "Your campaign title will appear here"}
            </h3>
            <p className="cc-miniP">
              {form.description.trim() ||
                "Describe who this helps, what the funds will do, and why it matters."}
            </p>

            <div className="cc-miniStats">
              <div className="cc-stat">
                <p className="cc-statLabel">Goal</p>
                <p className="cc-statValue">{goalPretty || "$—"}</p>
              </div>
              <div className="cc-stat">
                <p className="cc-statLabel">Raised</p>
                <p className="cc-statValue">$0</p>
              </div>
            </div>

            <div className="cc-miniProgress">
              <div className="cc-miniBar">
                <div className="cc-miniFill" style={{ width: "0%" }} />
              </div>
              <p className="cc-miniNote">
                This is what donors will see on your public campaign page.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}