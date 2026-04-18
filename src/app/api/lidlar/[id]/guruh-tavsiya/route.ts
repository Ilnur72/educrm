import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Kirish kerak" }, { status: 401 });

  const lid = await prisma.lid.findUnique({ where: { id: params.id } });
  if (!lid) return NextResponse.json([], { status: 404 });

  // Lid kurs nomini so'zlarga bo'lamiz (IELTS, Python, ingliz tili...)
  const kalit = lid.kurs.toLowerCase().trim();
  const sozlar = kalit.split(/[\s,]+/).filter((s) => s.length > 1);

  const guruhlar = await prisma.guruh.findMany({
    where: { faol: true },
    include: {
      kurs: { select: { nom: true, narxi: true, maxTalaba: true } },
      oqituvchi: { include: { user: { select: { name: true } } } },
      _count: { select: { talabalar: { where: { faol: true } } } },
    },
  });

  // Ball hisoblash
  const ballangan = guruhlar.map((g) => {
    let ball = 0;
    const kursNom = g.kurs.nom.toLowerCase();
    const boshJoy = g.kurs.maxTalaba - g._count.talabalar;

    // Kurs nomi moslik
    if (kursNom === kalit) ball += 5;                            // To'liq mos
    else if (kursNom.includes(kalit) || kalit.includes(kursNom)) ball += 4; // Qisman mos
    else if (sozlar.some((s) => kursNom.includes(s))) ball += 2; // So'z mos keladi

    if (ball === 0) return null; // Umuman mos kelmasa — ko'rsatma

    // Bo'sh joy bonus
    if (boshJoy <= 0) ball -= 3;       // To'lgan guruh — pastga tushirish
    else if (boshJoy <= 2) ball += 1;  // Oz joy qolgan — biroz ustun
    else if (boshJoy >= 3) ball += 2;  // Yaxshi bo'sh joy

    return {
      id:          g.id,
      nom:         g.nom,
      kursNom:     g.kurs.nom,
      narxi:       g.kurs.narxi,
      vaqt:        g.vaqt,
      kunlar:      g.kunlar,
      xona:        g.xona,
      oqituvchi:   g.oqituvchi?.user.name ?? null,
      talabalar:   g._count.talabalar,
      maxTalaba:   g.kurs.maxTalaba,
      boshJoy,
      ball,
      tolib:       boshJoy <= 0,
    };
  })
  .filter(Boolean)
  .sort((a, b) => b!.ball - a!.ball)
  .slice(0, 4); // Top 4

  return NextResponse.json(ballangan);
}
