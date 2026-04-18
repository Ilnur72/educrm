import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/oqituvchi/ish-haqi — login qilgan o'qituvchining ish haqi tarixi
export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== "OQITUVCHI") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const oqituvchi = await prisma.oqituvchi.findUnique({
    where: { userId: session.user.id },
    include: {
      ishHaqlar: {
        orderBy: [{ yil: "desc" }, { oy: "desc" }],
        take: 12,
      },
    },
  });

  if (!oqituvchi) return NextResponse.json({ error: "O'qituvchi topilmadi" }, { status: 404 });

  return NextResponse.json({
    ishHaqiTuri: oqituvchi.ishHaqiTuri,
    foiz:        oqituvchi.foiz,
    soatlik:     oqituvchi.soatlik,
    ishHaqlar:   oqituvchi.ishHaqlar,
  });
}
