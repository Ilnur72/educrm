import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePortalAuth } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PATCH(req: NextRequest) {
  const session = await requirePortalAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const talabaId = session.user.talabaId!;
  const body = await req.json();
  const { telefon, email, yangiParol, joriyParol } = body;

  // Parol o'zgartirilsa tekshiramiz
  if (yangiParol) {
    const talaba = await prisma.talaba.findUnique({ where: { id: talabaId } });
    if (!talaba?.parolHash) {
      return NextResponse.json({ error: "Joriy parol topilmadi" }, { status: 400 });
    }
    const ok = await bcrypt.compare(joriyParol, talaba.parolHash);
    if (!ok) {
      return NextResponse.json({ error: "Joriy parol noto'g'ri" }, { status: 400 });
    }
  }

  const data: Record<string, unknown> = {};
  if (telefon) data.telefon = telefon;
  if (email !== undefined) data.email = email || null;
  if (yangiParol) data.parolHash = await bcrypt.hash(yangiParol, 10);

  const talaba = await prisma.talaba.update({
    where: { id: talabaId },
    data,
    select: { id: true, ism: true, familiya: true, telefon: true, email: true },
  });

  return NextResponse.json(talaba);
}
