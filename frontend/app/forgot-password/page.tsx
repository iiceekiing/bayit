"use client";

import { useState } from "react";
import Link from "next/link";
import { Mail, Loader2, Building2, CheckCircle2 } from "lucide-react";
import { forgotPassword } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (e: any) {
      setError(e.message ?? "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
          <h1 className="text-2xl font-bold text-navy-DEFAULT mt-6 font-serif">Forgot Password</h1>
          <p className="text-sm text-navy-muted mt-1">Enter your email to receive a reset link</p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-8 shadow-card">
          {sent ? (
            <div className="text-center py-4">
              <CheckCircle2 size={40} className="text-teal-DEFAULT mx-auto mb-4" />
              <h2 className="text-lg font-semibold text-navy-DEFAULT mb-2">Check your email</h2>
              <p className="text-sm text-navy-muted leading-relaxed mb-6">
                If <strong>{email}</strong> is registered with Bayit, you will receive a password reset link within a few minutes.
              </p>
              <Link
                href="/login"
                className="text-sm font-medium text-teal-DEFAULT hover:text-teal-dark"
              >
                Return to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-navy-muted mb-1.5 block">Email address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-faint" />
                  <input
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
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
                {loading ? <><Loader2 size={15} className="animate-spin" /> Sending…</> : "Send Reset Link"}
              </button>

              <p className="text-sm text-center text-navy-muted mt-2">
                Remember your password?{" "}
                <Link href="/login" className="text-teal-DEFAULT hover:text-teal-dark font-medium">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
