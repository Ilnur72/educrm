import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

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
  const body = await req.json();
  const tolov = await prisma.tolov.create({
    data: body,
    include: {
      talaba: { select: { ism: true, familiya: true } },
    },
  });
  return NextResponse.json(tolov, { status: 201 });
}
