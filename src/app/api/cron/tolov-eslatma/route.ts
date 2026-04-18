import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMessage, xabarTolovEslatma } from "@/lib/telegram";

// GET /api/cron/tolov-eslatma
// Vercel Cron tomonidan har oyning 1-sida chaqiriladi
// Manualda test: GET /api/cron/tolov-eslatma?secret=...
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization");
  const manualSecret = new URL(req.url).searchParams.get("secret");

  const cronSecret = process.env.CRON_SECRET;
  const isVercel   = secret === `Bearer ${cronSecret}`;
  const isManual   = manualSecret === cronSecret;

  if (cronSecret && !isVercel && !isManual) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const hozir = new Date();
  const oy    = hozir.getMonth() + 1;
  const yil   = hozir.getFullYear();
  const oylar = ["Yanvar","Fevral","Mart","Aprel","May","Iyun",
                 "Iyul","Avgust","Sentabr","Oktabr","Noyabr","Dekabr"];

  // Faol talabalarni olish (guruhga biriktirilgan)
  const talabalar = await prisma.talaba.findMany({
    where: {
      faol: true,
      otaTelegramId: { not: null },
      guruhlar: { some: { faol: true } },
    },
    include: {
      tolovlar: {
        where: { oy, yil },
      },
      guruhlar: {
        where:   { faol: true },
        include: { guruh: { include: { kurs: true } } },
        take: 1,
      },
    },
  });

  let yuborildi = 0;
  let otkazib_yuborildi = 0;

  for (const talaba of talabalar) {
    const faolGuruh = talaba.guruhlar[0];
    if (!faolGuruh) continue;

    const kursNarxi  = faolGuruh.guruh.kurs.narxi;
    const tolovSumma = talaba.tolovlar.reduce((s, t) => s + t.summa, 0);

    // To'liq to'lagan bo'lsa o'tkazib yuboramiz
    if (tolovSumma >= kursNarxi) {
      otkazib_yuborildi++;
      continue;
    }

    const qoldiq = kursNarxi - tolovSumma;
    const oyNomi = oylar[oy - 1];

    await sendMessage(
      talaba.otaTelegramId!,
      xabarTolovEslatma(talaba.ism, talaba.familiya, qoldiq, oyNomi)
    );

    yuborildi++;
  }

  return NextResponse.json({
    ok: true,
    oy,
    yil,
    yuborildi,
    otkazib_yuborildi,
    jami: talabalar.length,
  });
}
