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

  const talabalar = guruh.talabalar.map((tg) => {
    const kunlar: Record<number, { holat: string; baho: number | null }> = {};
    let keldi = 0, kelmadi = 0, kech = 0, sababli = 0;
    const baholar: number[] = [];

    for (const dars of darslar) {
      const kun  = new Date(dars.sana).getDate();
      const dvmt = dars.davomatlar.find((d) => d.talabaId === tg.talaba.id);
      if (dvmt) {
        const holat = dvmt.holat;
        kunlar[kun] = { holat, baho: dvmt.baho ?? null };
        if (holat === "KELDI")      { keldi++;   if (dvmt.baho !== null) baholar.push(dvmt.baho); }
        if (holat === "KELMADI")    kelmadi++;
        if (holat === "KECH_KELDI") { kech++;    if (dvmt.baho !== null) baholar.push(dvmt.baho); }
        if (holat === "SABABLI")    sababli++;
      }
    }

    const ortachaBaho = baholar.length > 0
      ? Math.round((baholar.reduce((a, b) => a + b, 0) / baholar.length) * 10) / 10
      : null;

    return {
      id: tg.talaba.id, ism: tg.talaba.ism, familiya: tg.talaba.familiya,
      kunlar, keldi, kelmadi, kech, sababli, ortachaBaho,
    };
  });

  // Sanalar: kun raqami + hafta kuni (0=Ya, 1=Du, ..., 6=Sh)
  const sanalar = darslar.map((d) => ({
    kun:   new Date(d.sana).getDate(),
    hafta: new Date(d.sana).getDay(),
  }));

  return NextResponse.json({
    guruhNom: guruh.nom,
    kursNom:  guruh.kurs.nom,
    oy, yil, sanalar, talabalar,
  });
}
