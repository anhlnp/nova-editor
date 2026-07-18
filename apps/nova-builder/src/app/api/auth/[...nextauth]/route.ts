import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { upsertUser, upsertEmailUser } from "@/lib/supabase-server";

// Trust Cloudflare / OpenNext forwarded headers so NextAuth v4 detectOrigin
// does not default to NEXTAUTH_URL (http://localhost:3000) in production.
process.env.AUTH_TRUST_HOST = "true";

const handler = NextAuth({
  ...authOptions,
  callbacks: {
    ...authOptions.callbacks,
    async jwt(params) {
      const { account, profile } = params;
      const result = await (authOptions.callbacks?.jwt?.(params) ?? Promise.resolve(params.token));

      // On first OAuth sign-in, upsert the user into Supabase (GitHub only)
      if (account && profile && account.provider === "github") {
        try {
          const dbUser = await upsertUser({
            githubId: result.githubId as string,
            githubLogin: result.githubLogin as string,
            githubEmail: result.githubEmail as string | null,
            githubAccountCreatedAt: result.accountCreatedAt as string | null,
          });
          if (dbUser && (dbUser as { id?: string }).id) {
            result.id = (dbUser as { id: string }).id;
            result.sub = (dbUser as { id: string }).id;
          }
        } catch {
          console.error("[auth] Failed to upsert GitHub user");
        }
      }

      // On Google OAuth sign-in, upsert the user into Supabase
      if (account && profile && account.provider === "google" && result.email) {
        try {
          const dbUser = await upsertEmailUser({
            email: result.email as string,
            provider: "google",
            displayName: (result.displayName as string) ?? null,
          });
          if (dbUser && dbUser.id) {
            result.id = dbUser.id;
            result.sub = dbUser.id;
          }
        } catch (e) {
          console.error("[auth] Failed to upsert Google user", e);
        }
      }

      return result;
    },
  },
});

export { handler as GET, handler as POST };
