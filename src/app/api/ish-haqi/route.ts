import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET /api/ish-haqi?oy=4&yil=2026
export async function GET(req: Request) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const oy  = parseInt(searchParams.get("oy")  ?? String(new Date().getMonth() + 1));
  const yil = parseInt(searchParams.get("yil") ?? String(new Date().getFullYear()));

  // Barcha o'qituvchilarni guruhlar va ish haqlari bilan olamiz
  const oqituvchilar = await prisma.oqituvchi.findMany({
    where: { faol: true },
    include: {
      user: { select: { id: true, name: true, email: true } },
      guruhlar: {
        where: { faol: true },
        include: {
          kurs: { select: { narxi: true, nom: true } },
          talabalar: { where: { faol: true }, select: { id: true } },
          darslar: {
            where: {
              sana: {
                gte: new Date(yil, oy - 1, 1),
                lt:  new Date(yil, oy, 1),
              },
            },
            select: { id: true },
          },
        },
      },
      ishHaqlar: {
        where: { oy, yil },
        select: { id: true, summa: true, tolanganMi: true },
      },
    },
  });

  const natija = oqituvchilar.map((o) => {
    // Oylik daromad hisoblash
    const oylikDaromad = o.guruhlar.reduce((sum, g) => {
      return sum + g.kurs.narxi * g.talabalar.length;
    }, 0);

    // Hisoblangan ish haqi
    let hisoblangan = 0;
    if (o.ishHaqiTuri === "FOIZ" && o.foiz) {
      hisoblangan = Math.round(oylikDaromad * (o.foiz / 100));
    } else if (o.ishHaqiTuri === "SOATLIK" && o.soatlik) {
      const jami_darslar = o.guruhlar.reduce((s, g) => s + g.darslar.length, 0);
      hisoblangan = jami_darslar * o.soatlik;
    } else if (o.ishHaqiTuri === "OYLIK" && o.soatlik) {
      hisoblangan = o.soatlik;
    }

    const tolangan = o.ishHaqlar.find((i) => i.tolanganMi);

    return {
      id:            o.id,
      ism:           o.user.name,
      email:         o.user.email,
      telefon:       o.telefon,
      mutaxassislik: o.mutaxassislik,
      ishHaqiTuri:   o.ishHaqiTuri,
      foiz:          o.foiz,
      soatlik:       o.soatlik,
      faol:          o.faol,
      guruhlar: o.guruhlar.map((g) => ({
        id:          g.id,
        nom:         g.nom,
        kursNom:     g.kurs.nom,
        talabaSoni:  g.talabalar.length,
        darslarSoni: g.darslar.length,
      })),
      oylikDaromad,
      hisoblangan,
      tolangan: tolangan?.summa ?? null,
      tolanganMi: !!tolangan,
      ishHaqId: tolangan?.id ?? null,
    };
  });

  return NextResponse.json(natija);
}

// POST /api/ish-haqi — ish haqini to'lash
export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const body = await req.json();
  const { oqituvchiId, summa, oy, yil, izoh } = body;

  if (!oqituvchiId || !summa || !oy || !yil) {
    return NextResponse.json({ error: "Majburiy maydonlar to'ldirilmagan" }, { status: 400 });
  }

  // Avval shu oy uchun to'langan ish haqi bormi?
  const mavjud = await prisma.ishHaq.findFirst({
    where: { oqituvchiId, oy, yil, tolanganMi: true },
  });
  if (mavjud) {
    return NextResponse.json({ error: "Bu oy ish haqi allaqachon to'langan" }, { status: 400 });
  }

  const ishHaq = await prisma.ishHaq.create({
    data: { oqituvchiId, summa: parseInt(summa), oy, yil, tolanganMi: true, izoh },
  });

  return NextResponse.json(ishHaq, { status: 201 });
}
