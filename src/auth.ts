import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { credentialsSchema } from "@/lib/auth-schemas";
import { usernameFromIdentity } from "@/lib/social-username";

const googleConfigured =
  Boolean(process.env.AUTH_GOOGLE_ID?.trim()) &&
  Boolean(process.env.AUTH_GOOGLE_SECRET?.trim());

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  // Credentials provider requires JWT sessions (not database sessions).
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    ...(googleConfigured
      ? [
          Google({
            clientId: process.env.AUTH_GOOGLE_ID!,
            clientSecret: process.env.AUTH_GOOGLE_SECRET!,
            allowDangerousEmailAccountLinking: true,
          }),
        ]
      : []),
    Credentials({
      name: "Email and password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const email = parsed.data.email.toLowerCase();
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) return null;

        const valid = await bcrypt.compare(
          parsed.data.password,
          user.password,
        );
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],
  events: {
    async createUser({ user }) {
      if (!user.id) return;
      const existing = await prisma.user.findUnique({
        where: { id: user.id },
        select: { username: true, name: true, email: true },
      });
      if (existing?.username) return;
      let username = usernameFromIdentity(user.name, user.email);
      const taken = await prisma.user.findUnique({ where: { username } });
      if (taken) {
        username = `${username}${Math.floor(Math.random() * 900 + 100)}`.slice(
          0,
          24,
        );
      }
      await prisma.user.update({
        where: { id: user.id },
        data: { username },
      });
    },
  },
  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user?.id) {
        token.id = String(user.id);
      }
      if (token.id && (user || trigger === "update" || !token.username)) {
        const dbUser = await prisma.user.findUnique({
          where: { id: String(token.id) },
          select: { username: true, name: true, image: true, email: true },
        });
        if (dbUser) {
          if (!dbUser.username) {
            let username = usernameFromIdentity(dbUser.name, dbUser.email);
            const taken = await prisma.user.findUnique({ where: { username } });
            if (taken && taken.id !== String(token.id)) {
              username = `${username}${Math.floor(Math.random() * 900 + 100)}`.slice(
                0,
                24,
              );
            }
            await prisma.user.update({
              where: { id: String(token.id) },
              data: { username },
            });
            token.username = username;
          } else {
            token.username = dbUser.username;
          }
          if (dbUser.name) token.name = dbUser.name;
          if (dbUser.image) token.picture = dbUser.image;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && typeof token.id === "string") {
        session.user.id = token.id;
        if (typeof token.username === "string") {
          session.user.username = token.username;
        }
      }
      return session;
    },
  },
  trustHost: true,
});

export const isGoogleAuthConfigured = googleConfigured;
