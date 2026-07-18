import { test, expect } from "@playwright/test";

// FA-v1 / D10 — localization correctness. These run without credentials.

test("FA-I01: logged-out IP detect reaches /api/i18n/detect (not redirected to login)", async ({ request }) => {
  // Before the fix, /api/i18n was not in PUBLIC_PREFIXES → middleware 307'd the
  // request to /login, so IP auto-detect silently failed on first visit.
  const res = await request.get("/api/i18n/detect", {
    headers: { "cf-ipcountry": "VN" },
    maxRedirects: 0,
  });

  expect(res.status(), "detect must not redirect to /login for anonymous visitors").toBe(200);
  const body = (await res.json()) as { country: string; recommendedLocale: string };
  expect(body.country).toBe("VN");
  expect(body.recommendedLocale).toBe("vi");
});

test("FA-I01: non-VN visitor is recommended English", async ({ request }) => {
  const res = await request.get("/api/i18n/detect", {
    headers: { "cf-ipcountry": "US" },
    maxRedirects: 0,
  });
  expect(res.status()).toBe(200);
  const body = (await res.json()) as { recommendedLocale: string };
  expect(body.recommendedLocale).toBe("en");
});

test("FA-I03: <html lang> tracks the nova_locale cookie", async ({ context, page }) => {
  await context.addCookies([
    { name: "nova_locale", value: "vi", url: "http://localhost:3001" },
  ]);
  await page.goto("/login");
  await expect(page.locator("html")).toHaveAttribute("lang", "vi");
});

test("FA-I03: <html lang> defaults to en with no locale cookie", async ({ page }) => {
  await page.goto("/login");
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});

test("FA-I04: landing hero renders Vietnamese when locale = vi", async ({ context, page }) => {
  await context.addCookies([{ name: "nova_locale", value: "vi", url: "http://localhost:3001" }]);
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Tạo mọi website/ })).toBeVisible({ timeout: 30_000 });
});

test("FA-I05: <title> is localized to Vietnamese when locale = vi", async ({ context, page }) => {
  await context.addCookies([{ name: "nova_locale", value: "vi", url: "http://localhost:3001" }]);
  await page.goto("/");
  await expect(page).toHaveTitle(/Trình tạo website bằng AI/, { timeout: 30_000 });
});

test("FA-I04: pricing plan cards render Vietnamese when locale = vi", async ({ context, page }) => {
  await context.addCookies([{ name: "nova_locale", value: "vi", url: "http://localhost:3001" }]);
  await page.goto("/pricing");
  await expect(page.getByText("Nâng cấp lên Pro")).toBeVisible({ timeout: 30_000 });
});

test("FA-005: /verify-email is public and renders the verify card (not login)", async ({ page }) => {
  await page.goto("/verify-email?token=bogus");
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.getByRole("heading")).toBeVisible({ timeout: 30_000 });
});

test("FA-I02: legal pages render Vietnamese when locale = vi", async ({ context, page }) => {
  await context.addCookies([{ name: "nova_locale", value: "vi", url: "http://localhost:3001" }]);
  await page.goto("/terms");
  await expect(page.getByRole("heading", { name: "Điều khoản dịch vụ", level: 1 })).toBeVisible({ timeout: 30_000 });
  await page.goto("/privacy");
  await expect(page.getByRole("heading", { name: "Chính sách bảo mật", level: 1 })).toBeVisible({ timeout: 30_000 });
});

test("FA-005: password reset pages are public (not redirected to login)", async ({ page }) => {
  await page.goto("/forgot-password");
  await expect(page).not.toHaveURL(/\/login/);
  await expect(page.getByRole("button", { name: /Send reset link|Gửi liên kết/ })).toBeVisible({ timeout: 30_000 });

  await page.goto("/reset-password?token=abc");
  await expect(page).not.toHaveURL(/\/login/);
});
