import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

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

  // Guruh va talabalar
  const guruh = await prisma.guruh.findUnique({
    where: { id: guruhId },
    include: {
      kurs: { select: { nom: true } },
      talabalar: {
        where: { faol: true },
        include: {
          talaba: {
            select: { id: true, ism: true, familiya: true },
          },
        },
        orderBy: { talaba: { familiya: "asc" } },
      },
    },
  });

  if (!guruh) return NextResponse.json({ error: "Guruh topilmadi" }, { status: 404 });

  // O'sha oy darslar
  const darslar = await prisma.dars.findMany({
    where: {
      guruhId,
      sana: { gte: oyBoshi, lt: oyOxiri },
    },
    include: {
      davomatlar: { select: { talabaId: true, holat: true } },
    },
    orderBy: { sana: "asc" },
  });

  // Talabalar ro'yxati
  const talabalar = guruh.talabalar.map((tg) => {
    const kunlar: Record<number, string> = {};
    let keldi = 0, kelmadi = 0, kech = 0, sababli = 0;

    for (const dars of darslar) {
      const kun   = new Date(dars.sana).getDate();
      const dvmt  = dars.davomatlar.find((d) => d.talabaId === tg.talaba.id);
      const holat = dvmt?.holat ?? null;
      if (holat) {
        kunlar[kun] = holat;
        if (holat === "KELDI")      keldi++;
        if (holat === "KELMADI")    kelmadi++;
        if (holat === "KECH_KELDI") kech++;
        if (holat === "SABABLI")    sababli++;
      }
    }

    const jami  = keldi + kelmadi + kech + sababli;
    const foiz  = jami > 0 ? Math.round(((keldi + kech) / jami) * 100) : null;

    return {
      id:       tg.talaba.id,
      ism:      tg.talaba.ism,
      familiya: tg.talaba.familiya,
      kunlar,
      keldi, kelmadi, kech, sababli, foiz,
    };
  });

  // Dars kunlari (sanalar)
  const sanalar = darslar.map((d) => new Date(d.sana).getDate());

  return NextResponse.json({
    guruhNom: guruh.nom,
    kursNom:  guruh.kurs.nom,
    oy, yil, sanalar, talabalar,
  });
}
