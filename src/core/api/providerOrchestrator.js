class ProviderOrchestrator {
  constructor(config = {}) {
    this.providers = config.providers || {};
    this.priority = config.priority || {
      image: ["comfyui-local", "venice", "openai"],
      chat: ["ollama-local", "grok", "openai", "venice"],
    };
  }

  getChain(kind) {
    return this.priority[kind] || [];
  }

  async run(kind, method, payload) {
    const chain = this.getChain(kind);
    const attempts = [];

    for (const key of chain) {
      const provider = this.providers[key];
      if (!provider || typeof provider[method] !== "function") continue;
      try {
        const result = await provider[method](payload);
        return { ok: true, provider: key, result, attempts };
      } catch (err) {
        attempts.push({
          provider: key,
          error: err?.message || String(err),
        });
      }
    }

    return { ok: false, error: "no_provider_succeeded", attempts };
  }

  async healthCheck() {
    const report = {};
    for (const [name, provider] of Object.entries(this.providers)) {
      try {
        if (typeof provider.healthCheck === "function") {
          report[name] = await provider.healthCheck();
        } else {
          report[name] = { status: "degraded", reason: "no_healthcheck" };
        }
      } catch (err) {
        report[name] = { status: "down", reason: err?.message || "healthcheck_failed" };
      }
    }
    return report;
  }
}

module.exports = { ProviderOrchestrator };
