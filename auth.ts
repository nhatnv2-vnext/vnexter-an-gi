import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import { authConfig } from "@/auth.config";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const email =
            typeof credentials?.email === "string"
              ? credentials.email.trim().toLowerCase()
              : "";
          const password =
            typeof credentials?.password === "string"
              ? credentials.password
              : "";
          if (!email || !password) return null;

          const user = await prisma.adminUser.findUnique({ where: { email } });
          if (!user) return null;

          const valid = await compare(password, user.passwordHash);
          if (!valid) return null;

          return { id: user.id, email: user.email };
        } catch (error) {
          console.error("[auth.authorize]", error);
          return null;
        }
      },
    }),
  ],
});
