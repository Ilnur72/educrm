import { NextRequest, NextResponse } from "next/server";
import { getSession, getFilialFilter } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { LidHolat, LidManba } from "@prisma/client";

async function auth() {
  const session = await getSession();
  if (!session) return null;
  return session;
}

export async function GET(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: "Kirish kerak" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const holat  = searchParams.get("holat") as LidHolat | null;
  const manba  = searchParams.get("manba") as LidManba | null;
  const search = searchParams.get("search");
  const oy     = searchParams.get("oy");
  const yil    = searchParams.get("yil");
  const filialFilter = await getFilialFilter(searchParams.get("filialId"));

  let dateFilter = {};
  if (oy && yil) {
    const start = new Date(parseInt(yil), parseInt(oy) - 1, 1);
    const end   = new Date(parseInt(yil), parseInt(oy), 1);
    dateFilter  = { createdAt: { gte: start, lt: end } };
  } else if (yil) {
    const start = new Date(parseInt(yil), 0, 1);
    const end   = new Date(parseInt(yil) + 1, 0, 1);
    dateFilter  = { createdAt: { gte: start, lt: end } };
  }

  const lidlar = await prisma.lid.findMany({
    where: {
      ...filialFilter,
      ...(holat  && { holat }),
      ...(manba  && { manba }),
      ...dateFilter,
      ...(search && {
        OR: [
          { ism:     { contains: search, mode: "insensitive" } },
          { telefon: { contains: search } },
        ],
      }),
    },
    orderBy: { createdAt: "desc" },
    include: {
      talaba: {
        select: {
          id: true,
          ism: true,
          familiya: true,
          guruhlar: {
            where: { faol: true },
            include: { guruh: { include: { kurs: { select: { nom: true } } } } },
            take: 1,
          },
        },
      },
    },
  });

  return NextResponse.json(lidlar);
}

export async function POST(req: NextRequest) {
  if (!await auth()) return NextResponse.json({ error: "Kirish kerak" }, { status: 401 });

  const body = await req.json();
  const filialFilter = await getFilialFilter();
  const lid  = await prisma.lid.create({
    data: {
      ...body,
      ...(filialFilter && "filialId" in filialFilter ? { filialId: filialFilter.filialId } : {}),
    },
  });
  return NextResponse.json(lid, { status: 201 });
}
