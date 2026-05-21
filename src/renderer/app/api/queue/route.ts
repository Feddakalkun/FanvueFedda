import { NextResponse } from "next/server";
import { getRuntime } from "@/renderer/lib/server/runtime";

export async function GET() {
  const { autoposter } = getRuntime();
  return NextResponse.json({
    stats: autoposter.queue.getStats(),
    items: autoposter.queue.list(100),
    history: autoposter.queue.recentHistory(30),
  });
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const { autoposter } = getRuntime();

  if (body?.action === "plan") {
    const job = await autoposter.planPost({
      platform: body.platform || "fanvue",
      content: body.content || {
        caption: "Auto planned test post",
        text: "Auto planned test post",
      },
    });
    return NextResponse.json({ ok: true, job });
  }

  if (body?.action === "run") {
    const result = await autoposter.runOnce(new Date());
    return NextResponse.json({ ok: true, result });
  }

  return NextResponse.json({ ok: false, error: "invalid_action" }, { status: 400 });
}
