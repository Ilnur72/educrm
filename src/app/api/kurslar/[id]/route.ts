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

  const { nom, tavsif, davomiyligi, narxi, maxTalaba, faol } = await req.json();

  const kurs = await prisma.kurs.update({
    where: { id: params.id },
    data: {
      nom,
      tavsif:      tavsif      || null,
      davomiyligi: parseInt(davomiyligi),
      narxi:       parseInt(narxi),
      maxTalaba:   parseInt(maxTalaba),
      ...(faol !== undefined && { faol }),
    },
  });

  return NextResponse.json(kurs);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  await prisma.kurs.update({
    where: { id: params.id },
    data: { faol: false },
  });

  return NextResponse.json({ ok: true });
}
