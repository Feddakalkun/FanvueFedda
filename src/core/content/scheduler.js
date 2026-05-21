class ContentScheduler {
  constructor(options = {}) {
    this.timezone = options.timezone || "Europe/Oslo";
    this.optimalTimes = {
      fanvue: ["09:00", "20:00", "22:00"],
      instagram: ["11:00", "14:00", "19:00"],
      tiktok: ["12:00", "16:00", "21:00"],
      onlyfans: ["10:00", "21:00"],
    };
  }

  getCandidateTimes(platform) {
    return this.optimalTimes[platform] || ["18:00"];
  }

  // Phase 1 heuristic; will be replaced with historical-performance model.
  async calculateOptimalTime({ platform, now = new Date() }) {
    const candidates = this.getCandidateTimes(platform);
    const next = candidates[0] || "18:00";
    const [hh, mm] = next.split(":").map(Number);
    const dt = new Date(now);
    dt.setHours(hh, mm, 0, 0);
    if (dt <= now) dt.setDate(dt.getDate() + 1);
    return dt;
  }
}

module.exports = { ContentScheduler };
