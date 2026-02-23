import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./NonprofitAuth.css";

export default function NonprofitRegister() {
  const nav = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    description: ""
  });

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  function onChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setErr("");

    try {
      // your register logic here
      nav("/dashboard");
    } catch (e) {
      setErr("Registration failed");
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
              <p className="authHint">
                It takes less than 2 minutes.
              </p>
            </div>

            {err && <div className="authAlert">{err}</div>}

            <form className="authForm" onSubmit={onSubmit}>
              <label className="field">
                <span className="label">Organization name</span>
                <input
                  className="input"
                  name="name"
                  value={form.name}
                  onChange={onChange}
                  required
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
                />
              </label>

              <label className="field">
                <span className="label">Description (optional)</span>
                <textarea
                  className="textarea"
                  name="description"
                  value={form.description}
                  onChange={onChange}
                  rows="3"
                />
              </label>

              <button className="btnPrimary" type="submit" disabled={loading}>
                {loading ? "Creating account…" : "Create account"}
              </button>
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