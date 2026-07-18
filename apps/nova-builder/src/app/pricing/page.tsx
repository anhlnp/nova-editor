"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { PublicNav } from "@/components/public/PublicNav";
import { PublicFooter } from "@/components/public/PublicFooter";
import { useI18n } from "@/lib/i18n";
import PayOSCheckoutModal from "@/components/PayOSCheckoutModal";
import PricingGrid from "@/components/PricingGrid";

export default function PricingPage() {
  const { t } = useI18n();
  const { status } = useSession();
  const router = useRouter();
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/settings/subscription");
    }
  }, [status, router]);

  if (status === "authenticated") {
    return null; // Tránh nhấp nháy UI khi chuyển hướng
  }

  return (
    <div style={{ minHeight: "100vh", background: "#ffffff", display: "flex", flexDirection: "column", fontFamily: "system-ui, -apple-system, sans-serif" }}>
      <PublicNav />

      <main style={{ flex: 1, padding: "64px 24px" }}>
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 56 }}>
            <h1 style={{ fontSize: "clamp(32px, 5vw, 52px)", fontWeight: 900, color: "#0f172a", letterSpacing: "-0.025em", margin: "0 0 16px" }}>
              {t.pricing.title}
            </h1>
            <p style={{ fontSize: 18, color: "#475569", margin: "0 auto", maxWidth: 480, lineHeight: 1.6 }}>
              {t.pricing.subtitle}
            </p>
          </div>

          {/* Plan cards */}
          <PricingGrid
            onSelectPlan={(tier) => {
              setSelectedTier(tier);
              setIsModalOpen(true);
            }}
          />

          {/* FAQ */}
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            <h2 style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", marginBottom: 24, textAlign: "center" }}>{t.pricing.faqTitle}</h2>
            {t.pricing.faq.map(({ q, a }) => (
              <details key={q} style={{ borderBottom: "1px solid #f1f5f9", padding: "16px 0" }}>
                <summary style={{ fontSize: 16, fontWeight: 600, color: "#0f172a", cursor: "pointer", listStyle: "none" }}>{q}</summary>
                <p style={{ fontSize: 15, color: "#475569", margin: "10px 0 0", lineHeight: 1.65 }}>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </main>

      <PublicFooter />

      <PayOSCheckoutModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        tier={selectedTier || "pro"}
      />
    </div>
  );
}
