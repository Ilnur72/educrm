import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePortalAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await requirePortalAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const talabaId = session.user.talabaId!;
  const { searchParams } = new URL(req.url);
  const oy  = parseInt(searchParams.get("oy")  ?? String(new Date().getMonth() + 1));
  const yil = parseInt(searchParams.get("yil") ?? String(new Date().getFullYear()));

  // Talabaning faol guruhini topamiz
  const talabaGuruh = await prisma.talabaGuruh.findFirst({
    where: { talabaId, faol: true },
    select: { guruhId: true },
  });

  if (!talabaGuruh) return NextResponse.json({ sanalar: [], davomatlar: {} });

  const guruhId = talabaGuruh.guruhId;

  const [guruh, darslar, davomatlar] = await Promise.all([
    prisma.guruh.findUnique({
      where: { id: guruhId },
      select: { kunlar: true },
    }),
    prisma.dars.findMany({
      where: {
        guruhId,
        sana: {
          gte: new Date(yil, oy - 1, 1),
          lt:  new Date(yil, oy,     1),
        },
      },
      select: { id: true, sana: true },
    }),
    prisma.davomat.findMany({
      where: {
        talabaId,
        dars: {
          guruhId,
          sana: {
            gte: new Date(yil, oy - 1, 1),
            lt:  new Date(yil, oy,     1),
          },
        },
      },
      select: { darsId: true, holat: true, baho: true },
    }),
  ]);

  if (!guruh) return NextResponse.json({ sanalar: [], davomatlar: {} });

  const KUN_MAP: Record<string, number> = {
    ya: 0, du: 1, se: 2, ch: 3, pa: 4, ju: 5, sha: 6, sh: 6,
  };

  const scheduledDays = guruh.kunlar
    .map((k) => KUN_MAP[k.toLowerCase()])
    .filter((n): n is number => n !== undefined);

  const sanalar: { kun: number; hafta: number }[] = [];
  const iter = new Date(yil, oy - 1, 1);
  while (iter.getMonth() === oy - 1) {
    if (scheduledDays.includes(iter.getDay())) {
      sanalar.push({ kun: iter.getDate(), hafta: iter.getDay() });
    }
    iter.setDate(iter.getDate() + 1);
  }

  const darsMap = new Map(darslar.map((d) => [new Date(d.sana).getDate(), d.id]));
  const davomatMap = new Map(davomatlar.map((d) => [d.darsId, { holat: d.holat, baho: d.baho }]));

  const kunlar: Record<number, { holat: string; baho: number | null } | null> = {};
  for (const { kun } of sanalar) {
    const darsId = darsMap.get(kun);
    kunlar[kun] = darsId ? (davomatMap.get(darsId) ?? null) : null;
  }

  // Statistika
  const vals = Object.values(kunlar).filter(Boolean);
  const keldi    = vals.filter((v) => v?.holat === "KELDI" || v?.holat === "KECH_KELDI").length;
  const kelmadi  = vals.filter((v) => v?.holat === "KELMADI").length;
  const baholar  = vals.map((v) => v?.baho).filter((b): b is number => b !== null && b !== undefined);
  const ortachaBaho = baholar.length ? Math.round(baholar.reduce((a, b) => a + b, 0) / baholar.length) : null;

  return NextResponse.json({ sanalar, kunlar, keldi, kelmadi, ortachaBaho });
}
