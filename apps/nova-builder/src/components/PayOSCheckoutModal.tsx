"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { PLAN_CARDS } from "@/lib/plans";
import { PAYOS_PRICES_VND } from "@/lib/billing/payos";
import { UI_VARS as C } from "@/lib/uiTheme";

interface PayOSCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  tier: string;
  teamId?: string;
}

type CheckoutData = {
  qrCode: string;
  amount: number;
  orderCode: number;
  accountNumber: string;
  accountName: string;
  bin: string;
  description: string;
  isMock?: boolean;
};

export default function PayOSCheckoutModal({ isOpen, onClose, tier, teamId }: PayOSCheckoutModalProps) {
  const { data: session } = useSession();
  const [step, setStep] = useState<"details" | "qr" | "success">("details");
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(3);
  
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const plan = tier === "credits"
    ? {
        label: "AI Credits Pack",
        price: "99.000 VND",
        features: [
          "Cộng thêm 500 AI credits vào tài khoản",
          "Sử dụng vĩnh viễn không hết hạn",
          "Áp dụng ngay sau khi thanh toán thành công",
        ],
      }
    : PLAN_CARDS.find((p) => p.tier === tier);
  const vndPrice = PAYOS_PRICES_VND[tier];

  // Reset state when modal is opened/closed
  useEffect(() => {
    if (isOpen) {
      setStep("details");
      setAgreed(false);
      setLoading(false);
      setCheckoutData(null);
      setError(null);
      setCountdown(3);
    } else {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
      }
    };
  }, [isOpen]);

  const handleCreateLink = async () => {
    if (!agreed) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/payos/create-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: tier, teamId }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Không thể khởi tạo link thanh toán.");
      }
      setCheckoutData(data);
      setStep("qr");
      startPolling(data.orderCode);
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi.");
    } finally {
      setLoading(false);
    }
  };

  const startPolling = (orderCode: number) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    pollingRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/billing/payos/status?orderCode=${orderCode}`);
        const data = await res.json();
        if (data.paid) {
          if (pollingRef.current) clearInterval(pollingRef.current);
          setStep("success");
          startSuccessCountdown();
        }
      } catch (err) {
        console.error("Lỗi khi kiểm tra trạng thái thanh toán:", err);
      }
    }, 3000);
  };

  const startSuccessCountdown = () => {
    let currentCount = 3;
    const timer = setInterval(() => {
      currentCount -= 1;
      setCountdown(currentCount);
      if (currentCount <= 0) {
        clearInterval(timer);
        window.location.reload();
      }
    }, 1000);
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (!isOpen || !plan) return null;

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0, 0, 0, 0.75)", backdropFilter: "blur(4px)",
      display: "flex", justifyContent: "center", alignItems: "center",
      zIndex: 9999, padding: 16,
    }}>
      <div style={{
        background: C.card || "#1e1e2f",
        border: `1px solid ${C.border || "rgba(255,255,255,0.1)"}`,
        borderRadius: 16, width: "100%", maxWidth: 480,
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)",
        overflow: "hidden", position: "relative",
        color: C.text || "#ffffff",
        display: "flex", flexDirection: "column",
        maxHeight: "90vh",
      }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          padding: "16px 20px", borderBottom: `1px solid ${C.border || "rgba(255,255,255,0.1)"}`,
        }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
            {step === "details" && "Chi tiết dịch vụ"}
            {step === "qr" && "Quét mã chuyển khoản VietQR"}
            {step === "success" && "Thanh toán thành công"}
          </h3>
          {step !== "success" && (
            <button onClick={onClose} style={{
              background: "none", border: "none", color: C.textMuted || "rgba(255,255,255,0.6)",
              cursor: "pointer", fontSize: 20, padding: 4, display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>
              &times;
            </button>
          )}
        </div>

        {/* Content */}
        <div style={{ padding: 20, overflowY: "auto", flex: 1 }}>
          {step === "details" && !session?.user && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16, textAlign: "center", padding: "12px 0" }}>
              <div style={{ fontSize: 40 }}>🔒</div>
              <h4 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Yêu cầu đăng nhập</h4>
              <p style={{ fontSize: 13, color: C.textMuted || "rgba(255,255,255,0.6)", lineHeight: 1.5, margin: 0 }}>
                Bạn cần đăng nhập tài khoản Nova Editor để có thể thực hiện thanh toán và liên kết chính xác gói dịch vụ với tài khoản của mình.
              </p>
              <button
                onClick={() => {
                  window.location.href = `/login?callbackUrl=${encodeURIComponent(window.location.href)}`;
                }}
                style={{
                  background: C.accent || "#7c3aed", color: "#ffffff",
                  border: "none", borderRadius: 8, padding: "12px 16px",
                  fontSize: 14, fontWeight: 700, cursor: "pointer",
                  marginTop: 8,
                }}
              >
                Đăng nhập ngay
              </button>
            </div>
          )}

          {step === "details" && session?.user && (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{
                background: "rgba(124, 58, 237, 0.08)",
                border: "1px solid rgba(124, 58, 237, 0.2)",
                borderRadius: 8, padding: 16, textAlign: "center"
              }}>
                <div style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.05em", color: C.accentText || "#a78bfa" }}>Gói dịch vụ đã chọn</div>
                <div style={{ fontSize: 24, fontWeight: 800, margin: "4px 0" }}>{plan.label}</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: C.success || "#10b981" }}>
                  {vndPrice ? `${vndPrice.toLocaleString("vi-VN")} VND` : plan.price}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: C.textDim }}>Các tính năng nổi bật:</div>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {plan.features.map((feat) => (
                    <li key={feat} style={{ fontSize: 13, display: "flex", alignItems: "flex-start", gap: 8, color: C.textMuted }}>
                      <span style={{ color: C.success || "#10b981", fontWeight: "bold" }}>✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {error && (
                <div style={{
                  background: "rgba(239, 68, 68, 0.1)",
                  border: `1px solid ${C.error || "#ef4444"}`,
                  color: C.error || "#ef4444", borderRadius: 8, padding: 10,
                  fontSize: 13, textAlign: "center",
                }}>
                  {error}
                </div>
              )}

              <label style={{ display: "flex", gap: 10, alignItems: "flex-start", cursor: "pointer", marginTop: 8 }}>
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  style={{ marginTop: 3 }}
                />
                <span style={{ fontSize: 12, color: C.textMuted || "rgba(255,255,255,0.6)", lineHeight: 1.4 }}>
                  Tôi đồng ý với các điều khoản dịch vụ và chính sách nâng cấp tài khoản của Nova Editor.
                </span>
              </label>

              <button
                onClick={handleCreateLink}
                disabled={!agreed || loading}
                style={{
                  background: agreed ? (C.accent || "#7c3aed") : "rgba(255,255,255,0.05)",
                  color: agreed ? "#ffffff" : "rgba(255,255,255,0.3)",
                  border: "none", borderRadius: 8, padding: "12px 16px",
                  fontSize: 14, fontWeight: 700, cursor: agreed && !loading ? "pointer" : "not-allowed",
                  transition: "background 0.2s", display: "flex", justifyContent: "center", alignItems: "center",
                  marginTop: 8,
                }}
              >
                {loading ? "Đang xử lý..." : "Tiến hành thanh toán"}
              </button>
            </div>
          )}

          {step === "qr" && checkoutData && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
              {/* QR Code */}
              <div style={{
                background: "#ffffff", padding: 12, borderRadius: 12,
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                display: "flex", justifyContent: "center", alignItems: "center",
                border: "1px solid rgba(0,0,0,0.05)",
              }}>
                <img
                  src={`https://img.vietqr.io/image/${checkoutData.bin}-${checkoutData.accountNumber}-qr_only.png?amount=${checkoutData.amount}&addInfo=${encodeURIComponent(checkoutData.description)}&accountName=${encodeURIComponent(checkoutData.accountName)}`}
                  alt="VietQR PayOS"
                  style={{ width: 220, height: 220, objectFit: "contain" }}
                />
              </div>

              <div style={{ textAlign: "center", fontSize: 12, color: C.textMuted }}>
                Quét mã QR bằng ứng dụng Ngân hàng để thanh toán tự động, hoặc chuyển khoản thủ công theo thông tin bên dưới:
              </div>

              {/* Payment Details */}
              <div style={{
                width: "100%", background: "rgba(255,255,255,0.02)",
                border: `1px solid ${C.border || "rgba(255,255,255,0.08)"}`,
                borderRadius: 8, padding: 12, display: "flex", flexDirection: "column", gap: 10,
              }}>
                {[
                  { label: "Chủ tài khoản", value: checkoutData.accountName, field: "name" },
                  { label: "Số tài khoản", value: checkoutData.accountNumber, field: "account" },
                  { label: "Số tiền", value: `${checkoutData.amount.toLocaleString("vi-VN")} VND`, field: "amount", rawValue: String(checkoutData.amount) },
                  { label: "Nội dung chuyển khoản", value: checkoutData.description, field: "desc", highlight: true },
                ].map((item) => (
                  <div key={item.label} style={{
                    display: "flex", justifyContent: "space-between", alignItems: "center",
                    fontSize: 13, borderBottom: "1px solid rgba(255,255,255,0.03)", paddingBottom: 6,
                  }}>
                    <span style={{ color: C.textMuted }}>{item.label}</span>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{
                        fontWeight: item.highlight ? 800 : 600,
                        color: item.highlight ? (C.warning || "#f59e0b") : C.text,
                        background: item.highlight ? "rgba(245, 158, 11, 0.1)" : "transparent",
                        padding: item.highlight ? "2px 6px" : 0,
                        borderRadius: 4,
                      }}>
                        {item.value}
                      </span>
                      <button
                        onClick={() => copyToClipboard(item.rawValue || item.value, item.field)}
                        style={{
                          background: "none", border: "none", color: C.accentText || "#a78bfa",
                          fontSize: 11, cursor: "pointer", padding: "2px 4px",
                          borderRadius: 4, display: "flex", alignItems: "center", gap: 2,
                        }}
                      >
                        {copiedField === item.field ? "Đã chép" : "Sao chép"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Polling status */}
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: C.accentText || "#a78bfa", fontSize: 13, fontWeight: 600 }}>
                  <span className="pulsing-dot" style={{
                    width: 8, height: 8, borderRadius: "50%", background: C.accent || "#7c3aed",
                    boxShadow: "0 0 8px #7c3aed", animation: "pulse 1.5s infinite"
                  }} />
                  <span>Đang chờ thanh toán (tự động phát hiện)...</span>
                </div>

                {process.env.NODE_ENV === "development" && (
                  <button
                    onClick={async (e) => {
                      e.preventDefault();
                      try {
                        const sessionUser = session?.user as { id?: string } | undefined;
                        const currentUserId = sessionUser?.id || "00000000-0000-0000-0000-000000000000";
                        const res = await fetch("/api/billing/payos/simulate-success", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            orderCode: checkoutData.orderCode,
                            plan: tier,
                            userId: currentUserId,
                            teamId: teamId || "",
                          }),
                        });
                        if (res.ok) {
                          console.log("Giả lập thành công!");
                        }
                      } catch (err) {
                        console.error("Lỗi giả lập:", err);
                      }
                    }}
                    style={{
                      background: C.success || "#10b981", color: "#ffffff",
                      border: "none", borderRadius: 6, padding: "8px 12px",
                      fontSize: 12, fontWeight: 700, cursor: "pointer",
                      marginTop: 8, boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                    }}
                  >
                    Giả lập thanh toán thành công (Chỉ dành cho Test)
                  </button>
                )}
              </div>
            </div>
          )}

          {step === "success" && (
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "20px 0" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.1)", border: `2px solid ${C.success || "#10b981"}`,
                display: "flex", justifyContent: "center", alignItems: "center",
                color: C.success || "#10b981", fontSize: 32, fontWeight: "bold",
                animation: "scaleIn 0.5s ease-out",
              }}>
                ✓
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 800, color: C.success || "#10b981", margin: 0 }}>Giao dịch thành công!</h2>
              <p style={{ textAlign: "center", fontSize: 14, color: C.textDim, margin: 0, lineHeight: 1.5 }}>
                Cảm ơn bạn đã nâng cấp dịch vụ của Nova Editor. Hệ thống sẽ tự động cập nhật tài khoản của bạn.
              </p>
              <div style={{ fontSize: 12, color: C.textMuted, marginTop: 12 }}>
                Đang tải lại trang sau {countdown} giây...
              </div>
            </div>
          )}
        </div>

        {/* Global Styles for Animations */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes pulse {
            0% { transform: scale(0.9); opacity: 0.6; }
            50% { transform: scale(1.2); opacity: 1; }
            100% { transform: scale(0.9); opacity: 0.6; }
          }
          @keyframes scaleIn {
            0% { transform: scale(0); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}} />
      </div>
    </div>
  );
}
