"use client";

import { useCallback } from "react";

interface PaystackConfig {
  email: string;
  amount: number; // in kobo
  reference: string;
  onSuccess: (reference: string) => void;
  onCancel: () => void;
}

declare global {
  interface Window {
    PaystackPop?: {
      setup(config: {
        key: string;
        email: string;
        amount: number;
        ref: string;
        currency: string;
        callback: (response: { reference: string }) => void;
        onClose: () => void;
      }): { openIframe(): void };
    };
  }
}

function loadPaystackScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) { resolve(); return; }
    const existing = document.getElementById("paystack-js");
    if (existing) {
      existing.addEventListener("load", () => resolve());
      return;
    }
    const script = document.createElement("script");
    script.id = "paystack-js";
    script.src = "https://js.paystack.co/v1/inline.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Paystack script"));
    document.head.appendChild(script);
  });
}

export function usePaystack({ email, amount, reference, onSuccess, onCancel }: PaystackConfig) {
  const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_KEY ?? "";

  const initiate = useCallback(async () => {
    if (!publicKey) {
      console.error("NEXT_PUBLIC_PAYSTACK_KEY is not set");
      return;
    }
    await loadPaystackScript();
    if (!window.PaystackPop) {
      console.error("PaystackPop not available after script load");
      return;
    }
    const handler = window.PaystackPop.setup({
      key: publicKey,
      email,
      amount,
      ref: reference,
      currency: "NGN",
      callback: (response) => onSuccess(response.reference),
      onClose: onCancel,
    });
    handler.openIframe();
  }, [publicKey, email, amount, reference, onSuccess, onCancel]);

  return { initiate };
}
