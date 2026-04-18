import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { xavfliTalabalarniTopish } from "@/lib/xavfTahlil";

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Kirish kerak" }, { status: 401 });

  const natijalar = await xavfliTalabalarniTopish();
  return NextResponse.json(natijalar);
}
