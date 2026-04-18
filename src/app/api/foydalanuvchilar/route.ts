import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

async function onlyAdmin() {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  if (!await onlyAdmin()) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  if (!await onlyAdmin()) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const { name, email, password, role } = await req.json();

  const mavjud = await prisma.user.findUnique({ where: { email } });
  if (mavjud) return NextResponse.json({ error: "Bu email allaqachon ro'yxatda" }, { status: 400 });

  if (password.length < 8) {
    return NextResponse.json({ error: "Parol kamida 8 belgi bo'lishi kerak" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);
  const user   = await prisma.user.create({
    data: { name, email, password: hashed, role },
    select: { id: true, name: true, email: true, role: true, createdAt: true },
  });

  // Agar o'qituvchi bo'lsa - oqituvchi profil ham yaratish
  if (role === "OQITUVCHI") {
    await prisma.oqituvchi.create({
      data: { userId: user.id, ishHaqiTuri: "FOIZ", foiz: 20 },
    });
  }

  return NextResponse.json(user, { status: 201 });
}
