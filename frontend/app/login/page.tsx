"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, Building2 } from "lucide-react";
import { login } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { token, user } = await login(form.email, form.password);
      const isAdmin = user.role === "ADMIN" || user.role === "SUPER_ADMIN";
      if (isAdmin) {
        localStorage.setItem("bayit_admin_token", token);
        localStorage.setItem("bayit_admin_user", JSON.stringify(user));
        router.push("/admin");
      } else {
        localStorage.setItem("bayit_token", token);
        localStorage.setItem("bayit_user", JSON.stringify(user));
        router.push("/dashboard");
      }
    } catch (e: any) {
      setError(e.message ?? "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-navy-DEFAULT flex items-center justify-center">
              <Building2 size={18} className="text-teal-light" />
            </div>
            <span className="font-serif text-xl font-bold text-navy-DEFAULT">Bayit</span>
          </Link>
          <h1 className="text-2xl font-bold text-navy-DEFAULT mt-6 font-serif">Welcome back</h1>
          <p className="text-sm text-navy-muted mt-1">Sign in to your account</p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-medium text-navy-muted mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-faint" />
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="you@example.com"
                  className="w-full border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-teal-DEFAULT"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-navy-muted">Password</label>
                <Link href="/forgot-password" className="text-xs text-teal-DEFAULT hover:text-teal-dark">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-faint" />
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  placeholder="Your password"
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
              {loading ? <><Loader2 size={15} className="animate-spin" /> Signing in…</> : "Sign In"}
            </button>
          </form>

          <p className="text-sm text-center text-navy-muted mt-6">
            Don't have an account?{" "}
            <Link href="/register" className="text-teal-DEFAULT hover:text-teal-dark font-medium">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
