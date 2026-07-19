"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { UI_VARS as C, FONT } from "@/lib/uiTheme";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/react";

interface Transaction {
  order_code: string;
  provider: string;
  kind: string;
  amount: number | null;
  plan: string | null;
  status: string | null;
  created_at: string;
}

export default function SubscriptionHistoryPage() {
  const router = useRouter();
  const [history, setHistory] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/billing/payos/history")
      .then((r) => r.json())
      .then((json: { history?: Transaction[] }) => {
        if (json.history) {
          setHistory(json.history);
        }
      })
      .catch((err) => console.error("Lỗi khi tải lịch sử giao dịch:", err))
      .finally(() => setLoading(false));
  }, []);

  const formatDateTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return isoString;
    }
  };

  const formatAmount = (amount: number | null) => {
    if (amount === null || amount === undefined) return "10.000 VND"; // default test price
    return `${amount.toLocaleString("vi-VN")} VND`;
  };

  const getPlanLabel = (plan: string | null, kind: string) => {
    if (!plan) return kind === "credits" ? "500 Credits Pack" : "Gói Pro";
    switch (plan.toLowerCase()) {
      case "pro":
        return "Gói Pro";
      case "max":
        return "Gói Max";
      case "team":
        return "Gói Team";
      case "credits":
        return "500 Credits Pack";
      default:
        return plan;
    }
  };

  return (
    <div style={{ background: C.bg, minHeight: "100vh", padding: "28px 32px", fontFamily: C.font, color: C.text }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        
        {/* Header navigation using HeroUI Breadcrumbs */}
        <div style={{ marginBottom: 24 }}>
          <Breadcrumbs size="md">
            <BreadcrumbItem onClick={() => router.push("/settings/subscription")} style={{ cursor: "pointer" }}>
              Subscription
            </BreadcrumbItem>
            <BreadcrumbItem>Lịch sử giao dịch</BreadcrumbItem>
          </Breadcrumbs>
        </div>

        {loading ? (
          <div style={{ color: C.textMuted, fontSize: FONT.sm, textAlign: "center", padding: "40px 0" }}>
            <span style={{ 
              width: 24, height: 24, 
              border: "3px solid rgba(255,255,255,0.1)", 
              borderTopColor: C.accent || "#7c3aed", 
              borderRadius: "50%", 
              display: "inline-block", 
              animation: "spin 0.7s linear infinite",
              marginRight: 10,
              verticalAlign: "middle"
            }} />
            Đang tải lịch sử giao dịch...
          </div>
        ) : history.length === 0 ? (
          <div style={{ 
            background: C.card, 
            border: `1px solid ${C.border}`, 
            borderRadius: 12, 
            padding: "48px 24px", 
            textAlign: "center", 
            color: C.textMuted 
          }}>
            <svg width="48" height="48" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} style={{ margin: "0 auto 16px", color: "rgba(255,255,255,0.2)" }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
            </svg>
            <div style={{ fontSize: FONT.md, fontWeight: 600, color: C.text, marginBottom: 6 }}>Chưa có giao dịch nào</div>
            <div style={{ fontSize: FONT.sm }}>Lịch sử giao dịch chuyển khoản VietQR của bạn sẽ hiển thị tại đây.</div>
          </div>
        ) : (
          <div style={{ 
            background: C.card, 
            border: `1px solid ${C.border}`, 
            borderRadius: 12, 
            overflow: "hidden",
            boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
          }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: FONT.sm }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${C.border}`, background: "rgba(255,255,255,0.02)" }}>
                    <th style={{ padding: "14px 16px", color: C.textMuted, fontWeight: 600 }}>Mã đơn hàng</th>
                    <th style={{ padding: "14px 16px", color: C.textMuted, fontWeight: 600 }}>Gói mua</th>
                    <th style={{ padding: "14px 16px", color: C.textMuted, fontWeight: 600 }}>Số tiền</th>
                    <th style={{ padding: "14px 16px", color: C.textMuted, fontWeight: 600 }}>Cổng thanh toán</th>
                    <th style={{ padding: "14px 16px", color: C.textMuted, fontWeight: 600 }}>Thời gian</th>
                    <th style={{ padding: "14px 16px", color: C.textMuted, fontWeight: 600, textAlign: "right" }}>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((tx) => (
                    <tr key={tx.order_code} style={{ borderBottom: `1px solid ${C.border}`, transition: "background 0.2s" }} onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.01)"} onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}>
                      <td style={{ padding: "14px 16px", fontFamily: C.mono || "monospace", color: C.textDim, fontWeight: 500 }}>
                        {tx.order_code}
                      </td>
                      <td style={{ padding: "14px 16px", color: C.text, fontWeight: 600 }}>
                        {getPlanLabel(tx.plan, tx.kind)}
                      </td>
                      <td style={{ padding: "14px 16px", color: C.accentText || "#a78bfa", fontWeight: 700 }}>
                        {formatAmount(tx.amount)}
                      </td>
                      <td style={{ padding: "14px 16px", color: C.textMuted, textTransform: "uppercase", fontSize: FONT.xs, fontWeight: 600 }}>
                        {tx.provider}
                      </td>
                      <td style={{ padding: "14px 16px", color: C.textDim }}>
                        {formatDateTime(tx.created_at)}
                      </td>
                      <td style={{ padding: "14px 16px", textAlign: "right" }}>
                        <span style={{ 
                          background: "rgba(16, 185, 129, 0.1)", 
                          color: C.success || "#10b981", 
                          border: `1px solid rgba(16, 185, 129, 0.2)`,
                          borderRadius: 20, 
                          padding: "2px 8px", 
                          fontSize: FONT.xs, 
                          fontWeight: 700 
                        }}>
                          {tx.status || "Thành công"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
      <style>{`
        @keyframes spin { 
          to { transform: rotate(360deg); } 
        }
      `}</style>
    </div>
  );
}
