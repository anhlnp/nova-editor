# Phase 0 — Triage & Audit ("Frankenstein Greenfield" remediation)

Ngày thực hiện: 2026-07-11 · Phiên bản codebase: v18.0.0

Mục tiêu: trước khi refactor bất cứ thứ gì, phải (1) biết hệ thống có thực sự chạy không,
(2) có cảm biến khi nó chết, (3) có hàng rào chống hồi quy, (4) có bản đồ phụ thuộc.

---

## 1. Git forensics — KẾT LUẬN: repo lành mạnh

| Kiểm tra | Kết quả |
|---|---|
| Untracked files | 1 file (repeat-list.tsx — công việc v18.0.0 đang dở, chưa commit) |
| Ghost stubs (packages/schema, registry, Element[] path) | KHÔNG phải mất tích — bị xóa có chủ đích, ghi nhận đầy đủ trong commit `a337527` (v17.2.0) |
| TODO/FIXME/stub markers trong src | 0 |
| Ghost script tìm thấy | `nova:generate-block` trong root package.json trỏ tới `packages/registry` đã xóa → **đã gỡ bỏ** |

⚠️ Việc cần làm: commit cluster v18.0.0 (7 file) — hiện đang nằm ngoài git.

## 2. Dependency audit (madge) — KẾT LUẬN: cấu trúc KHÔNG phải Frankenstein

| Kiểm tra | Kết quả |
|---|---|
| Circular dependencies (nova-builder, 215 files) | **0** |
| Circular dependencies (packages/ai) | **0** |
| File lớn nhất | canvas.tsx — 403 dòng (sát ngưỡng WARN 400, không có file nào >700) |
| Hub thật sự (số file import) | data-stores (39), nano-states (37), supabaseAdmin (33), history (17) |

Các hub trên là **thiết kế chủ đích** (atoms = tầng abstraction theo SOLID-D, supabaseAdmin = adapter
duy nhất), không phải God files. Lưu ý: madge không resolve alias `@/` — dùng
`grep -rl 'from "@/lib/x"'` để đo coupling thật.

Lệnh tái chạy: `npx madge --circular --extensions ts,tsx apps/nova-builder/src`

## 3. Observability — Pino + Sentry (env-gated)

| Thành phần | File | Kích hoạt |
|---|---|---|
| Structured logging | `src/lib/logger.ts` — pino, JSON ra stdout, serverless-safe | luôn bật; `LOG_LEVEL` env |
| Sentry server/edge | `src/instrumentation.ts` (+ `onRequestError`) | chỉ khi `SENTRY_DSN` set |
| Sentry browser | `src/instrumentation-client.ts` | chỉ khi `NEXT_PUBLIC_SENTRY_DSN` set |
| React render crash | `src/app/global-error.tsx` | luôn bật (báo Sentry khi có DSN) |

Quy ước: route/lib code import `logger`/`routeLogger` từ `@/lib/logger` — không import
`pino` trực tiếp (SOLID-D, audit D3 sẽ bắt vi phạm).

Chưa làm (cần quyết định của chủ dự án): tạo Sentry project + đặt DSN vào env;
upload source maps (`withSentryConfig` + auth token).

## 4. Characterization tests (Playwright) — hàng rào 3 smoke tests

`playwright.config.ts` (root) + `e2e/smoke.spec.ts`. Chạy: `pnpm test:e2e`
(tự khởi động dev server :3001, reuse nếu đang chạy).

| Test | Trạng thái | Ghi chú |
|---|---|---|
| Login: form render + sai mật khẩu → lỗi hiển thị (round-trip NextAuth) | ✅ pass | không cần account |
| Load: /builder/demo boot builder + canvas iframe, 0 uncaught error | ✅ pass | public route, không cần account |
| Save: đăng nhập → mở project → Save round-trip | ⏭ skip | cần `E2E_EMAIL` + `E2E_PASSWORD` env |

**Lỗi thật tìm thấy trong quá trình dựng hàng rào** (chứng minh giá trị của nó):
- `/builder/demo` trả 500 "Cannot find module './6911.js'" — cache `.next` dev bị hỏng
  sau khi cài package mới trong lúc server cũ còn chạy. Fix: kill process trên :3001,
  `rm -rf apps/nova-builder/.next`, chạy lại → xanh. **Bài học: sau khi cài dependency
  mới, phải restart dev server với cache sạch.**
- `e2e/diagnose-demo.mjs` — script chẩn đoán một-lần (dump HTTP status + console +
  pageerror của /builder/demo), giữ lại làm công cụ triage.

## 5. Quy trình Strangler Fig (áp dụng từ giờ)

Không Big-Bang rewrite. Mỗi lần "bóp nghẹt" một mảnh:

1. **Chọn mảnh nhỏ nhất, rủi ro thấp nhất** (ưu tiên: file gần ngưỡng 400 dòng,
   hoặc WARN từ `pnpm solid:audit`).
2. **Pin hành vi hiện tại**: nếu smoke test chưa phủ luồng đó → viết thêm 1 test
   vào `e2e/` TRƯỚC khi sửa (ghi nhận hành vi đang có, kể cả khi nó sai).
3. **Tách + thiết kế lại** theo SOLID (quy tắc trong CLAUDE.md), trỏ luồng mới vào code mới.
4. **Xác minh 3 cổng**: `pnpm --filter @nova/builder build` → `pnpm test:e2e` →
   `pnpm solid:audit` — cả 3 xanh mới được xóa code cũ.
5. **Xóa vĩnh viễn code cũ trong cùng PR/commit** (không giữ "để dành" — git giữ lịch sử).
6. Ghi CHANGELOG + VERIFIED như quy trình 6 bước hiện hành.

## Trạng thái cuối Phase 0

- Build production: ✅ exit 0 (1 warning vendor có sẵn: html-embed dynamic require)
- Typecheck: ✅ sạch
- Smoke tests: ✅ 2 pass / 1 skip (cần credentials)
- Circular deps: ✅ 0
- Công cụ mới: pino, @sentry/nextjs, @playwright/test (root devDep), madge (dùng qua npx)
