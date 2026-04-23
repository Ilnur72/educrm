import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

async function adminOrDirektor() {
  const session = await getSession();
  if (!session) return null;
  if (session.user.role !== "ADMIN" && session.user.role !== "DIREKTOR") return null;
  return session;
}

export async function GET() {
  const session = await adminOrDirektor();
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  // ADMIN faqat o'z filiali xodimlarini ko'radi
  const where = session.user.role === "ADMIN" && session.user.filialId
    ? { filialId: session.user.filialId }
    : {};

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const users = await (prisma.user.findMany as any)({
    where,
    select: { id: true, name: true, email: true, role: true, filialId: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(users);
}

export async function POST(req: NextRequest) {
  const session = await adminOrDirektor();
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });

  const { name, email, password, role, filialId } = await req.json();

  const mavjud = await prisma.user.findUnique({ where: { email } });
  if (mavjud) return NextResponse.json({ error: "Bu email allaqachon ro'yxatda" }, { status: 400 });

  if (password.length < 8) {
    return NextResponse.json({ error: "Parol kamida 8 belgi bo'lishi kerak" }, { status: 400 });
  }

  // ADMIN o'z filialiga xodim qo'shadi
  const assignedFilialId = session.user.role === "ADMIN"
    ? session.user.filialId
    : (filialId || null);

  const hashed = await bcrypt.hash(password, 10);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user   = await (prisma.user.create as any)({
    data: { name, email, password: hashed, role, filialId: assignedFilialId },
    select: { id: true, name: true, email: true, role: true, filialId: true, createdAt: true },
  });

  // Agar o'qituvchi bo'lsa - oqituvchi profil ham yaratish
  if (role === "OQITUVCHI") {
    await prisma.oqituvchi.create({
      data: { userId: user.id, ishHaqiTuri: "FOIZ", foiz: 20 },
    });
  }

  return NextResponse.json(user, { status: 201 });
}
