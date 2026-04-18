import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMessage } from "@/lib/telegram";

// POST /api/telegram/webhook — Telegram tomonidan chaqiriladi
export async function POST(req: NextRequest) {
  // Xavfsizlik: faqat Telegram serveridan kelgan so'rovlar
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (secret && secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const body = await req.json();
  const message = body?.message;
  if (!message) return NextResponse.json({ ok: true });

  const chatId  = message.chat?.id;
  const text    = message.text?.trim() ?? "";

  // /start <studentId> — ota-ona botni aktivlashtiradi
  if (text.startsWith("/start")) {
    const parts     = text.split(" ");
    const studentId = parts[1];

    if (!studentId) {
      await sendMessage(chatId,
        "Salom! 👋\n\nBotni faollashtirish uchun o'quv markazidan maxsus havola oling."
      );
      return NextResponse.json({ ok: true });
    }

    const talaba = await prisma.talaba.findUnique({ where: { id: studentId } });

    if (!talaba) {
      await sendMessage(chatId, "❌ Talaba topilmadi. Havola noto'g'ri bo'lishi mumkin.");
      return NextResponse.json({ ok: true });
    }

    // Telegram ID ni saqlaymiz
    await prisma.talaba.update({
      where: { id: studentId },
      data:  { otaTelegramId: String(chatId) },
    });

    await sendMessage(chatId,
      `✅ <b>Muvaffaqiyatli ulandi!</b>\n\n` +
      `Endi <b>${talaba.ism} ${talaba.familiya}</b> uchun:\n` +
      `• Davomat xabarnomalarini\n` +
      `• To'lov eslatmalarini\n` +
      `• O'quv markazi yangiliklerini\n\n` +
      `shu yerda olasiz.`
    );

    return NextResponse.json({ ok: true });
  }

  // /info — talaba haqida ma'lumot
  if (text === "/info") {
    const talaba = await prisma.talaba.findFirst({
      where:   { otaTelegramId: String(chatId) },
      include: {
        guruhlar: {
          where:   { faol: true },
          include: { guruh: { include: { kurs: true } } },
        },
      },
    });

    if (!talaba) {
      await sendMessage(chatId, "Siz hali hech qaysi talabaga ulanmagan siz.");
      return NextResponse.json({ ok: true });
    }

    const guruhlar = talaba.guruhlar.map((g) =>
      `• ${g.guruh.kurs.nom} — ${g.guruh.nom} (${g.guruh.vaqt})`
    ).join("\n");

    await sendMessage(chatId,
      `📋 <b>${talaba.ism} ${talaba.familiya}</b>\n\n` +
      `<b>Guruhlar:</b>\n${guruhlar || "Guruhga biriktirilmagan"}`
    );

    return NextResponse.json({ ok: true });
  }

  // Boshqa xabarlar
  await sendMessage(chatId,
    "Mavjud buyruqlar:\n/info — talaba ma'lumotlari"
  );

  return NextResponse.json({ ok: true });
}
