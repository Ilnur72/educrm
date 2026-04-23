import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth } from "@/lib/auth";

export async function GET() {
  const session = await requireAuth(["DIREKTOR", "ADMIN"]);
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  // ADMIN faqat o'z filialini ko'radi
  if (session.user.role === "ADMIN" && session.user.filialId) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const filial = await (prisma as any).filial.findUnique({
      where: { id: session.user.filialId },
    });
    return NextResponse.json(filial ? [filial] : []);
  }

  // DIREKTOR — barchasi
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filiallar = await (prisma as any).filial.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: {
        select: { talabalar: true, guruhlar: true, userlar: true },
      },
    },
  });

  return NextResponse.json(filiallar);
}

export async function POST(req: NextRequest) {
  const session = await requireAuth(["DIREKTOR"]);
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { nom, manzil, telefon } = await req.json();
  if (!nom) return NextResponse.json({ error: "Nom majburiy" }, { status: 400 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filial = await (prisma as any).filial.create({
    data: { nom, manzil: manzil || null, telefon: telefon || null },
  });

  return NextResponse.json(filial, { status: 201 });
}
