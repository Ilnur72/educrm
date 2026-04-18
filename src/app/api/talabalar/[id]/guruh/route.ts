import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// POST /api/talabalar/[id]/guruh — talabani guruhga biriktirish
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { guruhId } = await req.json();
  if (!guruhId) return NextResponse.json({ error: "guruhId majburiy" }, { status: 400 });

  // Avvalgi faol guruhni tugatamiz
  await prisma.talabaGuruh.updateMany({
    where: { talabaId: params.id, faol: true },
    data: { faol: false, chiqishSana: new Date() },
  });

  // Yangi guruhga birikhtiramiz
  const birikma = await prisma.talabaGuruh.upsert({
    where: { talabaId_guruhId: { talabaId: params.id, guruhId } },
    update: { faol: true, chiqishSana: null, kirishSana: new Date() },
    create: { talabaId: params.id, guruhId, faol: true },
  });

  return NextResponse.json(birikma, { status: 201 });
}

// DELETE /api/talabalar/[id]/guruh — guruhdan chiqarish
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { guruhId } = await req.json();

  await prisma.talabaGuruh.updateMany({
    where: { talabaId: params.id, guruhId, faol: true },
    data: { faol: false, chiqishSana: new Date() },
  });

  return NextResponse.json({ ok: true });
}
