import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

// POST /api/lidlar/[id]/yozish — lidni talabaga o'tkazish va guruhga biriktirish
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { guruhId, telefon, otaTelefon } = await req.json();

  const lid = await prisma.lid.findUnique({ where: { id: params.id } });
  if (!lid) return NextResponse.json({ error: "Lid topilmadi" }, { status: 404 });

  // Ism va familiyani ajratamiz
  const [ism, ...qolgan] = lid.ism.trim().split(" ");
  const familiya = qolgan.join(" ") || "—";

  // Talaba yaratamiz
  const talaba = await prisma.talaba.create({
    data: {
      ism,
      familiya,
      telefon:    telefon    || lid.telefon,
      otaTelefon: otaTelefon || null,
    },
  });

  // Guruhga birikhtiramiz (agar tanlangan bo'lsa)
  if (guruhId) {
    await prisma.talabaGuruh.create({
      data: { talabaId: talaba.id, guruhId },
    });
  }

  // Lid holatini YOZILDI ga o'tkazamiz + talabani bog'laymiz
  await prisma.lid.update({
    where: { id: params.id },
    data: { holat: "YOZILDI", talabaId: talaba.id },
  });

  return NextResponse.json(talaba, { status: 201 });
}
