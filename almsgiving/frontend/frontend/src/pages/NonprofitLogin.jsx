import React, { useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { loginNonprofit } from "../api/auth";
import { useAuth } from "../auth/AuthContext";
import "./NonprofitAuth.css";

function IconPencil(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0 0-3L16.5 4.5a2.1 2.1 0 0 0-3 0L3 15v5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M13.5 5.5l5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconChart(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M4 19V5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M4 19h16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M8 15v-5M12 15V7M16 15v-3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconReceipt(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path
        d="M6 2h12v20l-2-1-2 1-2-1-2 1-2-1-2 1V2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 7h6M9 11h6M9 15h4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function NonprofitLogin() {
  const nav = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // If we later use protected routes and pass "from",
  // this will send them back there. Otherwise fallback to /welcome.
  const destination = location.state?.from?.pathname || "/welcome";

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  function onChange(e) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setErr("");
    setLoading(true);

    try {
      const payload = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };

      const resp = await loginNonprofit(payload);
      login(resp);
      nav(destination, { replace: true });
    } catch (e) {
      // apiFetch throws Error(msg) and attaches e.data
      setErr(e?.data?.error || e?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="authPage">
      <div className="authContainer">
        <div className="authCard">
          {/* LEFT */}
          <aside className="authAside">
            <div className="authKicker">Nonprofit Portal</div>
            <h1 className="authTitle">Welcome back</h1>
            <p className="authSub">
              Manage campaigns, track donations, and build trust with transparent
              progress.
            </p>

            <div className="authBullets">
              <div className="authBullet">
                <span className="bulletIcon" aria-hidden="true">
                  <IconPencil className="ico" />
                </span>
                <span>Create and edit campaigns</span>
              </div>

              <div className="authBullet">
                <span className="bulletIcon" aria-hidden="true">
                  <IconChart className="ico" />
                </span>
                <span>Track progress in real time</span>
              </div>

              <div className="authBullet">
                <span className="bulletIcon" aria-hidden="true">
                  <IconReceipt className="ico" />
                </span>
                <span>Keep clean donation records</span>
              </div>
            </div>

            <div className="authAsideFooter">
              <span className="small">Donor looking to give?</span>{" "}
              <Link className="link" to="/campaigns">
                Explore campaigns
              </Link>
            </div>
          </aside>

          {/* RIGHT */}
          <section className="authMain">
            <div className="authMainHead">
              <h2 className="authH2">Nonprofit login</h2>
              <p className="authHint">Use your nonprofit email and password.</p>
            </div>

            {err && <div className="authAlert">{err}</div>}

            <form className="authForm" onSubmit={onSubmit}>
              <label className="field">
                <span className="label">Email</span>
                <input
                  className="input"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={onChange}
                  placeholder="you@nonprofit.org"
                  autoComplete="email"
                  required
                />
              </label>

              <label className="field">
                <span className="label">Password</span>
                <input
                  className="input"
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={onChange}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </label>

              <button className="btnPrimary" type="submit" disabled={loading}>
                {loading ? "Logging in…" : "Log in"}
              </button>

              <div className="authRow">
                <Link className="linkBtn" to="/nonprofit/forgot-password">
                  Forgot password?
                </Link>
              </div>

              <p className="small center">
                No account yet?{" "}
                <Link className="link" to="/nonprofit/register">
                  Register
                </Link>
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