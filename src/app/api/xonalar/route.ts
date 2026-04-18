import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const xonalar = await prisma.xona.findMany({
    orderBy: { nom: "asc" },
  });

  return NextResponse.json(xonalar);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const { nom, sigim, izoh } = await req.json();

  if (!nom) return NextResponse.json({ error: "Nom majburiy" }, { status: 400 });

  const xona = await prisma.xona.create({
    data: { nom, sigim: sigim ? parseInt(sigim) : null, izoh: izoh || null },
  });

  return NextResponse.json(xona, { status: 201 });
}
