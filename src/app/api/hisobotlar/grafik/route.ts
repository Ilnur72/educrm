import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const session = await requireAuth(["ADMIN", "RECEPTION"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const hozir = new Date();

  // So'nggi 12 oy uchun daromad va talabalar soni
  const oylar = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(hozir.getFullYear(), hozir.getMonth() - 11 + i, 1);
    return { oy: d.getMonth() + 1, yil: d.getFullYear() };
  });

  const [tolovlar, talabaGuruhlar] = await Promise.all([
    prisma.tolov.groupBy({
      by: ["oy", "yil"],
      _sum: { summa: true },
      where: {
        createdAt: {
          gte: new Date(hozir.getFullYear(), hozir.getMonth() - 11, 1),
        },
      },
    }),
    prisma.talabaGuruh.findMany({
      where: { faol: true },
      select: { kirishSana: true },
    }),
  ]);

  // Har oy uchun to'plam
  const tolovMap = new Map(
    tolovlar.map((t) => [`${t.yil}-${t.oy}`, t._sum.summa ?? 0])
  );

  // Oylik kumulativ talabalar soni (taxminan)
  const grafik = oylar.map(({ oy, yil }) => {
    const oyOxiri = new Date(yil, oy, 0); // Oy oxiri
    const talabalar = talabaGuruhlar.filter(
      (tg) => new Date(tg.kirishSana) <= oyOxiri
    ).length;
    return {
      nom: `${oy < 10 ? "0" + oy : oy}/${String(yil).slice(-2)}`,
      daromad: tolovMap.get(`${yil}-${oy}`) ?? 0,
      talabalar,
    };
  });

  return NextResponse.json(grafik);
}
