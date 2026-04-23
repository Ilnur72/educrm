import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMessage } from "@/lib/telegram";

// GET /api/cron/tugrilgan-kun
// Har kuni soat 08:00 da chaqiriladi
// Bugun tug'ilgan kunli talabalar uchun Telegram tabrik yuboradi
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization");
  const manualSecret = new URL(req.url).searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && secret !== `Bearer ${cronSecret}` && manualSecret !== cronSecret) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const hozir = new Date();
  const oy    = hozir.getMonth() + 1;
  const kun   = hozir.getDate();

  // Bugun tug'ilgan kunli talabalar (oy va kun bo'yicha)
  const talabalar = await prisma.talaba.findMany({
    where: {
      faol: true,
      tugilganKun: { not: null },
      otaTelegramId: { not: null },
    },
    select: {
      id: true, ism: true, familiya: true,
      tugilganKun: true, otaTelegramId: true,
    },
  });

  const bugunlilar = talabalar.filter((t) => {
    if (!t.tugilganKun) return false;
    const d = new Date(t.tugilganKun);
    return d.getMonth() + 1 === oy && d.getDate() === kun;
  });

  let yuborildi = 0;

  for (const talaba of bugunlilar) {
    if (!talaba.otaTelegramId) continue;
    const matn =
      `🎂 <b>Tug'ilgan kun muboraki!</b>\n\n` +
      `Hurmatli ota-ona!\n` +
      `Bugun farzandingiz <b>${talaba.ism} ${talaba.familiya}</b>ning tug'ilgan kuni! 🎉\n\n` +
      `O'quv markazi jamoasi tabriklar va omad tilab qoladi! 🌟`;

    await sendMessage(talaba.otaTelegramId, matn);
    yuborildi++;
  }

  // Admin ga ham xabar
  const adminChatId = process.env.CRON_CHAT_ID;
  if (adminChatId && bugunlilar.length > 0) {
    const matn =
      `🎂 <b>Bugungi tug'ilgan kunlar</b>\n\n` +
      bugunlilar.map((t) => `• ${t.ism} ${t.familiya}`).join("\n");
    await sendMessage(adminChatId, matn);
  }

  return NextResponse.json({ ok: true, jami: bugunlilar.length, yuborildi });
}
