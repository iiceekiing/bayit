"use client";

import { useEffect, useState } from "react";
import { Settings, Loader2, CheckCircle } from "lucide-react";
import { getPaymentSettings, updatePaymentSettings, getAdminToken } from "@/lib/api";

export default function AdminSettingsPage() {
  const [form, setForm] = useState({
    bankName: "",
    accountName: "",
    accountNumber: "",
    instructions: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    getPaymentSettings()
      .then((s) => setForm({
        bankName: s.bankName ?? "",
        accountName: s.accountName ?? "",
        accountNumber: s.accountNumber ?? "",
        instructions: s.instructions ?? "",
      }))
      .catch(() => null)
      .finally(() => setLoading(false));
  }, []);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const token = getAdminToken();
    if (!token) return;
    setSaving(true);
    setError("");
    setSaved(false);
    try {
      await updatePaymentSettings(form, token);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) {
      setError(e.message ?? "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-navy-DEFAULT">Settings</h1>
        <p className="text-sm text-navy-muted mt-0.5">Payment account details shown to users</p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-6 h-6 rounded-full border-2 border-teal-DEFAULT border-t-transparent animate-spin" />
        </div>
      ) : (
        <div className="bg-white border border-border rounded-2xl p-6">
          <h2 className="text-sm font-semibold text-navy-DEFAULT mb-5 flex items-center gap-2">
            <Settings size={15} className="text-teal-DEFAULT" /> Bank Account Details
          </h2>
          <form onSubmit={handleSave} className="space-y-4">
            {[
              { key: "bankName" as const, label: "Bank Name", placeholder: "e.g. Zenith Bank" },
              { key: "accountName" as const, label: "Account Name", placeholder: "Business account name" },
              { key: "accountNumber" as const, label: "Account Number", placeholder: "10-digit account number" },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="text-xs font-medium text-navy-muted mb-1.5 block">{label}</label>
                <input
                  required
                  value={form[key]}
                  onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
                  placeholder={placeholder}
                  className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-DEFAULT"
                />
              </div>
            ))}

            <div>
              <label className="text-xs font-medium text-navy-muted mb-1.5 block">Payment Instructions</label>
              <textarea
                rows={3}
                value={form.instructions}
                onChange={(e) => setForm((f) => ({ ...f, instructions: e.target.value }))}
                placeholder="Additional instructions for payers (optional)…"
                className="w-full border border-border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-teal-DEFAULT resize-none"
              />
            </div>

            {error && <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            {saved && (
              <div className="flex items-center gap-2 text-sm text-teal-DEFAULT">
                <CheckCircle size={14} /> Settings saved successfully.
              </div>
            )}

            <button type="submit" disabled={saving}
              className="bg-navy-DEFAULT text-white text-sm font-medium rounded-full px-6 py-2.5 hover:bg-navy-light transition-colors disabled:opacity-60 flex items-center gap-2">
              {saving ? <><Loader2 size={14} className="animate-spin" /> Saving…</> : "Save Settings"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
