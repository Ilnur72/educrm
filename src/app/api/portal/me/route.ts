import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requirePortalAuth } from "@/lib/auth";

export async function GET() {
  const session = await requirePortalAuth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const talabaId = session.user.talabaId!;

  const talaba = await prisma.talaba.findUnique({
    where: { id: talabaId },
    select: {
      id: true, ism: true, familiya: true, telefon: true,
      email: true, login: true,
      guruhlar: {
        where: { faol: true },
        select: {
          guruh: {
            select: {
              id: true, nom: true, vaqt: true, xona: true, kunlar: true,
              kurs: { select: { nom: true, narxi: true } },
              oqituvchi: { select: { user: { select: { name: true } } } },
            },
          },
        },
      },
      tolovlar: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: { oy: true, yil: true, summa: true },
      },
    },
  });

  if (!talaba) return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  return NextResponse.json(talaba);
}
