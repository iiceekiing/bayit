import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: { default: "Bayit — Find Your Home", template: "%s | Bayit" },
  description: "Nigeria's premium real estate marketplace. Buy, sell, rent, and inspect properties with confidence.",
  keywords: ["real estate", "properties", "Nigeria", "buy house", "rent apartment"],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
