"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { resetPassword } from "@/lib/authApi";

export default function ResetPasswordClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token") || "";
  const email = searchParams.get("email") || "";

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setSuccessMsg("");

    if (!token || !email) {
      setErr("Invalid or incomplete reset link.");
      return;
    }

    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const res = await resetPassword({
        token,
        email,
        password,
      });

      setSuccessMsg(res?.message || "Password reset successfully.");

      setTimeout(() => {
        router.replace("/nonprofit/login");
      }, 1500);
    } catch (e: any) {
      setErr(e?.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1>Set a new password</h1>

      <form onSubmit={onSubmit}>
        <input type="email" value={email} readOnly />

        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? "Updating..." : "Reset password"}
        </button>
      </form>

      {successMsg && <p>{successMsg}</p>}
      {err && <p>{err}</p>}
    </div>
  );
}