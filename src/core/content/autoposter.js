const { ContentScheduler } = require("./scheduler");
const { ContentQueue } = require("./queue");
const { getThemeForDate } = require("./calendar");

class AutoPoster {
  constructor({ publishAdapter, timezone = "Europe/Oslo" } = {}) {
    this.scheduler = new ContentScheduler({ timezone });
    this.queue = new ContentQueue();
    this.publishAdapter = publishAdapter;
    this.lastRun = null;
  }

  async planPost({ platform, content }) {
    if (!platform) throw new Error("platform_required");
    if (!content) throw new Error("content_required");

    if (this.publishAdapter?.validate) {
      const validation = await this.publishAdapter.validate({ platform, content });
      if (!validation.valid) {
        throw new Error(validation.error || "validation_failed");
      }
    }

    const scheduledAt = await this.scheduler.calculateOptimalTime({ platform });
    const theme = getThemeForDate(scheduledAt);
    return this.queue.enqueue({
      platform,
      content,
      theme,
      scheduledAt: scheduledAt.toISOString(),
    });
  }

  async runOnce(now = new Date()) {
    const job = this.queue.nextReady(now);
    if (!job) return { processed: false, reason: "no_due_items" };
    if (!this.publishAdapter || !this.publishAdapter.publish) {
      this.queue.markFailed(job.id, "missing_publish_adapter");
      this.lastRun = { at: new Date().toISOString(), status: "failed", id: job.id, reason: "missing_publish_adapter" };
      return { processed: true, status: "failed", id: job.id, reason: "missing_publish_adapter" };
    }

    try {
      await this.publishAdapter.publish(job);
      this.queue.markSent(job.id);
      this.lastRun = { at: new Date().toISOString(), status: "sent", id: job.id };
      return { processed: true, status: "sent", id: job.id };
    } catch (err) {
      this.queue.markFailed(job.id, err?.message || err);
      this.lastRun = { at: new Date().toISOString(), status: "failed", id: job.id, reason: err?.message || "publish_failed" };
      return { processed: true, status: "failed", id: job.id, reason: err?.message || "publish_failed" };
    }
  }

  async health() {
    if (!this.publishAdapter?.health) {
      return { status: "degraded", reason: "adapter_health_not_implemented" };
    }
    return this.publishAdapter.health();
  }

  summary() {
    return {
      queue: this.queue.getStats(),
      lastRun: this.lastRun,
      recentFailures: this.queue.recentHistory(50).filter((x) => x.type === "queue.retry" || x.type === "queue.dead_letter"),
    };
  }
}

module.exports = { AutoPoster };
