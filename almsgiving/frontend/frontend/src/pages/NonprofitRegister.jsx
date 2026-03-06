import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NonprofitAuth.css";
import { registerNonprofit } from "../api/auth";
import { useAuth } from "../auth/AuthContext";

function passwordChecks(pw) {
  const s = String(pw || "");
  return {
    length: s.length >= 8,
    lower: /[a-z]/.test(s),
    upper: /[A-Z]/.test(s),
    number: /\d/.test(s),
    special: /[^A-Za-z0-9]/.test(s),
  };
}

export default function NonprofitRegister() {
  const nav = useNavigate();
  const { login } = useAuth(); // using AuthContext (single source of truth)

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    description: "",
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  const checks = useMemo(() => passwordChecks(form.password), [form.password]);
  const passwordOk =
    checks.length && checks.lower && checks.upper && checks.number && checks.special;

  const emailOk = useMemo(() => {
    const e = String(form.email || "").trim();
    if (!e) return false;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
  }, [form.email]);

  const canSubmit =
    !loading && form.name.trim().length > 1 && emailOk && passwordOk;

  async function onSubmit(e) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setErr("");
    setSuccessMsg("");

    try {
      const payload = {
        organizationName: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      };

      const res = await registerNonprofit(payload);

      // Store token + nonprofit consistently with the rest of the app
      login(res);

      setSuccessMsg("Account created. Redirecting to your welcome page…");

      window.setTimeout(() => {
        nav("/welcome", { replace: true });
      }, 850);
    } catch (e) {
      setErr(e?.data?.error || e?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authPage">
      <div className="authContainer">
        <div className="authCard">
          {/* LEFT SIDE */}
          <aside className="authAside">
            <div className="authKicker">Nonprofit Portal</div>
            <h1 className="authTitle">Start fundraising</h1>
            <p className="authSub">
              Create your nonprofit account and launch transparent campaigns in minutes.
            </p>

            <div className="authBullets">
              <div className="authBullet">
                <span className="bulletIcon">✓</span>
                <span>Launch campaigns instantly</span>
              </div>

              <div className="authBullet">
                <span className="bulletIcon">✓</span>
                <span>Track donations in real time</span>
              </div>

              <div className="authBullet">
                <span className="bulletIcon">✓</span>
                <span>Build donor trust with transparency</span>
              </div>
            </div>

            <div className="authAsideFooter">
              Already fundraising?{" "}
              <Link className="link" to="/nonprofit/login">
                Log in
              </Link>
            </div>
          </aside>

          {/* RIGHT SIDE FORM */}
          <section className="authMain">
            <div className="authMainHead">
              <h2 className="authH2">Create your nonprofit account</h2>
              <p className="authHint">It takes less than 2 minutes.</p>
            </div>

            {err && <div className="authAlert">{err}</div>}
            {successMsg && <div className="authSuccess">{successMsg}</div>}

            <form className="authForm" onSubmit={onSubmit}>
              <label className="field">
                <span className="label">Organization name</span>
                <input
                  className="input"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
                  placeholder="e.g., Bien-Être Foundation"
                  autoComplete="organization"
                />
              </label>

              <label className="field">
                <span className="label">Email</span>
                <input
                  className="input"
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={onChange}
                  required
                  placeholder="name@nonprofit.org"
                  autoComplete="email"
                />
              </label>

              <label className="field">
                <span className="label">Password</span>
                <input
                  className="input"
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={onChange}
                  required
                  placeholder="Create a strong password"
                  autoComplete="new-password"
                />

                <div className="authPwRules" aria-label="Password requirements">
                  <div className={`authRule ${checks.length ? "ok" : ""}`}>
                    {checks.length ? "✓" : "•"} 8+ characters
                  </div>
                  <div className={`authRule ${checks.upper ? "ok" : ""}`}>
                    {checks.upper ? "✓" : "•"} 1 uppercase letter
                  </div>
                  <div className={`authRule ${checks.lower ? "ok" : ""}`}>
                    {checks.lower ? "✓" : "•"} 1 lowercase letter
                  </div>
                  <div className={`authRule ${checks.number ? "ok" : ""}`}>
                    {checks.number ? "✓" : "•"} 1 number
                  </div>
                  <div className={`authRule ${checks.special ? "ok" : ""}`}>
                    {checks.special ? "✓" : "•"} 1 special character
                  </div>
                </div>
              </label>

              <label className="field">
                <span className="label">Description (optional)</span>
                <textarea
                  className="textarea"
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  rows="3"
                  placeholder="Short mission statement (optional)"
                />
              </label>

              <button className="btnPrimary" type="submit" disabled={!canSubmit}>
                {loading ? "Creating account…" : "Create account"}
              </button>

              <p className="small center" style={{ marginTop: 10, opacity: 0.8 }}>
                Security note: passwords are hashed (bcrypt) and never stored in plain text.
              </p>
            </form>
          </section>
        </div>

        <p className="small authFooter">
          Secure by design • Built for trust • AlmsGiving
        </p>
      </div>
    </div>
  );
}