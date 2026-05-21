import { NextResponse } from "next/server";
import { getRuntime } from "@/renderer/lib/server/runtime";

function aggregateProviderStatus(report: Record<string, { status?: string }>) {
  const values = Object.values(report || {});
  if (values.some((x) => x?.status === "down")) return "down";
  if (values.some((x) => x?.status === "degraded")) return "degraded";
  return "healthy";
}

export async function GET() {
  const { autoposter, providers } = getRuntime();
  const providerHealth = await providers.healthCheck();
  const summary = autoposter.summary();

  return NextResponse.json({
    queue: summary.queue,
    lastRun: summary.lastRun,
    recentFailures: summary.recentFailures.slice(0, 10),
    providerHealth,
    providerStatus: aggregateProviderStatus(providerHealth),
    generationPipeline: {
      status: providerHealth["comfyui-local"]?.status || "degraded",
      detail: providerHealth["comfyui-local"]?.reason || "unknown",
    },
  });
}
