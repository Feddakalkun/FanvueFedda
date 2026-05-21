import { NextResponse } from "next/server";
import { FanvueMessagingAPI } from "@/core/api/fanvue/messaging.js";
import { FanvueWebhookRouter } from "@/core/api/fanvue/webhooks.js";

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-fanvue-signature") || "";

  const messaging = new FanvueMessagingAPI({});
  const verified = messaging.verifyWebhookSignature(raw, signature);
  if (!verified) {
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 });
  }

  const payload = JSON.parse(raw || "{}");
  const router = new FanvueWebhookRouter({ messaging });
  const result = await router.handle(payload);
  return NextResponse.json({ ok: true, result });
}
