import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";
import { sendMessage, xabarDarsBekor } from "@/lib/telegram";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.user.role === "OQITUVCHI") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const { sana, sabab } = await req.json();
  if (!sana) return NextResponse.json({ error: "Sana kiritilmagan" }, { status: 400 });

  const guruh = await prisma.guruh.findUnique({
    where:   { id: params.id },
    include: {
      talabalar: {
        where:   { faol: true },
        include: { talaba: { select: { ism: true, familiya: true, otaTelegramId: true } } },
      },
    },
  });

  if (!guruh) return NextResponse.json({ error: "Guruh topilmadi" }, { status: 404 });

  const sanaSana = new Date(sana).toLocaleDateString("uz-UZ");
  const matn     = xabarDarsBekor(guruh.nom, sanaSana, sabab || undefined);

  // Telegram ulangan ota-onalarga xabar
  let yuborildi = 0;
  for (const tg of guruh.talabalar) {
    if (tg.talaba.otaTelegramId) {
      await sendMessage(tg.talaba.otaTelegramId, matn);
      yuborildi++;
    }
  }

  return NextResponse.json({
    ok: true,
    jami: guruh.talabalar.length,
    yuborildi,
  });
}
