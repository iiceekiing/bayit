"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, Building2, CheckCircle2, AlertCircle } from "lucide-react";
import { resetPassword } from "@/lib/api";

function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  if (!token) {
    return (
      <div className="text-center py-4">
        <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-navy-DEFAULT mb-2">Invalid Link</h2>
        <p className="text-sm text-navy-muted mb-6">This password reset link is missing a token. Please request a new one.</p>
        <Link href="/forgot-password" className="text-sm font-medium text-teal-DEFAULT hover:text-teal-dark">
          Request New Link
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await resetPassword(token, password);
      setDone(true);
      setTimeout(() => router.push("/login"), 2500);
    } catch (e: any) {
      setError(e.message ?? "Reset failed. Your link may have expired.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <div className="text-center py-4">
        <CheckCircle2 size={40} className="text-teal-DEFAULT mx-auto mb-4" />
        <h2 className="text-lg font-semibold text-navy-DEFAULT mb-2">Password Updated!</h2>
        <p className="text-sm text-navy-muted">Redirecting you to sign in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-xs font-medium text-navy-muted mb-1.5 block">New Password</label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-faint" />
          <input
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 8 characters"
            className="w-full border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-teal-DEFAULT"
          />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-navy-muted mb-1.5 block">Confirm New Password</label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-faint" />
          <input
            type="password"
            required
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your new password"
            className="w-full border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-teal-DEFAULT"
          />
        </div>
      </div>

      {error && (
        <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-navy-DEFAULT text-white font-medium rounded-full py-3 hover:bg-navy-light transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
      >
        {loading ? <><Loader2 size={15} className="animate-spin" /> Updating…</> : "Set New Password"}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-navy-DEFAULT flex items-center justify-center">
              <Building2 size={18} className="text-teal-light" />
            </div>
            <span className="font-serif text-xl font-bold text-navy-DEFAULT">Bayit</span>
          </Link>
          <h1 className="text-2xl font-bold text-navy-DEFAULT mt-6 font-serif">Set New Password</h1>
          <p className="text-sm text-navy-muted mt-1">Choose a strong password for your account</p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-8 shadow-card">
          <Suspense fallback={<div className="h-40 animate-pulse bg-canvas rounded-xl" />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
