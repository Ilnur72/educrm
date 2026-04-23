import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(["DIREKTOR", "ADMIN"]);
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const filialId = params.id;
  const hozir = new Date();
  const oyBoshi = new Date(hozir.getFullYear(), hozir.getMonth(), 1);
  const oyOxiri = new Date(hozir.getFullYear(), hozir.getMonth() + 1, 1);

  const [talabalar, guruhlar, lidlar, tolovlar, xarajatlar] = await Promise.all([
    prisma.talaba.count({ where: { filialId, faol: true } }),
    prisma.guruh.count({ where: { filialId, faol: true } }),
    prisma.lid.count({
      where: { filialId, createdAt: { gte: oyBoshi, lt: oyOxiri } },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma as any).tolov.aggregate({
      where: {
        talaba: { filialId },
        oy: hozir.getMonth() + 1,
        yil: hozir.getFullYear(),
      },
      _sum: { summa: true },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma as any).xarajat.aggregate({
      where: {
        filialId,
        sana: { gte: oyBoshi, lt: oyOxiri },
      },
      _sum: { summa: true },
    }),
  ]);

  const daromad  = tolovlar._sum?.summa  ?? 0;
  const xarajat  = xarajatlar._sum?.summa ?? 0;

  return NextResponse.json({
    talabalar,
    guruhlar,
    yangiLidlar: lidlar,
    daromad,
    xarajat,
    foyda: daromad - xarajat,
  });
}
