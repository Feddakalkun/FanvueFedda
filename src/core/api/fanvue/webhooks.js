class FanvueWebhookRouter {
  constructor({ messaging } = {}) {
    this.messaging = messaging;
  }

  async handle(payload) {
    const event = payload?.event || "unknown";
    if (event === "message.received") {
      return { ok: true, action: "message.received", data: payload.data || null };
    }
    if (event === "subscription.created") {
      return { ok: true, action: "subscription.created", data: payload.data || null };
    }
    if (event === "tip.received") {
      return { ok: true, action: "tip.received", data: payload.data || null };
    }
    return { ok: true, action: "ignored", event };
  }
}

module.exports = { FanvueWebhookRouter };
