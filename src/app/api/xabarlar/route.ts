import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendMessage } from "@/lib/telegram";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Kirish kerak" }, { status: 401 });

  const xabarlar = await prisma.xabar.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(xabarlar);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role === "OQITUVCHI") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const { sarlavha, matn, kimga, guruhId, faqatQarzdorlar } = await req.json();
  if (!matn) return NextResponse.json({ error: "Matn kiritilmagan" }, { status: 400 });

  // Qabul qiluvchilarni topish
  let talabalar = await prisma.talaba.findMany({
    where: {
      faol: true,
      otaTelegramId: { not: null },
      ...(guruhId ? { guruhlar: { some: { guruhId, faol: true } } } : {}),
      ...(faqatQarzdorlar ? {
        tolovlar: {
          none: {
            oy:  new Date().getMonth() + 1,
            yil: new Date().getFullYear(),
          },
        },
      } : {}),
    },
    select: { id: true, ism: true, familiya: true, otaTelegramId: true },
  });

  // Xabar yuborish
  let yuborildi = 0;
  const xabarMatn = sarlavha ? `<b>${sarlavha}</b>\n\n${matn}` : matn;

  for (const t of talabalar) {
    if (t.otaTelegramId) {
      await sendMessage(t.otaTelegramId, xabarMatn);
      yuborildi++;
    }
  }

  // Logga yozish
  await prisma.xabar.create({
    data: {
      telefon: kimga ?? "Telegram",
      matn:    `${sarlavha ? sarlavha + ": " : ""}${matn}`,
      holat:   "YUBORILDI",
      tur:     "MANUAL",
    },
  });

  return NextResponse.json({ ok: true, jami: talabalar.length, yuborildi });
}
