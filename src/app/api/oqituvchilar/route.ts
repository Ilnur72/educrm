import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const oqituvchilar = await prisma.oqituvchi.findMany({
    where: { faol: true },
    include: { user: { select: { name: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(oqituvchilar);
}
