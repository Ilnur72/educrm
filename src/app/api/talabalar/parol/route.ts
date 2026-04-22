import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const session = await requireAuth(["ADMIN", "RECEPTION"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { talabaId, parol } = await req.json();
  if (!talabaId || !parol) {
    return NextResponse.json({ error: "talabaId va parol kerak" }, { status: 400 });
  }

  const talaba = await prisma.talaba.findUnique({ where: { id: talabaId } });
  if (!talaba) return NextResponse.json({ error: "Talaba topilmadi" }, { status: 404 });

  const parolHash = await bcrypt.hash(parol, 10);
  // Login = telefon raqami (agar login bo'lmasa)
  const login = talaba.login ?? talaba.telefon;

  await prisma.talaba.update({
    where: { id: talabaId },
    data: { parolHash, login },
  });

  return NextResponse.json({ ok: true, login });
}
