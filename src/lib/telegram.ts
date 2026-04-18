const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API   = `https://api.telegram.org/bot${TOKEN}`;

type InlineButton = { text: string; callback_data: string };
type InlineKeyboard = { inline_keyboard: InlineButton[][] };

export async function sendMessage(
  chatId: string | number,
  text: string,
  reply_markup?: InlineKeyboard
) {
  if (!TOKEN) return;
  await fetch(`${API}/sendMessage`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", reply_markup }),
  }).catch(() => {});
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string) {
  if (!TOKEN) return;
  await fetch(`${API}/answerCallbackQuery`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ callback_query_id: callbackQueryId, text }),
  }).catch(() => {});
}

export async function setWebhook(url: string) {
  if (!TOKEN) return;
  const res = await fetch(`${API}/setWebhook`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ url }),
  });
  return res.json();
}

// ─── Xabar shablonlari ──────────────────────────────────────────────────────

export function xabarKelmadi(ism: string, familiya: string, guruhNom: string, sana: string) {
  return (
    `⚠️ <b>Davomat xabarnomasi</b>\n\n` +
    `Hurmatli ota-ona!\n` +
    `Farzandingiz <b>${ism} ${familiya}</b> bugun (${sana}) ` +
    `<b>${guruhNom}</b> guruhiga darsga <b>kelmadi</b>.\n\n` +
    `Agar sababi bo'lsa, o'quv markaziga xabar bering.`
  );
}

export function xabarKechKeldi(ism: string, familiya: string, guruhNom: string, sana: string) {
  return (
    `🕐 <b>Davomat xabarnomasi</b>\n\n` +
    `Farzandingiz <b>${ism} ${familiya}</b> bugun (${sana}) ` +
    `<b>${guruhNom}</b> guruhiga <b>kech keldi</b>.`
  );
}

export function xabarTolovEslatma(ism: string, familiya: string, summa: number, oy: string) {
  return (
    `💳 <b>To'lov eslatmasi</b>\n\n` +
    `Hurmatli ota-ona!\n` +
    `<b>${ism} ${familiya}</b> uchun ${oy} oyiga ` +
    `<b>${summa.toLocaleString()} so'm</b> to'lov amalga oshirilmagan.\n\n` +
    `Iltimos, to'lovni amalga oshiring.`
  );
}

export function xabarDarsBekor(guruhNom: string, sana: string, sabab?: string) {
  return (
    `❌ <b>Dars bekor qilindi</b>\n\n` +
    `<b>${guruhNom}</b> guruhining ${sana} kungi darsi bekor qilindi.\n` +
    (sabab ? `\n<b>Sabab:</b> ${sabab}` : "")
  );
}

export function tolovQildiXabar(
  talabaIsm: string,
  talabaTelefon: string,
  summa: number,
  oy: number,
  yil: number,
) {
  return (
    `💰 <b>To'lov so'rovi</b>\n\n` +
    `Talaba: <b>${talabaIsm}</b>\n` +
    `Telefon: <code>${talabaTelefon}</code>\n` +
    `Oy: <b>${oy}/${yil}</b>\n` +
    `Summa: <b>${summa.toLocaleString()} so'm</b>\n\n` +
    `Ota-ona to'lov qilganini tasdiqladi.`
  );
}
