import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { setWebhook } from "@/lib/telegram";

// POST /api/telegram — webhookni o'rnatish (ADMIN only)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Ruxsat yo'q" }, { status: 403 });
  }

  const { url } = await req.json();
  const webhookUrl = `${url}/api/telegram/webhook`;
  const result = await setWebhook(webhookUrl);
  return NextResponse.json(result);
}
