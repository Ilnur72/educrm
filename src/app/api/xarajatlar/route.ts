import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, getFilialFilter } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await requireAuth(["ADMIN", "DIREKTOR"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const oy  = searchParams.get("oy");
  const yil = searchParams.get("yil");
  const filialFilter = await getFilialFilter(searchParams.get("filialId"));

  const xarajatlar = await prisma.xarajat.findMany({
    where: {
      ...filialFilter,
      ...(oy && yil && {
        sana: {
          gte: new Date(parseInt(yil), parseInt(oy) - 1, 1),
          lt:  new Date(parseInt(yil), parseInt(oy),     1),
        },
      }),
    },
    orderBy: { sana: "desc" },
  });

  return NextResponse.json(xarajatlar);
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(["ADMIN", "DIREKTOR"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { tur, summa, sana, izoh } = await req.json();
  const filialFilter = await getFilialFilter();
  const xarajat = await prisma.xarajat.create({
    data: {
      tur, summa: parseInt(summa), sana: new Date(sana), izoh: izoh || null,
      ...(filialFilter && "filialId" in filialFilter ? { filialId: filialFilter.filialId } : {}),
    },
  });
  return NextResponse.json(xarajat, { status: 201 });
}
