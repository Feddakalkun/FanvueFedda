/* eslint-disable @typescript-eslint/no-require-imports */
const { AutoPoster } = require("@/core/content/autoposter.js");
const { FanvueAdapter } = require("@/core/content/adapters/fanvueAdapter.js");
const { FanvueAuth } = require("@/core/api/fanvue/auth.js");
const { FanvueContentAPI } = require("@/core/api/fanvue/content.js");
const { TokenStore } = require("@/core/api/fanvue/tokenStore.js");
const { ProviderOrchestrator } = require("@/core/api/providerOrchestrator.js");

type RuntimeBundle = {
  autoposter: any;
  providers: any;
};

const globalForRuntime = globalThis as unknown as { __fanvueRuntime?: RuntimeBundle };

function buildRuntime(): RuntimeBundle {
  const tokenStore = new TokenStore();
  const auth = new FanvueAuth({ tokenStore });
  const contentApi = new FanvueContentAPI({ auth });
  const fanvueAdapter = new FanvueAdapter({ contentApi });

  const autoposter = new AutoPoster({
    publishAdapter: fanvueAdapter,
    timezone: "Europe/Oslo",
  });

  const providers = new ProviderOrchestrator({
    providers: {
      "comfyui-local": {
        async generateImage() {
          return { ok: false, reason: "not_connected_yet" };
        },
        async healthCheck() {
          return { status: "degraded", provider: "comfyui-local", reason: "not_connected" };
        },
      },
      "ollama-local": {
        async chat() {
          return { ok: false, reason: "not_connected_yet" };
        },
        async healthCheck() {
          return { status: "degraded", provider: "ollama-local", reason: "not_connected" };
        },
      },
      venice: {
        async healthCheck() {
          return { status: "degraded", provider: "venice", reason: "fallback_only" };
        },
      },
      openai: {
        async healthCheck() {
          return { status: "degraded", provider: "openai", reason: "fallback_only" };
        },
      },
      grok: {
        async healthCheck() {
          return { status: "degraded", provider: "grok", reason: "fallback_only" };
        },
      },
    },
  });

  return { autoposter, providers };
}

export function getRuntime(): RuntimeBundle {
  if (!globalForRuntime.__fanvueRuntime) {
    globalForRuntime.__fanvueRuntime = buildRuntime();
  }
  return globalForRuntime.__fanvueRuntime;
}
