import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const oy = searchParams.get("oy");
  const yil = searchParams.get("yil");
  const talabaId = searchParams.get("talabaId");

  const tolovlar = await prisma.tolov.findMany({
    where: {
      ...(oy && { oy: parseInt(oy) }),
      ...(yil && { yil: parseInt(yil) }),
      ...(talabaId && { talabaId }),
    },
    include: {
      talaba: { select: { id: true, ism: true, familiya: true, telefon: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(tolovlar);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  const body = await req.json();
  const tolov = await prisma.tolov.create({
    data: { ...body, qabulQildi: session?.user?.name ?? null },
    include: {
      talaba: { select: { ism: true, familiya: true } },
    },
  });
  return NextResponse.json(tolov, { status: 201 });
}
