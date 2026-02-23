import { useState } from "react";
import { Link } from "react-router-dom";
import "./NonprofitAuth.css";

export default function NonprofitForgotPassword() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e) {
    e.preventDefault();

    // MVP behavior: pretend we sent an email without revealing whether account exists.
    setSubmitted(true);
  }

  return (
    <div className="authPage">
      <div className="authContainer">
        <div className="authCard authSingle">
          <section className="authMain">
            <div className="authMainHead">
              <div className="authKicker">Nonprofit Portal</div>
              <h1 className="authTitle" style={{ fontSize: 34 }}>
                Reset your password
              </h1>
              <p className="authHint">
                Enter your nonprofit email. If an account exists, we’ll send reset instructions.
              </p>
            </div>

            {!submitted ? (
              <form className="authForm" onSubmit={onSubmit}>
                <label className="field">
                  <span className="label">Email</span>
                  <input
                    className="input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@nonprofit.org"
                    autoComplete="email"
                    required
                  />
                </label>

                <button className="btnPrimary" type="submit">
                  Send reset link
                </button>

                <p className="small center" style={{ marginTop: 10 }}>
                  Remembered it?{" "}
                  <Link className="link" to="/nonprofit/login">
                    Back to login
                  </Link>
                </p>
              </form>
            ) : (
              <div className="resetSuccess">
                <h2 className="authH2" style={{ marginTop: 0 }}>
                  Check your inbox
                </h2>
                <p className="small" style={{ marginTop: 6 }}>
                  If an account exists for <strong>{email}</strong>, you’ll receive an email with
                  reset instructions shortly.
                </p>

                <div style={{ marginTop: 14 }}>
                  <Link className="btnPrimary" to="/nonprofit/login" style={{ display: "inline-flex" }}>
                    Back to login
                  </Link>
                </div>
              </div>
            )}
          </section>
        </div>

        <p className="small authFooter">
          Secure by design • Built for trust • AlmsGiving
        </p>
      </div>
    </div>
  );
}