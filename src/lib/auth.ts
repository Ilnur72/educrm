import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: string; // Role | "TALABA"
    talabaId?: string;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      talabaId?: string;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    talabaId?: string;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    // Admin / Staff login
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email:    { label: "Email",  type: "email" },
        password: { label: "Parol", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),

    // Talaba (student) login
    CredentialsProvider({
      id: "student",
      name: "Talaba",
      credentials: {
        login:    { label: "Login",  type: "text" },
        password: { label: "Parol", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.login || !credentials?.password) return null;

        const talaba = await prisma.talaba.findUnique({
          where: { login: credentials.login },
        });
        if (!talaba?.parolHash) return null;

        const ok = await bcrypt.compare(credentials.password, talaba.parolHash);
        if (!ok) return null;

        return {
          id: talaba.id,
          email: talaba.email ?? talaba.telefon,
          name: `${talaba.ism} ${talaba.familiya}`,
          role: "TALABA",
          talabaId: talaba.id,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = user.role;
        if (user.talabaId) token.talabaId = user.talabaId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id   = token.id;
      session.user.role = token.role;
      if (token.talabaId) session.user.talabaId = token.talabaId;
      return session;
    },
  },
};

export const getSession = () => getServerSession(authOptions);

export async function requireAuth(allowedRoles?: Role[]) {
  const session = await getSession();
  if (!session) return null;
  if (allowedRoles && !allowedRoles.includes(session.user.role as Role)) return null;
  return session;
}

export async function requirePortalAuth() {
  const session = await getSession();
  if (!session || session.user.role !== "TALABA") return null;
  return session;
}
