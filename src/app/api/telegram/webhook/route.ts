import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { sendMessage, answerCallbackQuery } from "@/lib/telegram";
import { oyNomi } from "@/lib/utils";

const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID;

const KUN_NOMI: Record<string, string> = {
  Du: "Dushanba", Se: "Seshanba", Ch: "Chorshanba",
  Pa: "Payshanba", Ju: "Juma",    Sha: "Shanba",    Ya: "Yakshanba",
};

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-telegram-bot-api-secret-token");
  if (secret && secret !== process.env.TELEGRAM_WEBHOOK_SECRET) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  const body = await req.json();

  // ── Callback query (tugma bosilganda) ──────────────────────────────────────
  const cb = body?.callback_query;
  if (cb) {
    await handleCallback(cb);
    return NextResponse.json({ ok: true });
  }

  const message = body?.message;
  if (!message) return NextResponse.json({ ok: true });

  const chatId = message.chat?.id;
  const text   = message.text?.trim() ?? "";

  // ── /start <studentId> ────────────────────────────────────────────────────
  if (text.startsWith("/start")) {
    const studentId = text.split(" ")[1];

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

    await prisma.talaba.update({
      where: { id: studentId },
      data:  { otaTelegramId: String(chatId) },
    });

    await sendMessage(chatId,
      `✅ <b>Muvaffaqiyatli ulandi!</b>\n\n` +
      `Endi <b>${talaba.ism} ${talaba.familiya}</b> uchun davomat va to'lov\n` +
      `xabarlarini shu yerda olasiz.\n\n` +
      `<b>Mavjud buyruqlar:</b>\n` +
      `/info — talaba ma'lumotlari\n` +
      `/jadval — haftalik dars jadvali\n` +
      `/tolov — to'lov qilganligini xabar berish`
    );
    return NextResponse.json({ ok: true });
  }

  // ── /info ─────────────────────────────────────────────────────────────────
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
      await sendMessage(chatId,
        "Siz hali hech qaysi talabaga ulanmagansiz.\n\n" +
        "O'quv markazidan maxsus havola oling."
      );
      return NextResponse.json({ ok: true });
    }

    const guruhlar = talaba.guruhlar
      .map((g) => `• ${g.guruh.kurs.nom} — ${g.guruh.nom} (${g.guruh.vaqt})`)
      .join("\n");

    await sendMessage(chatId,
      `📋 <b>${talaba.ism} ${talaba.familiya}</b>\n\n` +
      `<b>Guruhlar:</b>\n${guruhlar || "Guruhga biriktirilmagan"}\n\n` +
      `/jadval — dars jadvali\n` +
      `/tolov — to'lov xabari`
    );
    return NextResponse.json({ ok: true });
  }

  // ── /jadval ───────────────────────────────────────────────────────────────
  if (text === "/jadval") {
    const talaba = await prisma.talaba.findFirst({
      where:   { otaTelegramId: String(chatId) },
      include: {
        guruhlar: {
          where:   { faol: true },
          include: {
            guruh: {
              include: {
                kurs:      { select: { nom: true } },
                oqituvchi: { include: { user: { select: { name: true } } } },
              },
            },
          },
        },
      },
    });

    if (!talaba) {
      await sendMessage(chatId, "Avval /start orqali ulanish kerak.");
      return NextResponse.json({ ok: true });
    }

    if (talaba.guruhlar.length === 0) {
      await sendMessage(chatId, "Hozircha guruhga biriktirilmagan.");
      return NextResponse.json({ ok: true });
    }

    const jadval = talaba.guruhlar.map((tg) => {
      const g      = tg.guruh;
      const kunlar = g.kunlar.map((k) => KUN_NOMI[k] ?? k).join(", ");
      const oqit   = g.oqituvchi?.user.name ?? "Belgilanmagan";
      return (
        `📚 <b>${g.kurs.nom}</b> — ${g.nom}\n` +
        `🗓 ${kunlar}\n` +
        `🕐 ${g.vaqt}\n` +
        (g.xona ? `🚪 Xona: ${g.xona}\n` : "") +
        `👨‍🏫 ${oqit}`
      );
    }).join("\n\n");

    await sendMessage(chatId,
      `📅 <b>${talaba.ism} ${talaba.familiya} — Dars jadvali</b>\n\n${jadval}`
    );
    return NextResponse.json({ ok: true });
  }

  // ── /tolov ────────────────────────────────────────────────────────────────
  if (text === "/tolov") {
    const talaba = await prisma.talaba.findFirst({
      where:   { otaTelegramId: String(chatId) },
      include: {
        guruhlar: {
          where:   { faol: true },
          include: { guruh: { include: { kurs: { select: { narxi: true, nom: true } } } } },
        },
      },
    });

    if (!talaba) {
      await sendMessage(chatId, "Avval /start orqali ulanish kerak.");
      return NextResponse.json({ ok: true });
    }

    if (!ADMIN_CHAT_ID) {
      await sendMessage(chatId, "❌ Tizim sozlanmagan. Admin bilan bog'laning.");
      return NextResponse.json({ ok: true });
    }

    const hozir  = new Date();
    const oy     = hozir.getMonth() + 1;
    const yil    = hozir.getFullYear();
    const narxi  = talaba.guruhlar[0]?.guruh.kurs.narxi ?? 0;
    const kursNom = talaba.guruhlar[0]?.guruh.kurs.nom ?? "—";

    // Ota-onaga tasdiqlash so'raymiz
    await sendMessage(chatId,
      `💳 <b>To'lov xabari yuborish</b>\n\n` +
      `Talaba: <b>${talaba.ism} ${talaba.familiya}</b>\n` +
      `Kurs: ${kursNom}\n` +
      `Oy: <b>${oyNomi(oy)} ${yil}</b>\n` +
      `Summa: <b>${narxi.toLocaleString()} so'm</b>\n\n` +
      `Yuqoridagi to'lovni amalga oshirdingizmi?`,
      {
        inline_keyboard: [[
          { text: "✅ Ha, to'lovni amalga oshirdim", callback_data: `tolov_ha:${talaba.id}:${oy}:${yil}:${narxi}` },
          { text: "❌ Yo'q", callback_data: "tolov_yoq" },
        ]],
      }
    );
    return NextResponse.json({ ok: true });
  }

  // ── Boshqa xabarlar ───────────────────────────────────────────────────────
  await sendMessage(chatId,
    `<b>Mavjud buyruqlar:</b>\n` +
    `/info — talaba ma'lumotlari\n` +
    `/jadval — haftalik dars jadvali\n` +
    `/tolov — to'lov qilganligini xabar berish`
  );

  return NextResponse.json({ ok: true });
}

// ── Callback query handler ──────────────────────────────────────────────────
async function handleCallback(cb: {
  id: string;
  from: { id: number };
  message: { chat: { id: number } };
  data: string;
}) {
  const chatId = cb.message.chat.id;
  const data   = cb.data;

  // tolov_yoq
  if (data === "tolov_yoq") {
    await answerCallbackQuery(cb.id);
    await sendMessage(chatId, "Tushunarli. Savollaringiz bo'lsa, o'quv markazi bilan bog'laning.");
    return;
  }

  // tolov_ha:<talabaId>:<oy>:<yil>:<narxi>
  if (data.startsWith("tolov_ha:")) {
    const [, talabaId, oyStr, yilStr, narxiStr] = data.split(":");
    const oy    = parseInt(oyStr);
    const yil   = parseInt(yilStr);
    const narxi = parseInt(narxiStr);

    const talaba = await prisma.talaba.findUnique({
      where:   { id: talabaId },
      select:  { ism: true, familiya: true, telefon: true },
    });

    if (!talaba) {
      await answerCallbackQuery(cb.id, "Talaba topilmadi");
      return;
    }

    await answerCallbackQuery(cb.id, "Xabar adminga yuborildi ✅");
    await sendMessage(chatId,
      `✅ Xabaringiz adminga yuborildi!\n\n` +
      `Admin tasdiqlash bilanoq to'lov bazaga kiritiladi.`
    );

    // Adminga xabar + tasdiqlash tugmasi
    if (ADMIN_CHAT_ID) {
      await sendMessage(ADMIN_CHAT_ID,
        `💰 <b>To'lov so'rovi</b>\n\n` +
        `Talaba: <b>${talaba.ism} ${talaba.familiya}</b>\n` +
        `Telefon: <code>${talaba.telefon}</code>\n` +
        `Oy: <b>${oyNomi(oy)} ${yil}</b>\n` +
        `Summa: <b>${narxi.toLocaleString()} so'm</b>\n\n` +
        `Ota-ona to'lov qilganini bildirdi.`,
        {
          inline_keyboard: [[
            { text: "✅ Tasdiqlash", callback_data: `admin_tasdiq:${talabaId}:${oy}:${yil}:${narxi}:${chatId}` },
            { text: "❌ Rad etish",  callback_data: `admin_rad:${chatId}` },
          ]],
        }
      );
    }
    return;
  }

  // admin_tasdiq:<talabaId>:<oy>:<yil>:<narxi>:<otaChatId>
  if (data.startsWith("admin_tasdiq:")) {
    const [, talabaId, oyStr, yilStr, narxiStr, otaChatId] = data.split(":");
    const oy    = parseInt(oyStr);
    const yil   = parseInt(yilStr);
    const narxi = parseInt(narxiStr);

    // To'lovni bazaga kiritamiz
    await prisma.tolov.create({
      data: {
        talabaId,
        summa:       narxi,
        tur:         "NAQD",
        oy,
        yil,
        izoh:        "Telegram orqali ota-ona tasdiqladi",
        qabulQildi:  "Telegram Bot",
      },
    });

    await answerCallbackQuery(cb.id, "To'lov tasdiqlandi ✅");

    // Ota-onaga xabar
    await sendMessage(otaChatId,
      `✅ <b>To'lov tasdiqlandi!</b>\n\n` +
      `${oyNomi(oy)} ${yil} uchun <b>${narxi.toLocaleString()} so'm</b> ` +
      `to'lov tizimga kiritildi.\n\nRahmat!`
    );
    return;
  }

  // admin_rad:<otaChatId>
  if (data.startsWith("admin_rad:")) {
    const otaChatId = data.split(":")[1];
    await answerCallbackQuery(cb.id, "Rad etildi");
    await sendMessage(otaChatId,
      `❌ <b>To'lov tasdiqlanmadi</b>\n\n` +
      `Iltimos, o'quv markazi bilan bevosita bog'laning.`
    );
    return;
  }

  await answerCallbackQuery(cb.id);
}
