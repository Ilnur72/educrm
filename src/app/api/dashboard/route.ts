import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getFilialFilter } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const filialFilter = await getFilialFilter(searchParams.get("filialId"));
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
    prisma.talaba.count({ where: { ...filialFilter, faol: true } }),
    prisma.kurs.count({ where: { faol: true } }),
    prisma.lid.count({ where: { ...filialFilter, createdAt: { gte: oyBoshi } } }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.tolov.aggregate as any)({
      where: {
        ...(filialFilter && "filialId" in filialFilter
          ? { talaba: { filialId: filialFilter.filialId } }
          : {}),
        createdAt: { gte: oyBoshi },
      },
      _sum: { summa: true },
    }),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (prisma.dars.count as any)({
      where: {
        ...(filialFilter && "filialId" in filialFilter
          ? { guruh: { filialId: filialFilter.filialId } }
          : {}),
        sana: {
          gte: new Date(hozir.setHours(0, 0, 0, 0)),
          lt: new Date(hozir.setHours(23, 59, 59, 999)),
        },
      },
    }),
    prisma.talaba.count({
      where: {
        ...filialFilter,
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
    oylik_tushum: oylik_tolovlar._sum?.summa ?? 0,
    bugungi_darslar,
    qarzdor_talabalar,
  });
}
