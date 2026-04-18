import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const talaba = await prisma.talaba.findUnique({
    where: { id: params.id },
    include: {
      guruhlar: {
        include: { guruh: { include: { kurs: true, oqituvchi: { include: { user: true } } } } },
      },
      tolovlar: { orderBy: { createdAt: "desc" } },
      davomatlar: {
        orderBy: { createdAt: "desc" },
        take: 30,
        include: { dars: true },
      },
    },
  });

  if (!talaba) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  return NextResponse.json(talaba);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const body = await req.json();
  const talaba = await prisma.talaba.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json(talaba);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await prisma.talaba.update({
    where: { id: params.id },
    data: { faol: false },
  });
  return NextResponse.json({ ok: true });
}
