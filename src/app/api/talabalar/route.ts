import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession, getFilialFilter } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") ?? searchParams.get("q");
  const faol   = searchParams.get("faol");
  const filialFilter = await getFilialFilter(searchParams.get("filialId"));

  const where: Record<string, unknown> = { ...filialFilter };
  if (faol !== null) where.faol = faol === "true";
  if (search) {
    where.OR = [
      { ism:      { contains: search, mode: "insensitive" } },
      { familiya: { contains: search, mode: "insensitive" } },
      { telefon:  { contains: search } },
    ];
  }

  const talabalar = await prisma.talaba.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: {
      guruhlar: {
        where: { faol: true },
        include: { guruh: { include: { kurs: true } } },
        take: 1,
      },
      tolovlar: {
        where: {
          oy:  new Date().getMonth() + 1,
          yil: new Date().getFullYear(),
        },
      },
    },
  });

  return NextResponse.json(talabalar);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 401 });

  const { ism, familiya, telefon, otaTelefon, email, manzil, tugilganKun, izoh } = await req.json();

  if (!ism || !familiya || !telefon) {
    return NextResponse.json({ error: "Ism, familiya va telefon majburiy" }, { status: 400 });
  }

  const filialFilter = await getFilialFilter();
  const talaba = await prisma.talaba.create({
    data: {
      ism,
      familiya,
      telefon,
      otaTelefon: otaTelefon || null,
      email:      email      || null,
      manzil:     manzil     || null,
      izoh:       izoh       || null,
      tugilganKun: tugilganKun ? new Date(tugilganKun) : null,
      ...(filialFilter && "filialId" in filialFilter ? { filialId: filialFilter.filialId } : {}),
    },
  });

  return NextResponse.json(talaba, { status: 201 });
}
