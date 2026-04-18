import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const kurslar = await prisma.kurs.findMany({
    include: {
      guruhlar: {
        where: { faol: true },
        include: {
          _count: { select: { talabalar: { where: { faol: true } } } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(kurslar);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const kurs = await prisma.kurs.create({ data: body });
  return NextResponse.json(kurs, { status: 201 });
}
