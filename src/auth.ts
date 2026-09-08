import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import type { Provider } from "next-auth/providers";

const providers: Provider[] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

// Dev-only: sign in as any user without real Google OAuth, so `npm run dev`
// works immediately with no external setup. Never registered in production.
if (process.env.NODE_ENV !== "production") {
  providers.push(
    Credentials({
      id: "dev-login",
      name: "Dev Login",
      credentials: {
        email: { label: "อีเมล", type: "text" },
        name: { label: "ชื่อ", type: "text" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").toLowerCase().trim();
        if (!email) return null;
        const name = String(credentials?.name ?? "").trim() || email.split("@")[0];
        return { id: email, email, name };
      },
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers,
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, account }) {
      if (!user.email) return false;

      if (account?.provider === "google") {
        const domain = process.env.ALLOWED_EMAIL_DOMAIN;
        if (domain && !user.email.toLowerCase().endsWith("@" + domain.toLowerCase())) {
          return false;
        }
      }

      const existing = await prisma.user.findUnique({ where: { email: user.email } });
      if (!existing) {
        const count = await prisma.user.count();
        await prisma.user.create({
          data: {
            email: user.email,
            name: user.name || user.email.split("@")[0],
            // First person to ever sign in becomes Admin; everyone after starts as Teacher.
            role: count === 0 ? "ADMIN" : "TEACHER",
          },
        });
      }
      return true;
    },
    async jwt({ token }) {
      if (token.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: token.email },
          include: { subjectGroup: true },
        });
        if (dbUser) {
          token.uid = dbUser.id;
          token.role = dbUser.role;
          token.position = dbUser.position;
          token.subjectGroup = dbUser.subjectGroup?.name ?? null;
          token.active = dbUser.active;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = (token.uid as string) ?? "";
        session.user.role = token.role ?? "TEACHER";
        session.user.position = token.position ?? null;
        session.user.subjectGroup = token.subjectGroup ?? null;
        session.user.active = token.active ?? true;
      }
      return session;
    },
  },
});
