class ContentQueue {
  constructor() {
    this.items = [];
    this.history = [];
  }

  enqueue(item) {
    const queued = {
      id: `${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      attempts: 0,
      status: "pending",
      statusHistory: [{ status: "pending", at: new Date().toISOString() }],
      ...item,
    };
    this.items.push(queued);
    this.history.unshift({
      id: queued.id,
      type: "queue.enqueued",
      at: new Date().toISOString(),
      platform: queued.platform || "unknown",
    });
    return queued;
  }

  nextReady(now = new Date()) {
    const nowTs = now.getTime();
    return this.items.find((x) => {
      if (x.status !== "pending") return false;
      if (!x.scheduledAt) return true;
      return new Date(x.scheduledAt).getTime() <= nowTs;
    });
  }

  markSent(id) {
    const item = this.items.find((x) => x.id === id);
    if (!item) return false;
    item.status = "sent";
    item.sentAt = new Date().toISOString();
    item.statusHistory.push({ status: "sent", at: item.sentAt });
    this.history.unshift({
      id,
      type: "queue.sent",
      at: item.sentAt,
      platform: item.platform || "unknown",
    });
    return true;
  }

  markFailed(id, error) {
    const item = this.items.find((x) => x.id === id);
    if (!item) return false;
    item.attempts += 1;
    item.lastError = String(error || "unknown_error");
    item.lastFailedAt = new Date().toISOString();
    item.status = item.attempts >= 3 ? "dead_letter" : "pending";
    item.statusHistory.push({ status: item.status, at: item.lastFailedAt, error: item.lastError });
    this.history.unshift({
      id,
      type: item.status === "dead_letter" ? "queue.dead_letter" : "queue.retry",
      at: item.lastFailedAt,
      platform: item.platform || "unknown",
      error: item.lastError,
      attempts: item.attempts,
    });
    return true;
  }

  getStats() {
    const stats = {
      total: this.items.length,
      pending: 0,
      sent: 0,
      dead_letter: 0,
    };
    for (const item of this.items) {
      if (item.status === "pending") stats.pending += 1;
      else if (item.status === "sent") stats.sent += 1;
      else if (item.status === "dead_letter") stats.dead_letter += 1;
    }
    return stats;
  }

  list(limit = 100) {
    return this.items.slice(0, limit);
  }

  recentHistory(limit = 25) {
    return this.history.slice(0, limit);
  }
}

module.exports = { ContentQueue };
