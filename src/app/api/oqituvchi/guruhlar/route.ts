import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/oqituvchi/guruhlar — login qilgan o'qituvchining guruhlari
export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "OQITUVCHI") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const oqituvchi = await prisma.oqituvchi.findUnique({
    where: { userId: session.user.id },
  });

  if (!oqituvchi) return NextResponse.json({ error: "O'qituvchi topilmadi" }, { status: 404 });

  const guruhlar = await prisma.guruh.findMany({
    where:   { oqituvchiId: oqituvchi.id, faol: true },
    include: {
      kurs: { select: { nom: true, narxi: true } },
      _count: { select: { talabalar: { where: { faol: true } } } },
      darslar: {
        orderBy: { sana: "desc" },
        take: 1,
        select: { sana: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ oqituvchiId: oqituvchi.id, guruhlar });
}
