import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

// Guruhga talaba qo'shish
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth(["ADMIN", "RECEPTION"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { talabaId } = await req.json();

  const tg = await prisma.talabaGuruh.upsert({
    where:  { talabaId_guruhId: { talabaId, guruhId: params.id } },
    update: { faol: true, chiqishSana: null },
    create: { talabaId, guruhId: params.id },
  });

  return NextResponse.json(tg, { status: 201 });
}

// Talabani guruhdan chiqarish (soft delete)
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await requireAuth(["ADMIN", "RECEPTION"]);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { talabaId } = await req.json();

  await prisma.talabaGuruh.update({
    where: { talabaId_guruhId: { talabaId, guruhId: params.id } },
    data:  { faol: false, chiqishSana: new Date() },
  });

  return NextResponse.json({ ok: true });
}
