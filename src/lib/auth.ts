import { NextAuthOptions, getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    role: Role;
  }
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: Role;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: Role;
  }
}

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",  type: "email" },
        password: { label: "Parol", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Demo foydalanuvchilar (database kerak emas)
        const demoUsers = [
          { id: "1", email: "admin@educrm.uz", password: "admin123", name: "Admin", role: "ADMIN" as Role },
          { id: "2", email: "kamola@educrm.uz", password: "oqituvchi123", name: "Kamola", role: "TEACHER" as Role },
        ];

        const demoUser = demoUsers.find(
          (u) => u.email === credentials.email && u.password === credentials.password
        );

        if (demoUser) {
          return { id: demoUser.id, email: demoUser.email, name: demoUser.name, role: demoUser.role };
        }

        // Database dan qidirish
        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          
          if (!user) {
            return null;
          }

          const ok = await bcrypt.compare(credentials.password, user.password);
          if (!ok) {
            return null;
          }

          return { id: user.id, email: user.email, name: user.name, role: user.role };
        } catch {
          // Database xatosi - faqat demo user lar ishlaydi
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id   = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id   = token.id;
      session.user.role = token.role;
      return session;
    },
  },
};

export const getSession = () => getServerSession(authOptions);

export async function requireAuth(allowedRoles?: Role[]) {
  const session = await getSession();
  if (!session) return null;
  if (allowedRoles && !allowedRoles.includes(session.user.role)) return null;
  return session;
}
