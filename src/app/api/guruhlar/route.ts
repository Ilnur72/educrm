import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const kursId = searchParams.get("kursId");
  const faol = searchParams.get("faol");

  const guruhlar = await prisma.guruh.findMany({
    where: {
      ...(kursId && { kursId }),
      ...(faol !== null && { faol: faol === "true" }),
    },
    select: {
      id: true, nom: true, vaqt: true, xona: true, kunlar: true,
      boshlanish: true, tugash: true, faol: true, createdAt: true,
      kursId: true,
      kurs: { select: { id: true, nom: true, narxi: true, davomiyligi: true, maxTalaba: true } },
      oqituvchiId: true,
      oqituvchi: { select: { id: true, user: { select: { name: true } } } },
      _count: { select: { talabalar: { where: { faol: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(guruhlar, {
    headers: { "Cache-Control": "s-maxage=30, stale-while-revalidate=60" },
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Xona va vaqt konflikti tekshiruvi
  if (body.xona && body.vaqt && body.kunlar?.length) {
    const conflict = await xonaConflict({ xona: body.xona, vaqt: body.vaqt, kunlar: body.kunlar });
    if (conflict) {
      return NextResponse.json(
        { error: `"${body.xona}" xonasi ${conflict.vaqt} vaqtida "${conflict.nom}" guruhi uchun band (${conflict.kunlar.join(", ")})` },
        { status: 409 }
      );
    }
  }

  const guruh = await prisma.guruh.create({ data: body });
  return NextResponse.json(guruh, { status: 201 });
}

async function xonaConflict({
  xona, vaqt, kunlar, excludeId,
}: { xona: string; vaqt: string; kunlar: string[]; excludeId?: string }) {
  const mavjudlar = await prisma.guruh.findMany({
    where: {
      xona,
      vaqt,
      faol: true,
      ...(excludeId && { id: { not: excludeId } }),
    },
    select: { id: true, nom: true, kunlar: true, vaqt: true },
  });

  // Kunlar kesishishini tekshirish
  return mavjudlar.find((g) => g.kunlar.some((k) => kunlar.includes(k))) ?? null;
}
