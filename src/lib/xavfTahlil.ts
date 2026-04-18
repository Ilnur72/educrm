import { prisma } from "@/lib/db";

export type XavfDarajasi = "XAVFLI" | "DIQQAT" | "YAXSHI";

export type TalabaXavf = {
  id: string;
  ism: string;
  familiya: string;
  telefon: string;
  otaTelegramId: string | null;
  guruhNom: string;
  kursNom: string;
  ball: number;
  daraja: XavfDarajasi;
  sabablar: string[];
  // Tafsilotlar
  oxirgi2HaftaDavomat: number;  // foiz
  oldingi2HaftaDavomat: number; // foiz
  buOyTolovBor: boolean;
};

// So'nggi N kun ichidagi davomat foizini hisoblash
function davomatFoiz(davomatlar: { holat: string; dars: { sana: Date } }[], kunOxiri: Date, kunBoshi: Date): number {
  const filtered = davomatlar.filter((d) => {
    const sana = d.dars.sana;
    return sana >= kunBoshi && sana < kunOxiri;
  });
  if (filtered.length === 0) return 100; // Ma'lumot yo'q — xavfli emas
  const keldi = filtered.filter((d) => d.holat === "KELDI" || d.holat === "KECH_KELDI").length;
  return Math.round((keldi / filtered.length) * 100);
}

export async function xavfliTalabalarniTopish(): Promise<TalabaXavf[]> {
  const bugun  = new Date();
  bugun.setHours(0, 0, 0, 0);

  const ikki_hafta_oldin  = new Date(bugun); ikki_hafta_oldin.setDate(bugun.getDate() - 14);
  const tort_hafta_oldin  = new Date(bugun); tort_hafta_oldin.setDate(bugun.getDate() - 28);

  const hozir_oy  = bugun.getMonth() + 1;
  const hozir_yil = bugun.getFullYear();

  const talabalar = await prisma.talaba.findMany({
    where: {
      faol: true,
      guruhlar: { some: { faol: true } },
    },
    include: {
      guruhlar: {
        where:   { faol: true },
        include: { guruh: { include: { kurs: { select: { nom: true, narxi: true } } } } },
        take: 1,
      },
      tolovlar: { where: { oy: hozir_oy, yil: hozir_yil } },
      davomatlar: {
        where: { dars: { sana: { gte: tort_hafta_oldin } } },
        include: { dars: { select: { sana: true } } },
      },
    },
  });

  const natijalar: TalabaXavf[] = [];

  for (const t of talabalar) {
    const guruh = t.guruhlar[0];
    if (!guruh) continue;

    // Davomat foizlari
    const oxirgi2 = davomatFoiz(t.davomatlar as any, bugun, ikki_hafta_oldin);
    const oldingi2 = davomatFoiz(t.davomatlar as any, ikki_hafta_oldin, tort_hafta_oldin);

    // To'lov holati
    const narxi    = guruh.guruh.kurs.narxi;
    const tolangan = t.tolovlar.reduce((s, p) => s + p.summa, 0);
    const tolovBor = tolangan >= narxi;

    // Ball hisoblash
    let ball      = 0;
    const sabablar: string[] = [];

    if (oxirgi2 < 70) {
      ball -= 2;
      sabablar.push(`Oxirgi 2 hafta davomati ${oxirgi2}%`);
    }

    if (!tolovBor) {
      ball -= 2;
      sabablar.push("Bu oy to'lov qilinmagan");
    }

    if (oxirgi2 < oldingi2 - 20 && oldingi2 > 0) {
      ball -= 1;
      sabablar.push(`Davomat ${oldingi2}% dan ${oxirgi2}% ga tushdi`);
    }

    if (ball === 0) continue; // Xavf yo'q

    const daraja: XavfDarajasi = ball <= -3 ? "XAVFLI" : "DIQQAT";

    natijalar.push({
      id:                  t.id,
      ism:                 t.ism,
      familiya:            t.familiya,
      telefon:             t.telefon,
      otaTelegramId:       t.otaTelegramId,
      guruhNom:            guruh.guruh.nom,
      kursNom:             guruh.guruh.kurs.nom,
      ball,
      daraja,
      sabablar,
      oxirgi2HaftaDavomat: oxirgi2,
      oldingi2HaftaDavomat: oldingi2,
      buOyTolovBor:        tolovBor,
    });
  }

  // Eng xavflidan boshlab
  return natijalar.sort((a, b) => a.ball - b.ball);
}
