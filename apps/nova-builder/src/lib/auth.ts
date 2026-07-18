// NextAuth configuration — GitHub, Google, and Email+Password providers.
// All three give the same account type; GitHub is NOT required for any feature.
// GitHub connection unlocks git sync (push/pull) as an optional add-on.
import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { getAppUrl } from "@/lib/appUrl";

function buildProviders() {
  const providers: NextAuthOptions["providers"] = [];

  // GitHub — silently excluded if env vars are missing (e.g. local dev without GitHub app).
  if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
    providers.push(
      GitHubProvider({
        clientId: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        authorization: {
          params: {
            scope: "read:user user:email",
            prompt: "select_account"
          },
        },
        token: {
          async request({ provider, params }) {
            const response = await fetch("https://github.com/login/oauth/access_token", {
              method: "POST",
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Accept: "application/json",
              },
              body: new URLSearchParams({
                client_id: provider.clientId as string,
                client_secret: provider.clientSecret as string,
                code: params.code as string,
                redirect_uri: provider.callbackUrl,
              }),
            });
            const tokens = await response.json();
            if (tokens.error) {
              throw new Error(`GitHub token exchange failed: ${tokens.error_description || tokens.error}`);
            }
            if (!tokens.access_token) {
              throw new Error("GitHub token exchange did not return an access token");
            }
            return { tokens };
          },
        },
        userinfo: {
          url: "https://api.github.com/user",
          async request({ tokens }) {
            if (!tokens.access_token) {
              throw new Error("No access token available for GitHub userinfo request");
            }
            const profileRes = await fetch("https://api.github.com/user", {
              headers: {
                Authorization: `Bearer ${tokens.access_token}`,
                "User-Agent": "nova-editor",
              },
            });

            if (!profileRes.ok) {
              const errBody = await profileRes.json().catch(() => ({}));
              throw new Error(
                `GitHub userinfo fetch failed (status ${profileRes.status}): ${errBody.message || profileRes.statusText || JSON.stringify(errBody)
                }`
              );
            }
            const profile = await profileRes.json();

            if (!profile.email) {
              const res = await fetch("https://api.github.com/user/emails", {
                headers: {
                  Authorization: `Bearer ${tokens.access_token}`,
                  "User-Agent": "nova-editor",
                },
              });
              if (res.ok) {
                const emails = await res.json();
                profile.email = (emails.find((e: { primary: boolean; email: string }) => e.primary) ?? emails[0])?.email;
              }
            }
            return profile;
          },
        },
      })
    );
  }

  // Google — primary recommended sign-in method.
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        authorization: {
          params: {
            prompt: "select_account"
          }
        }
      })
    );
  }

  // Email + password — always enabled; no env vars required.
  providers.push(
    CredentialsProvider({
      name: "Email",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const { getSupabase } = await import("@/lib/supabase-server");
        const db = getSupabase();
        const { data } = await db
          .from("users")
          .select("id, email, display_name, password_hash")
          .eq("provider", "email")
          .eq("email", credentials.email)
          .maybeSingle();
        const row = data as {
          id: string;
          email: string;
          display_name: string | null;
          password_hash: string | null;
        } | null;
        if (!row?.password_hash) return null;
        const valid = await bcrypt.compare(credentials.password, row.password_hash);
        if (!valid) return null;
        return { id: row.id, email: row.email, name: row.display_name ?? row.email };
      },
    })
  );

  return providers;
}

export const authOptions: NextAuthOptions = {
  providers: buildProviders(),

  useSecureCookies:
    process.env.NODE_ENV === "production" ||
    getAppUrl().startsWith("https://") ||
    !!process.env.CF_PAGES_URL ||
    !!process.env.VERCEL,

  pages: {
    signIn: "/login",
    newUser: "/projects",
    error: "/login",
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {
    async redirect({ url, baseUrl }) {
      let canonical = getAppUrl() || baseUrl;
      if (
        canonical.includes("localhost") ||
        canonical.includes("127.0.0.1") ||
        process.env.NODE_ENV === "production"
      ) {
        try {
          const { headers } = await import("next/headers");
          const hdrs = await headers();
          const host = hdrs.get("x-forwarded-host") || hdrs.get("host");
          if (host && host !== "null" && !host.includes("localhost") && !host.includes("127.0.0.1")) {
            const proto = hdrs.get("x-forwarded-proto") || "https";
            canonical = `${proto}://${host}`;
          }
        } catch {
          // Ignore if headers() is unavailable outside server request context
        }
      }

      // If url is a relative path (e.g., "/projects" or "/builder/123"), resolve against canonical
      // so the client browser and NextAuth client (new URL(data.url)) receive a valid absolute URL.
      if (url.startsWith("/")) {
        return new URL(url, canonical).toString();
      }
      try {
        const urlObj = new URL(url);
        // If same origin as canonical app URL, return url
        if (urlObj.origin === new URL(canonical).origin) {
          return url;
        }
        // Allow if origin matches baseUrl AND baseUrl is not localhost in production
        const isBaseLocal = baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1");
        if (urlObj.origin === new URL(baseUrl).origin && (!isBaseLocal || process.env.NODE_ENV !== "production")) {
          return url;
        }
      } catch {
        // Ignore invalid URLs
      }
      return canonical;
    },

    async jwt({ token, account, user, profile }) {
      if (user?.id) {
        token.id = user.id;
        token.sub = user.id;
      }
      if (account) {
        if (account.provider === "credentials") {
          token.provider = "email";
          token.email = user.email ?? undefined;
          token.displayName = user.name ?? user.email ?? undefined;
        } else {
          token.provider = account.provider;
          token.email = (profile as { email?: string })?.email ?? token.email;

          if (account.provider === "github") {
            token.accessToken = account.access_token;
            token.githubId = (profile as { id?: number })?.id?.toString();
            token.githubLogin = (profile as { login?: string })?.login;
            token.githubEmail = (profile as { email?: string })?.email;
            token.accountCreatedAt = (profile as { created_at?: string })?.created_at;
          }
          token.displayName =
            (profile as { name?: string })?.name ??
            (profile as { login?: string })?.login ??
            (token.email as string | undefined) ??
            undefined;
        }
      }
      // Self-healing: if token.id is not a UUID but we have an email, look up the database UUID
      const isUuid = (id?: string) => id && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (token.email && !isUuid(token.id as string)) {
        try {
          const { getSupabaseAdmin } = await import("@/lib/supabaseAdmin");
          const db = getSupabaseAdmin();
          const { data } = await db.from("users").select("id").eq("email", token.email).maybeSingle();
          if (data?.id) {
            token.id = data.id;
            token.sub = data.id;
          }
        } catch (e) {
          console.error("[auth] Failed to heal non-UUID session", e);
        }
      }

      return token;
    },

    async session({ session, token }) {
      (session.user as { id?: string }).id = (token.id || token.sub) as string | undefined;
      session.user.githubLogin = (token.githubLogin as string | undefined) ?? null;
      session.user.githubId = (token.githubId as string | undefined) ?? null;
      session.user.provider = (token.provider as string | undefined) ?? "github";
      session.user.displayName = (token.displayName as string | undefined) ?? null;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET!,
};