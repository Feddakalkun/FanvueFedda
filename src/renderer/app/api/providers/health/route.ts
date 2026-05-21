import { NextResponse } from "next/server";
import { getRuntime } from "@/renderer/lib/server/runtime";

export async function GET() {
  const { providers } = getRuntime();
  const health = await providers.healthCheck();
  return NextResponse.json(health);
}
