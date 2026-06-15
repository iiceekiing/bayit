"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, Phone, Loader2, Building2 } from "lucide-react";
import { register } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { token, user } = await register(form.name, form.email, form.password, form.phone || undefined);
      localStorage.setItem("bayit_token", token);
      localStorage.setItem("bayit_user", JSON.stringify(user));
      router.push("/dashboard");
    } catch (e: any) {
      setError(e.message ?? "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const field = (
    key: keyof typeof form,
    label: string,
    icon: any,
    type = "text",
    placeholder = "",
    required = true
  ) => (
    <div>
      <label className="text-xs font-medium text-navy-muted mb-1.5 block">{label}{required && " *"}</label>
      <div className="relative">
        {icon}
        <input
          type={type}
          required={required}
          value={form[key]}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          placeholder={placeholder}
          className="w-full border border-border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-teal-DEFAULT"
        />
      </div>
    </div>
  );

  const iconClass = "absolute left-3 top-1/2 -translate-y-1/2 text-navy-faint";

  return (
    <div className="min-h-screen bg-canvas flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-navy-DEFAULT flex items-center justify-center">
              <Building2 size={18} className="text-teal-light" />
            </div>
            <span className="font-serif text-xl font-bold text-navy-DEFAULT">Bayit</span>
          </Link>
          <h1 className="text-2xl font-bold text-navy-DEFAULT mt-6 font-serif">Create your account</h1>
          <p className="text-sm text-navy-muted mt-1">Find, inspect, and own your dream property</p>
        </div>

        <div className="bg-white border border-border rounded-3xl p-8 shadow-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {field("name", "Full Name", <User size={15} className={iconClass} />, "text", "Your full name")}
            {field("email", "Email", <Mail size={15} className={iconClass} />, "email", "you@example.com")}
            {field("phone", "Phone Number", <Phone size={15} className={iconClass} />, "tel", "+234...", false)}
            {field("password", "Password", <Lock size={15} className={iconClass} />, "password", "At least 8 characters")}
            {field("confirm", "Confirm Password", <Lock size={15} className={iconClass} />, "password", "Repeat password")}

            {error && (
              <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy-DEFAULT text-white font-medium rounded-full py-3 hover:bg-navy-light transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? <><Loader2 size={15} className="animate-spin" /> Creating account…</> : "Create Account"}
            </button>
          </form>

          <p className="text-sm text-center text-navy-muted mt-6">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-DEFAULT hover:text-teal-dark font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
