import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

async function xonaConflict({
  xona, vaqt, kunlar, excludeId,
}: { xona: string; vaqt: string; kunlar: string[]; excludeId?: string }) {
  const mavjudlar = await prisma.guruh.findMany({
    where: {
      xona,
      vaqt,
      faol: true,
      ...(excludeId && { id: { not: excludeId } }),
    },
    select: { id: true, nom: true, kunlar: true, vaqt: true },
  });
  return mavjudlar.find((g) => g.kunlar.some((k) => kunlar.includes(k))) ?? null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const guruh = await prisma.guruh.findUnique({
    where: { id: params.id },
    include: {
      kurs: true,
      oqituvchi: { include: { user: { select: { name: true, email: true } } } },
      talabalar: {
        where: { faol: true },
        include: {
          talaba: {
            include: {
              tolovlar: {
                where: {
                  oy:  new Date().getMonth() + 1,
                  yil: new Date().getFullYear(),
                },
              },
            },
          },
        },
        orderBy: { kirishSana: "asc" },
      },
      darslar: {
        orderBy: { sana: "desc" },
        take: 10,
        include: {
          davomatlar: { select: { holat: true } },
        },
      },
      _count: {
        select: {
          talabalar: { where: { faol: true } },
          darslar: true,
        },
      },
    },
  });

  if (!guruh) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  return NextResponse.json(guruh);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { nom, oqituvchiId, xona, kunlar, vaqt, boshlanish, faol } = await req.json();

  // Xona va vaqt konflikti tekshiruvi
  if (xona && vaqt && kunlar?.length) {
    const conflict = await xonaConflict({ xona, vaqt, kunlar, excludeId: params.id });
    if (conflict) {
      return NextResponse.json(
        { error: `"${xona}" xonasi ${vaqt} vaqtida "${conflict.nom}" guruhi uchun band (${conflict.kunlar.join(", ")})` },
        { status: 409 }
      );
    }
  }

  const guruh = await prisma.guruh.update({
    where: { id: params.id },
    data: {
      nom,
      oqituvchiId: oqituvchiId || null,
      xona:        xona        || null,
      kunlar:      kunlar      ?? [],
      vaqt,
      ...(boshlanish && { boshlanish: new Date(boshlanish) }),
      ...(faol !== undefined && { faol }),
    },
  });

  return NextResponse.json(guruh);
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  await prisma.guruh.update({
    where: { id: params.id },
    data: { faol: false },
  });

  return NextResponse.json({ ok: true });
}
