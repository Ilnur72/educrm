import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const { telefon, mutaxassislik, ishHaqiTuri, foiz, soatlik } = await req.json();

  const oqituvchi = await prisma.oqituvchi.update({
    where: { id: params.id },
    data: {
      telefon:       telefon       || null,
      mutaxassislik: mutaxassislik ?? [],
      ishHaqiTuri,
      foiz:          ishHaqiTuri === "FOIZ"    ? parseFloat(foiz)    : null,
      soatlik:       ishHaqiTuri !== "FOIZ"    ? parseInt(soatlik)   : null,
    },
    include: { user: { select: { name: true, email: true } } },
  });

  return NextResponse.json(oqituvchi);
}
