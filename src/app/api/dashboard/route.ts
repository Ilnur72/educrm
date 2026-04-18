import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const hozir = new Date();
  const oyBoshi = new Date(hozir.getFullYear(), hozir.getMonth(), 1);

  const [
    jami_talabalar,
    faol_kurslar,
    yangi_lidlar,
    oylik_tolovlar,
    bugungi_darslar,
    qarzdor_talabalar,
  ] = await Promise.all([
    prisma.talaba.count({ where: { faol: true } }),
    prisma.kurs.count({ where: { faol: true } }),
    prisma.lid.count({ where: { createdAt: { gte: oyBoshi } } }),
    prisma.tolov.aggregate({
      where: { createdAt: { gte: oyBoshi } },
      _sum: { summa: true },
    }),
    prisma.dars.count({
      where: {
        sana: {
          gte: new Date(hozir.setHours(0, 0, 0, 0)),
          lt: new Date(hozir.setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.talaba.count({
      where: {
        faol: true,
        tolovlar: {
          none: {
            oy: hozir.getMonth() + 1,
            yil: hozir.getFullYear(),
          },
        },
      },
    }),
  ]);

  return NextResponse.json({
    jami_talabalar,
    faol_kurslar,
    yangi_lidlar,
    oylik_tushum: oylik_tolovlar._sum.summa ?? 0,
    bugungi_darslar,
    qarzdor_talabalar,
  });
}
