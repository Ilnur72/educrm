import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Kun kodlarini JS weekday raqamiga moslashtirish
// JS: 0=Yakshanba, 1=Dushanba, 2=Seshanba, 3=Chorshanba, 4=Payshanba, 5=Juma, 6=Shanba
const KUN_MAP: Record<string, number> = {
  ya: 0, du: 1, se: 2, ch: 3, pa: 4, ju: 5, sha: 6, sh: 6,
};

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Kirish kerak" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const guruhId = searchParams.get("guruhId");
  const hozir   = new Date();
  const oy      = parseInt(searchParams.get("oy")  ?? String(hozir.getMonth() + 1));
  const yil     = parseInt(searchParams.get("yil") ?? String(hozir.getFullYear()));

  if (!guruhId) return NextResponse.json({ error: "guruhId kerak" }, { status: 400 });

  const oyBoshi = new Date(yil, oy - 1, 1);
  const oyOxiri = new Date(yil, oy, 1);

  const guruh = await prisma.guruh.findUnique({
    where: { id: guruhId },
    include: {
      kurs: { select: { nom: true } },
      talabalar: {
        where: { faol: true },
        include: {
          talaba: { select: { id: true, ism: true, familiya: true } },
        },
        orderBy: { talaba: { familiya: "asc" } },
      },
    },
  });

  if (!guruh) return NextResponse.json({ error: "Guruh topilmadi" }, { status: 404 });

  // Guruhning haftalik dars kunlarini JS weekday raqamlariga o'girish
  const scheduledDays = guruh.kunlar
    .map(k => KUN_MAP[k.toLowerCase()])
    .filter((n): n is number => n !== undefined);

  // Oyning barcha dars kunlarini generatsiya qilish
  const sanalar: { kun: number; hafta: number }[] = [];
  const iter = new Date(yil, oy - 1, 1);
  while (iter.getMonth() === oy - 1) {
    if (scheduledDays.includes(iter.getDay())) {
      sanalar.push({ kun: iter.getDate(), hafta: iter.getDay() });
    }
    iter.setDate(iter.getDate() + 1);
  }

  // O'sha oy uchun haqiqiy dars yozuvlarini olish
  const darslar = await prisma.dars.findMany({
    where: {
      guruhId,
      sana: { gte: oyBoshi, lt: oyOxiri },
    },
    include: {
      davomatlar: { select: { talabaId: true, holat: true, baho: true } },
    },
    orderBy: { sana: "asc" },
  });

  // Kun raqami → dars yozuvi xaritasi
  const darsMap = new Map<number, typeof darslar[0]>();
  for (const dars of darslar) {
    const kun = new Date(dars.sana).getDate();
    darsMap.set(kun, dars);
  }

  // Har bir talaba uchun davomat ma'lumotlari
  const talabalar = guruh.talabalar.map((tg) => {
    const kunlar: Record<number, { holat: string; baho: number | null }> = {};
    let keldi = 0, kelmadi = 0, kech = 0, sababli = 0;
    const baholar: number[] = [];

    for (const { kun } of sanalar) {
      const dars = darsMap.get(kun);
      if (!dars) continue; // Bu kun dars o'tilmagan (davomat olinmagan)

      const dvmt = dars.davomatlar.find(d => d.talabaId === tg.talaba.id);
      if (!dvmt) continue;

      kunlar[kun] = { holat: dvmt.holat, baho: dvmt.baho ?? null };

      if (dvmt.holat === "KELDI")      { keldi++;   if (dvmt.baho !== null) baholar.push(dvmt.baho); }
      if (dvmt.holat === "KELMADI")    kelmadi++;
      if (dvmt.holat === "KECH_KELDI") { kech++;    if (dvmt.baho !== null) baholar.push(dvmt.baho); }
      if (dvmt.holat === "SABABLI")    sababli++;
    }

    const ortachaBaho = baholar.length > 0
      ? Math.round((baholar.reduce((a, b) => a + b, 0) / baholar.length) * 10) / 10
      : null;

    return {
      id: tg.talaba.id, ism: tg.talaba.ism, familiya: tg.talaba.familiya,
      kunlar, keldi, kelmadi, kech, sababli, ortachaBaho,
    };
  });

  return NextResponse.json({
    guruhNom: guruh.nom,
    kursNom:  guruh.kurs.nom,
    oy, yil,
    sanalar,   // Guruh jadvaliga ko'ra oyning barcha dars kunlari
    talabalar,
  });
}
