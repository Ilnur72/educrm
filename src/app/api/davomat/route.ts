import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { DavomatHolat } from "@prisma/client";
import { sendMessage, xabarKelmadi, xabarKechKeldi } from "@/lib/telegram";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const guruhId = searchParams.get("guruhId");
  const darsId = searchParams.get("darsId");

  if (!guruhId) {
    return NextResponse.json({ error: "guruhId kerak" }, { status: 400 });
  }

  const davomatlar = await prisma.davomat.findMany({
    where: {
      guruhId,
      ...(darsId && { darsId }),
    },
    include: {
      talaba: { select: { id: true, ism: true, familiya: true } },
      dars: true,
    },
  });

  return NextResponse.json(davomatlar);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // body: { guruhId, sana, davomatlar: [{talabaId, holat}] }
  const { guruhId, sana, mavzu, davomatlar } = body;

  // Dars yaratish
  const dars = await prisma.dars.create({
    data: { guruhId, sana: new Date(sana), mavzu },
  });

  // Davomatlarni saqlash
  const result = await prisma.davomat.createMany({
    data: (davomatlar as { talabaId: string; holat: DavomatHolat; baho?: number | null }[]).map(
      (d) => ({
        talabaId: d.talabaId,
        guruhId,
        darsId: dars.id,
        holat: d.holat,
        baho: d.baho ?? null,
      })
    ),
  });

  // Telegram xabarnomasi yuborish
  const xabarTalabalar = davomatlar.filter(
    (d: { talabaId: string; holat: string }) =>
      d.holat === "KELMADI" || d.holat === "KECH_KELDI"
  );

  if (xabarTalabalar.length > 0) {
    const guruh = await prisma.guruh.findUnique({
      where:  { id: guruhId },
      select: { nom: true },
    });
    const sanaMatn = new Date(sana).toLocaleDateString("uz-UZ", {
      day: "numeric", month: "long",
    });

    const talabalar = await prisma.talaba.findMany({
      where:  { id: { in: xabarTalabalar.map((d: { talabaId: string }) => d.talabaId) } },
      select: { id: true, ism: true, familiya: true, otaTelegramId: true },
    });

    for (const d of xabarTalabalar as { talabaId: string; holat: string }[]) {
      const talaba = talabalar.find((t) => t.id === d.talabaId);
      if (!talaba?.otaTelegramId) continue;

      const matn = d.holat === "KELMADI"
        ? xabarKelmadi(talaba.ism, talaba.familiya, guruh?.nom ?? "", sanaMatn)
        : xabarKechKeldi(talaba.ism, talaba.familiya, guruh?.nom ?? "", sanaMatn);

      await sendMessage(talaba.otaTelegramId, matn);
    }
  }

  return NextResponse.json({ dars, count: result.count }, { status: 201 });
}
