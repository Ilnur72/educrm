import { NextRequest, NextResponse } from "next/server";
import { xavfliTalabalarniTopish } from "@/lib/xavfTahlil";
import { sendMessage } from "@/lib/telegram";

// Har kecha 20:00 da ishlaydi — Vercel Cron
export async function GET(req: NextRequest) {
  const secret      = req.headers.get("authorization");
  const manualSecret = new URL(req.url).searchParams.get("secret");
  const cronSecret  = process.env.CRON_SECRET;

  if (cronSecret && secret !== `Bearer ${cronSecret}` && manualSecret !== cronSecret) {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });
  }

  const xavflilar = await xavfliTalabalarniTopish();
  const adminChatId = process.env.TELEGRAM_ADMIN_CHAT_ID;

  if (!xavflilar.length) {
    return NextResponse.json({ ok: true, xavflilar: 0 });
  }

  // Admin ga umumiy xabar
  if (adminChatId) {
    const xavfliSoni  = xavflilar.filter((t) => t.daraja === "XAVFLI").length;
    const diqqatSoni  = xavflilar.filter((t) => t.daraja === "DIQQAT").length;

    let matn = `📊 <b>Kunlik talaba tahlili</b>\n\n`;
    if (xavfliSoni > 0) {
      matn += `🔴 <b>Xavfli: ${xavfliSoni} talaba</b>\n`;
      xavflilar
        .filter((t) => t.daraja === "XAVFLI")
        .forEach((t) => {
          matn += `• ${t.ism} ${t.familiya} (${t.guruhNom})\n`;
          t.sabablar.forEach((s) => { matn += `  — ${s}\n`; });
        });
      matn += "\n";
    }
    if (diqqatSoni > 0) {
      matn += `🟡 <b>Diqqat: ${diqqatSoni} talaba</b>\n`;
      xavflilar
        .filter((t) => t.daraja === "DIQQAT")
        .forEach((t) => {
          matn += `• ${t.ism} ${t.familiya} (${t.guruhNom})\n`;
        });
    }

    await sendMessage(adminChatId, matn);
  }

  // Xavfli talabalar ota-onasiga ham xabar
  for (const t of xavflilar.filter((x) => x.daraja === "XAVFLI" && x.otaTelegramId)) {
    const matn =
      `⚠️ <b>Diqqat!</b>\n\n` +
      `Hurmatli ota-ona, farzandingiz <b>${t.ism} ${t.familiya}</b> haqida xabar:\n\n` +
      t.sabablar.map((s) => `• ${s}`).join("\n") + "\n\n" +
      `Iltimos, o'quv markazi bilan bog'laning.`;

    await sendMessage(t.otaTelegramId!, matn);
  }

  return NextResponse.json({
    ok:       true,
    xavflilar: xavflilar.filter((t) => t.daraja === "XAVFLI").length,
    diqqat:    xavflilar.filter((t) => t.daraja === "DIQQAT").length,
  });
}
