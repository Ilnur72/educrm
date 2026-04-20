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
        console.log("[v0] authorize called with email:", credentials?.email);
        
        if (!credentials?.email || !credentials?.password) {
          console.log("[v0] Missing credentials");
          return null;
        }

        try {
          let user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          
          console.log("[v0] User found:", user ? "yes" : "no");
          
          // Agar admin@educrm.uz bo'lsa va topilmasa, avtomatik yaratish
          if (!user && credentials.email === "admin@educrm.uz" && credentials.password === "admin123") {
            console.log("[v0] Creating admin user...");
            const hashedPassword = await bcrypt.hash("admin123", 10);
            user = await prisma.user.create({
              data: {
                email: "admin@educrm.uz",
                name: "Admin",
                password: hashedPassword,
                role: "ADMIN",
              },
            });
            console.log("[v0] Admin user created");
          }
          
          if (!user) {
            console.log("[v0] User not found in database");
            return null;
          }

          const ok = await bcrypt.compare(credentials.password, user.password);
          console.log("[v0] Password match:", ok);
          
          if (!ok) {
            console.log("[v0] Password mismatch");
            return null;
          }

          console.log("[v0] Login successful for:", user.email);
          return { id: user.id, email: user.email, name: user.name, role: user.role };
        } catch (error) {
          console.error("[v0] Database error:", error);
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
