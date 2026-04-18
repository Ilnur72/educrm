import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// Sanani "Haf. N (Oy)" formatiga o'tkazish
function haftaLabel(sana: Date): string {
  const oylar = ["Yan","Fev","Mar","Apr","May","Iyn","Iyl","Avg","Sen","Okt","Noy","Dek"];
  const oy    = oylar[sana.getMonth()];
  const kun   = sana.getDate();
  return `${kun}-${oy}`;
}

// Sanani hafta boshiga (Dushanbaga) qaytarish
function haftaBoshi(sana: Date): Date {
  const d     = new Date(sana);
  const kun   = d.getDay(); // 0=Yak, 1=Du, ...
  const diff  = (kun === 0 ? -6 : 1 - kun);
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Kirish kerak" }, { status: 401 });

  // So'nggi 12 hafta
  const bugun   = new Date();
  const boshSana = new Date(bugun);
  boshSana.setDate(bugun.getDate() - 12 * 7);
  boshSana.setHours(0, 0, 0, 0);

  const davomatlar = await prisma.davomat.findMany({
    where: {
      talabaId: params.id,
      dars:     { sana: { gte: boshSana } },
    },
    include: { dars: { select: { sana: true } } },
    orderBy: { dars: { sana: "asc" } },
  });

  // Haftalar bo'yicha guruhlash
  const haftaMap = new Map<string, { keldi: number; jami: number; sana: Date }>();

  for (const d of davomatlar) {
    const hafta = haftaBoshi(d.dars.sana);
    const key   = hafta.toISOString();

    if (!haftaMap.has(key)) {
      haftaMap.set(key, { keldi: 0, jami: 0, sana: hafta });
    }
    const entry = haftaMap.get(key)!;
    entry.jami++;
    if (d.holat === "KELDI" || d.holat === "KECH_KELDI") entry.keldi++;
  }

  const trend = [...haftaMap.values()]
    .sort((a, b) => a.sana.getTime() - b.sana.getTime())
    .map((h) => ({
      hafta:    haftaLabel(h.sana),
      foiz:     h.jami > 0 ? Math.round((h.keldi / h.jami) * 100) : null,
      keldi:    h.keldi,
      jami:     h.jami,
    }));

  return NextResponse.json(trend);
}
