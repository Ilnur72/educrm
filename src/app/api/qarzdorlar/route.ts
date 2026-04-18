import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Kirish kerak" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const hozir = new Date();
  const oy  = parseInt(searchParams.get("oy")  ?? String(hozir.getMonth() + 1));
  const yil = parseInt(searchParams.get("yil") ?? String(hozir.getFullYear()));

  // Faol talabalar + ularning to'lovlari va guruhlarini olish
  const talabalar = await prisma.talaba.findMany({
    where: {
      faol: true,
      guruhlar: { some: { faol: true } },
    },
    include: {
      tolovlar: { where: { oy, yil } },
      guruhlar: {
        where:   { faol: true },
        include: { guruh: { include: { kurs: { select: { nom: true, narxi: true } } } } },
        take: 1,
      },
    },
    orderBy: { ism: "asc" },
  });

  const qarzdorlar = talabalar
    .map((t) => {
      const guruh     = t.guruhlar[0];
      if (!guruh) return null;

      const narxi     = guruh.guruh.kurs.narxi;
      const tolangan  = t.tolovlar.reduce((s, p) => s + p.summa, 0);
      const qoldiq    = narxi - tolangan;

      if (qoldiq <= 0) return null; // To'liq to'lagan

      return {
        id:            t.id,
        ism:           t.ism,
        familiya:      t.familiya,
        telefon:       t.telefon,
        otaTelefon:    t.otaTelefon,
        otaTelegramId: t.otaTelegramId,
        guruhNom:      guruh.guruh.nom,
        kursNom:       guruh.guruh.kurs.nom,
        narxi,
        tolangan,
        qoldiq,
      };
    })
    .filter(Boolean);

  return NextResponse.json({ oy, yil, qarzdorlar });
}
