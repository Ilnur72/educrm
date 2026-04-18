import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendMessage, xabarTolovEslatma } from "@/lib/telegram";

const OYLAR = ["Yanvar","Fevral","Mart","Aprel","May","Iyun",
               "Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];

// POST /api/qarzdorlar/xabar
// body: { talabaIds: string[], oy: number, yil: number }
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Kirish kerak" }, { status: 401 });

  const { talabaIds, oy, yil } = await req.json();
  if (!talabaIds?.length) return NextResponse.json({ yuborildi: 0 });

  const talabalar = await prisma.talaba.findMany({
    where: { id: { in: talabaIds }, otaTelegramId: { not: null } },
    include: {
      tolovlar: { where: { oy, yil } },
      guruhlar: {
        where:   { faol: true },
        include: { guruh: { include: { kurs: { select: { narxi: true } } } } },
        take: 1,
      },
    },
  });

  let yuborildi = 0;
  const oyNomi  = OYLAR[oy - 1];

  for (const t of talabalar) {
    if (!t.otaTelegramId) continue;
    const narxi    = t.guruhlar[0]?.guruh.kurs.narxi ?? 0;
    const tolangan = t.tolovlar.reduce((s, p) => s + p.summa, 0);
    const qoldiq   = narxi - tolangan;
    if (qoldiq <= 0) continue;

    await sendMessage(t.otaTelegramId, xabarTolovEslatma(t.ism, t.familiya, qoldiq, oyNomi));
    yuborildi++;
  }

  return NextResponse.json({ yuborildi });
}
