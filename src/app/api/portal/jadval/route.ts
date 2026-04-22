import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePortalAuth } from "@/lib/auth";

export async function GET() {
  const session = await requirePortalAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const talabaId = session.user.talabaId!;

  const talabaGuruhlar = await prisma.talabaGuruh.findMany({
    where: { talabaId, faol: true },
    select: {
      guruh: {
        select: {
          id: true, nom: true, vaqt: true, xona: true, kunlar: true,
          kurs: { select: { nom: true } },
          oqituvchi: { select: { user: { select: { name: true } } } },
        },
      },
    },
  });

  const guruhlar = talabaGuruhlar.map((tg) => tg.guruh);
  return NextResponse.json(guruhlar);
}
