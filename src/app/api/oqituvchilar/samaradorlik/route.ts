import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role === "OQITUVCHI") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const hozir  = new Date();
  const oyBoshi = new Date(hozir.getFullYear(), hozir.getMonth(), 1);
  const oyOxiri = new Date(hozir.getFullYear(), hozir.getMonth() + 1, 1);
  const o30kun  = new Date(hozir.getTime() - 30 * 24 * 60 * 60 * 1000);

  const oqituvchilar = await prisma.oqituvchi.findMany({
    where: { faol: true },
    include: {
      user: { select: { name: true, email: true } },
      guruhlar: {
        where: { faol: true },
        include: {
          kurs: { select: { nom: true, narxi: true, maxTalaba: true } },
          talabalar: {
            where: { faol: true },
            include: {
              talaba: {
                include: {
                  tolovlar: {
                    where: { oy: hozir.getMonth() + 1, yil: hozir.getFullYear() },
                  },
                },
              },
            },
          },
          darslar: {
            where: { sana: { gte: o30kun } },
            include: {
              davomatlar: { select: { holat: true } },
            },
          },
        },
      },
    },
  });

  const natija = oqituvchilar.map((o) => {
    const guruhlar = o.guruhlar;

    // Jami faol talabalar
    const jamiTalabalar = guruhlar.reduce((s, g) => s + g.talabalar.length, 0);

    // Davomat foizi — so'nggi 30 kun
    let jamiYozuv = 0, kelganlar = 0;
    for (const g of guruhlar) {
      for (const d of g.darslar) {
        for (const dv of d.davomatlar) {
          jamiYozuv++;
          if (dv.holat === "KELDI" || dv.holat === "KECH_KELDI") kelganlar++;
        }
      }
    }
    const davomatFoiz = jamiYozuv > 0 ? Math.round((kelganlar / jamiYozuv) * 100) : null;

    // To'lov foizi — joriy oy
    let tolovlilar = 0;
    for (const g of guruhlar) {
      for (const tg of g.talabalar) {
        const tolangan = tg.talaba.tolovlar.reduce((s, t) => s + t.summa, 0);
        if (tolangan >= g.kurs.narxi) tolovlilar++;
      }
    }
    const tolovFoiz = jamiTalabalar > 0 ? Math.round((tolovlilar / jamiTalabalar) * 100) : null;

    // Guruh davomat breakdown
    const guruhStats = guruhlar.map((g) => {
      let gJami = 0, gKeldi = 0;
      for (const d of g.darslar) {
        for (const dv of d.davomatlar) {
          gJami++;
          if (dv.holat === "KELDI" || dv.holat === "KECH_KELDI") gKeldi++;
        }
      }
      const gTolovlilar = g.talabalar.filter(
        (tg) => tg.talaba.tolovlar.reduce((s, t) => s + t.summa, 0) >= g.kurs.narxi
      ).length;

      return {
        id: g.id,
        nom: g.nom,
        kursNom: g.kurs.nom,
        talabaSoni: g.talabalar.length,
        maxTalaba: g.kurs.maxTalaba,
        davomatFoiz: gJami > 0 ? Math.round((gKeldi / gJami) * 100) : null,
        tolovFoiz: g.talabalar.length > 0 ? Math.round((gTolovlilar / g.talabalar.length) * 100) : null,
      };
    });

    return {
      id: o.id,
      ism: o.user.name,
      email: o.user.email,
      mutaxassislik: o.mutaxassislik,
      guruhSoni: guruhlar.length,
      jamiTalabalar,
      davomatFoiz,
      tolovFoiz,
      guruhlar: guruhStats,
    };
  });

  // Umumiy samaradorlik ball bo'yicha sort: davomat (60%) + tolov (40%)
  natija.sort((a, b) => {
    const ballA = (a.davomatFoiz ?? 0) * 0.6 + (a.tolovFoiz ?? 0) * 0.4;
    const ballB = (b.davomatFoiz ?? 0) * 0.6 + (b.tolovFoiz ?? 0) * 0.4;
    return ballB - ballA;
  });

  return NextResponse.json(natija);
}
