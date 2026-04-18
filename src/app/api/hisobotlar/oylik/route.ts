import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role === "OQITUVCHI") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const hozir = new Date();
  const oy  = parseInt(searchParams.get("oy")  ?? String(hozir.getMonth() + 1));
  const yil = parseInt(searchParams.get("yil") ?? String(hozir.getFullYear()));

  const oyBoshi = new Date(yil, oy - 1, 1);
  const oyOxiri = new Date(yil, oy, 1);

  const [
    tolovlar,
    yangiTalabalar,
    chiqibKetganlar,
    yangiLidlar,
    yozilganLidlar,
    davomatYig,
    guruhlar,
    lidManba,
  ] = await Promise.all([
    // Oylik to'lovlar
    prisma.tolov.findMany({
      where: { oy, yil },
      include: { talaba: { select: { ism: true, familiya: true } } },
      orderBy: { createdAt: "desc" },
    }),

    // Bu oy yozilgan yangi talabalar
    prisma.talaba.count({
      where: { createdAt: { gte: oyBoshi, lt: oyOxiri } },
    }),

    // Bu oy chiqib ketgan (faol=false bo'lgan)
    prisma.talaba.count({
      where: { faol: false, updatedAt: { gte: oyBoshi, lt: oyOxiri } },
    }),

    // Yangi lidlar
    prisma.lid.count({
      where: { createdAt: { gte: oyBoshi, lt: oyOxiri } },
    }),

    // Yozilgan lidlar
    prisma.lid.count({
      where: { holat: "YOZILDI", updatedAt: { gte: oyBoshi, lt: oyOxiri } },
    }),

    // Davomat yig'indisi (o'sha oy)
    prisma.davomat.groupBy({
      by: ["holat"],
      where: { dars: { sana: { gte: oyBoshi, lt: oyOxiri } } },
      _count: true,
    }),

    // Guruhlar holati
    prisma.guruh.findMany({
      where: { faol: true },
      include: {
        kurs: { select: { nom: true, narxi: true, maxTalaba: true } },
        oqituvchi: { include: { user: { select: { name: true } } } },
        _count: { select: { talabalar: { where: { faol: true } } } },
      },
    }),

    // Lid manba
    prisma.lid.groupBy({
      by: ["manba"],
      where: { createdAt: { gte: oyBoshi, lt: oyOxiri } },
      _count: true,
      orderBy: { _count: { manba: "desc" } },
    }),
  ]);

  const jamilTushum = tolovlar.reduce((s, t) => s + t.summa, 0);

  const davomatJami  = davomatYig.reduce((s, d) => s + d._count, 0);
  const davomatKeldi = davomatYig
    .filter((d) => d.holat === "KELDI" || d.holat === "KECH_KELDI")
    .reduce((s, d) => s + d._count, 0);
  const davomatFoiz = davomatJami > 0 ? Math.round((davomatKeldi / davomatJami) * 100) : null;

  // To'lov turlari
  const tolovTurlari = tolovlar.reduce((acc, t) => {
    acc[t.tur] = (acc[t.tur] ?? 0) + t.summa;
    return acc;
  }, {} as Record<string, number>);

  // Top to'lovchilar
  const topTolovchilar = Object.entries(
    tolovlar.reduce((acc, t) => {
      const key = t.talabaId;
      if (!acc[key]) acc[key] = { ism: `${t.talaba.ism} ${t.talaba.familiya}`, summa: 0 };
      acc[key].summa += t.summa;
      return acc;
    }, {} as Record<string, { ism: string; summa: number }>)
  )
    .map(([, v]) => v)
    .sort((a, b) => b.summa - a.summa)
    .slice(0, 5);

  return NextResponse.json({
    oy, yil,
    jamilTushum,
    tolovSoni: tolovlar.length,
    yangiTalabalar,
    chiqibKetganlar,
    yangiLidlar,
    yozilganLidlar,
    konversiya: yangiLidlar > 0 ? Math.round((yozilganLidlar / yangiLidlar) * 100) : 0,
    davomatFoiz,
    davomatKeldi,
    davomatJami,
    tolovTurlari,
    topTolovchilar,
    guruhlar: guruhlar.map((g) => ({
      id: g.id,
      nom: g.nom,
      kursNom: g.kurs.nom,
      oqituvchi: g.oqituvchi?.user.name ?? null,
      talabaSoni: g._count.talabalar,
      maxTalaba: g.kurs.maxTalaba,
      oylikTushum: g._count.talabalar * g.kurs.narxi,
    })),
    lidManba,
  });
}
