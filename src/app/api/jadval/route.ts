import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Kirish kerak" }, { status: 401 });

  const guruhlar = await prisma.guruh.findMany({
    where: { faol: true },
    include: {
      kurs:      { select: { nom: true } },
      oqituvchi: { include: { user: { select: { name: true } } } },
      _count:    { select: { talabalar: { where: { faol: true } } } },
    },
    orderBy: { vaqt: "asc" },
  });

  return NextResponse.json(guruhlar);
}
