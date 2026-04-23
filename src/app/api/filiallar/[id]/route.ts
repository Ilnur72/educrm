import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(["DIREKTOR"]);
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { nom, manzil, telefon, faol } = await req.json();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filial = await (prisma as any).filial.update({
    where: { id: params.id },
    data: {
      ...(nom      !== undefined && { nom }),
      ...(manzil   !== undefined && { manzil: manzil || null }),
      ...(telefon  !== undefined && { telefon: telefon || null }),
      ...(faol     !== undefined && { faol }),
    },
  });

  return NextResponse.json(filial);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await requireAuth(["DIREKTOR"]);
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (prisma as any).filial.update({
    where: { id: params.id },
    data: { faol: false },
  });

  return NextResponse.json({ ok: true });
}
