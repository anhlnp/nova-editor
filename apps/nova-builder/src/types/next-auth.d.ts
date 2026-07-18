// Augment NextAuth session types to carry githubLogin, githubId, provider, displayName
import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      githubLogin: string | null;
      githubId: string | null;
      provider: string;
      displayName: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string | undefined;
    githubId?: string | undefined;
    githubLogin?: string | undefined;
    githubEmail?: string | undefined;
    accountCreatedAt?: string | undefined;
    provider?: string | undefined;
    displayName?: string | undefined;
    email?: string | undefined;
  }
}
