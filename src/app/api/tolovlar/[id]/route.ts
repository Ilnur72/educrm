import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth(["ADMIN", "RECEPTION"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.tolov.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
