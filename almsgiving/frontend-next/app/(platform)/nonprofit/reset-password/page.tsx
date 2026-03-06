"use client";

import { useState } from "react";
import { forgotPassword } from "@/lib/authApi";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    setErr("");
    setSuccessMsg("");

    try {
      setLoading(true);

      const res = await forgotPassword(email);

      setSuccessMsg(
        res?.message || "If that email exists, a reset link was sent."
      );
    } catch (err: any) {
      setErr(err?.message || "Failed to send reset link");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Reset your password</h1>

      <form onSubmit={onSubmit}>
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send reset link"}
        </button>
      </form>

      {successMsg && <p>{successMsg}</p>}
      {err && <p>{err}</p>}
    </div>
  );
}