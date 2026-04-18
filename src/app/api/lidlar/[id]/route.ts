import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Kirish kerak" }, { status: 401 });

  const body = await req.json();

  // SINOV_DARSI ga o'tganda sinovSanasi avtomatik bugunga o'rnatiladi
  if (body.holat === "SINOV_DARSI" && !body.sinovSanasi) {
    const mavjud = await prisma.lid.findUnique({
      where:  { id: params.id },
      select: { sinovSanasi: true },
    });
    if (!mavjud?.sinovSanasi) {
      body.sinovSanasi = new Date();
    }
  }

  const lid = await prisma.lid.update({ where: { id: params.id }, data: body });
  return NextResponse.json(lid);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Kirish kerak" }, { status: 401 });

  await prisma.lid.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
