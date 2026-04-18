const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const API   = `https://api.telegram.org/bot${TOKEN}`;

export async function sendMessage(chatId: string | number, text: string) {
  if (!TOKEN) return;
  await fetch(`${API}/sendMessage`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
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

// ─── Tayyor xabar shablonlari ───────────────────────────────────────────────

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
    `Iltimos, o'quv markaziga murojaat qiling.`
  );
}
