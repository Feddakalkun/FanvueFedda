const { categorizeError } = require("../../api/errors");

class FanvueAdapter {
  constructor({ contentApi } = {}) {
    this.contentApi = contentApi;
  }

  async validate(job) {
    if (!job?.platform) return { valid: false, error: "missing_platform" };
    if (job.platform !== "fanvue") return { valid: false, error: "unsupported_platform" };
    if (!job.content?.caption && !job.content?.text) return { valid: false, error: "missing_caption" };
    return { valid: true };
  }

  async publish(job) {
    const payload = {
      text: job.content.caption || job.content.text,
      mediaUuids: job.content.mediaUuids || [],
      scheduledAt: job.scheduledAt || undefined,
      price: job.content.price || 0,
      audience: job.content.audience || "subscribers",
    };

    try {
      return await this.contentApi.createPost(payload, job.content.accountId || "default");
    } catch (err) {
      const category = categorizeError(err);
      const wrapped = new Error(`fanvue_publish_${category}:${err.message || "unknown"}`);
      wrapped.category = category;
      throw wrapped;
    }
  }

  async health() {
    return { status: "healthy", adapter: "fanvue" };
  }
}

module.exports = { FanvueAdapter };
