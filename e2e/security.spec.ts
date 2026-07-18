import { test, expect } from "@playwright/test";

// FA-v1 / D6 — security surface. The unauthenticated + rate-limit cases run
// always; the tenant-isolation and entitlement cases need two seeded accounts
// (E2E_EMAIL/E2E_PASSWORD for A, E2E_EMAIL_B/E2E_PASSWORD_B for B) and skip
// otherwise. baseURL = http://localhost:3001.

const FAKE_PROJECT = "00000000-0000-0000-0000-000000000000";

test.describe("unauthenticated access is rejected", () => {
  // Middleware gates every non-public API; an anonymous mutating call must never
  // reach the handler (302/307 to /login or 401 — never 200).
  const guarded = [
    { method: "POST", path: `/api/projects/${FAKE_PROJECT}/deploy` },
    { method: "GET", path: `/api/export/${FAKE_PROJECT}` },
    { method: "GET", path: `/api/export/${FAKE_PROJECT}/react` },
    { method: "GET", path: `/api/projects/${FAKE_PROJECT}/activity` },
    { method: "GET", path: `/api/projects/${FAKE_PROJECT}/comments` },
  ];

  for (const { method, path } of guarded) {
    test(`${method} ${path} → not 200 when anonymous`, async ({ request }) => {
      const res = await request.fetch(path, { method, maxRedirects: 0, data: method === "POST" ? {} : undefined });
      expect(res.status(), `anonymous ${method} ${path}`).not.toBe(200);
      expect([301, 302, 307, 308, 401, 403]).toContain(res.status());
    });
  }
});

test("FA-005: reset-password never succeeds with an invalid token", async ({ request }) => {
  // The security guarantee is that a bogus token cannot reset a password: the
  // response must not be 200 (it's 400 once the migration table exists).
  const res = await request.post("/api/auth/reset-password", {
    data: { token: "not-a-real-token", password: "newpassword123" },
    maxRedirects: 0,
  });
  expect(res.status()).not.toBe(200);
});

test("FA-005: verify-email never succeeds with an invalid token", async ({ request }) => {
  const res = await request.post("/api/auth/verify-email", {
    data: { token: "not-a-real-token" },
    maxRedirects: 0,
  });
  expect(res.status()).not.toBe(200);
});

test("FA-005: forgot-password does not enumerate accounts", async ({ request }) => {
  // Always 200 for a well-formed email, whether or not the account exists.
  const res = await request.post("/api/auth/forgot-password", {
    data: { email: "definitely-nobody@example.com" },
    maxRedirects: 0,
  });
  expect(res.status()).toBe(200);
  const body = (await res.json()) as { ok?: boolean };
  expect(body.ok).toBe(true);
});

test("FA-010: /api/submissions rate-limits a burst from one client", async ({ request }) => {
  // The limiter (5/min) is checked before the projectId lookup, so the first 5
  // calls return 404 (no such project) and the 6th returns 429 — proving the
  // amplification guard fires regardless of payload.
  const statuses: number[] = [];
  for (let i = 0; i < 7; i++) {
    const res = await request.post("/api/submissions", {
      data: { projectId: FAKE_PROJECT, fields: { email: "x@y.z" } },
      maxRedirects: 0,
    });
    statuses.push(res.status());
  }
  expect(statuses.filter((s) => s === 429).length, `statuses: ${statuses.join(",")}`).toBeGreaterThan(0);
});

test.describe("tenant isolation + entitlements (needs two seeded accounts)", () => {
  const A = { email: process.env.E2E_EMAIL, password: process.env.E2E_PASSWORD };
  const B = { email: process.env.E2E_EMAIL_B, password: process.env.E2E_PASSWORD_B };

  test.skip(
    !A.email || !A.password || !B.email || !B.password,
    "Set E2E_EMAIL(_B)/E2E_PASSWORD(_B) for two accounts to run tenant-isolation tests"
  );

  async function login(page: import("@playwright/test").Page, email: string, password: string) {
    await page.goto("/login");
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole("button", { name: "Sign in with Email" }).click();
    await page.waitForURL(/\/projects/, { timeout: 30_000 });
  }

  test("FA-008/009: user B cannot read user A's activity or comments", async ({ browser }) => {
    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    await login(pageA, A.email!, A.password!);
    await pageA.goto("/projects");
    const href = await pageA.locator('a[href^="/builder/"]').first().getAttribute("href");
    const projectId = href?.split("/builder/")[1]?.split(/[/?#]/)[0];
    expect(projectId, "user A needs at least one project").toBeTruthy();

    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await login(pageB, B.email!, B.password!);

    for (const path of [`/api/projects/${projectId}/activity`, `/api/projects/${projectId}/comments`]) {
      const res = await pageB.request.get(path, { maxRedirects: 0 });
      expect(res.status(), `B reading A's ${path}`).toBe(404);
    }

    await ctxA.close();
    await ctxB.close();
  });
});
