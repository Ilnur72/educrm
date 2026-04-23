import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

declare module "next-auth" {
  interface User {
    role: string; // Role | "TALABA"
    talabaId?: string;
    filialId?: string | null;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: string;
      talabaId?: string;
      filialId?: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    talabaId?: string;
    filialId?: string | null;
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const user = await (prisma.user.findUnique as any)({
          where: { email: credentials.email },
        });
        if (!user) return null;

        const ok = await bcrypt.compare(credentials.password, user.password);
        if (!ok) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          filialId: user.filialId ?? null,
        };
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

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const talaba = await (prisma.talaba.findUnique as any)({
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
        token.id       = user.id;
        token.role     = user.role;
        token.filialId = user.filialId ?? null;
        if (user.talabaId) token.talabaId = user.talabaId;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id       = token.id;
      session.user.role     = token.role;
      session.user.filialId = token.filialId ?? null;
      if (token.talabaId) session.user.talabaId = token.talabaId;
      return session;
    },
  },
};

export const getSession = () => getServerSession(authOptions);

export async function requireAuth(allowedRoles?: string[]) {
  const session = await getSession();
  if (!session) return null;
  if (allowedRoles && !allowedRoles.includes(session.user.role)) return null;
  return session;
}

/**
 * DIREKTOR — hamma filiallarni ko'radi (filialId: null)
 * ADMIN/RECEPTION/OQITUVCHI — faqat o'z filialini ko'radi
 * Agar queryda filialId berilsa (DIREKTOR uchun) — shu filial bo'yicha filtrlanadi
 */
export async function getFilialFilter(overrideFilialId?: string | null) {
  const session = await getSession();
  if (!session) return null;

  const role = session.user.role;

  // DIREKTOR — barcha filiallar, yoki belgilangan filial
  if (role === "DIREKTOR") {
    return overrideFilialId ? { filialId: overrideFilialId } : {};
  }

  // Boshqa rollar — faqat o'z filiali
  const filialId = session.user.filialId;
  return filialId ? { filialId } : {};
}

export async function requirePortalAuth() {
  const session = await getSession();
  if (!session || session.user.role !== "TALABA") return null;
  return session;
}
