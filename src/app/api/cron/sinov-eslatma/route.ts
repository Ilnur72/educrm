import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMessage } from "@/lib/telegram";

// GET /api/cron/sinov-eslatma
// Har kuni soat 18:00 da chaqiriladi
// Ertangi sinov darslarini aniqlaydi va lidga eslatma yuboradi
export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization");
  const manualSecret = new URL(req.url).searchParams.get("secret");
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && secret !== `Bearer ${cronSecret}` && manualSecret !== cronSecret) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const hozir   = new Date();
  // Ertangi kun
  const ertaEsh = new Date(hozir.getFullYear(), hozir.getMonth(), hozir.getDate() + 1, 0, 0, 0);
  const ertaOx  = new Date(hozir.getFullYear(), hozir.getMonth(), hozir.getDate() + 2, 0, 0, 0);

  const lidlar = await prisma.lid.findMany({
    where: {
      holat: "SINOV_DARSI",
      sinovSanasi: { gte: ertaEsh, lt: ertaOx },
    },
  });

  // Admin Telegram ID ga yuborish (CRON_CHAT_ID)
  const adminChatId = process.env.CRON_CHAT_ID;
  let yuborildi = 0;

  if (adminChatId && lidlar.length > 0) {
    const matn =
      `🎯 <b>Ertangi sinov darslar</b>\n\n` +
      lidlar.map((l, i) =>
        `${i + 1}. <b>${l.ism}</b> — ${l.kurs}\n` +
        `   📞 ${l.telefon}\n` +
        (l.sinovSanasi ? `   🕐 ${new Date(l.sinovSanasi).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}` : "")
      ).join("\n\n");

    await sendMessage(adminChatId, matn);
    yuborildi = 1;
  }

  return NextResponse.json({ ok: true, lidlar: lidlar.length, yuborildi });
}
