import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePortalAuth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await requirePortalAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const talabaId = session.user.talabaId!;
  const { searchParams } = new URL(req.url);
  const yil = searchParams.get("yil") ? parseInt(searchParams.get("yil")!) : undefined;

  const tolovlar = await prisma.tolov.findMany({
    where: { talabaId, ...(yil && { yil }) },
    orderBy: [{ yil: "desc" }, { oy: "desc" }],
    select: {
      id: true, summa: true, tur: true, oy: true, yil: true,
      izoh: true, qabulQildi: true, createdAt: true,
    },
  });

  return NextResponse.json(tolovlar);
}
