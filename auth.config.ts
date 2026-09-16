import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/admin/login",
  },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;

      if (pathname.startsWith("/admin/login")) {
        return true;
      }

      if (pathname.startsWith("/admin")) {
        return isLoggedIn;
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? "";
        session.user.email = (token.email as string) ?? session.user.email;
      }
      return session;
    },
  },
  // Trust X-Forwarded-Host and X-Forwarded-Proto headers from reverse proxies.
  // NextAuth v5 auto-detects the host URL from request headers. If admin redirects
  // to localhost in production, set AUTH_URL env var to your public domain.
  trustHost: true,
} satisfies NextAuthConfig;
