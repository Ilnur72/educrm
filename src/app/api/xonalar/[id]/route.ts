import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const { nom, sigim, izoh, faol } = await req.json();

  const xona = await prisma.xona.update({
    where: { id: params.id },
    data: {
      nom,
      sigim: sigim ? parseInt(sigim) : null,
      izoh:  izoh  || null,
      ...(faol !== undefined && { faol }),
    },
  });

  return NextResponse.json(xona);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  await prisma.xona.delete({ where: { id: params.id } });

  return NextResponse.json({ ok: true });
}
