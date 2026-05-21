const assert = require("assert");
const { AutoPoster } = require("../src/core/content/autoposter");

async function run() {
  let publishAttempts = 0;
  const adapter = {
    async validate() {
      return { valid: true };
    },
    async publish() {
      publishAttempts += 1;
      if (publishAttempts < 3) throw new Error("temporary_network_error");
      return { ok: true };
    },
    async health() {
      return { status: "healthy" };
    },
  };

  const poster = new AutoPoster({ publishAdapter: adapter, timezone: "Europe/Oslo" });

  const job = await poster.planPost({
    platform: "fanvue",
    content: { caption: "Test caption", text: "Test caption" },
  });
  assert.ok(job.id, "planned job should have id");

  // Force immediate due for deterministic run loop checks.
  job.scheduledAt = new Date(Date.now() - 1000).toISOString();

  const first = await poster.runOnce();
  assert.equal(first.status, "failed");
  assert.equal(poster.queue.list()[0].status, "pending");
  assert.equal(poster.queue.list()[0].attempts, 1);

  const second = await poster.runOnce();
  assert.equal(second.status, "failed");
  assert.equal(poster.queue.list()[0].status, "pending");
  assert.equal(poster.queue.list()[0].attempts, 2);

  const third = await poster.runOnce();
  assert.equal(third.status, "sent");
  assert.equal(poster.queue.list()[0].status, "sent");

  // Dead-letter scenario
  const alwaysFailAdapter = {
    async validate() {
      return { valid: true };
    },
    async publish() {
      throw new Error("hard_failure");
    },
    async health() {
      return { status: "healthy" };
    },
  };

  const deadPoster = new AutoPoster({ publishAdapter: alwaysFailAdapter, timezone: "Europe/Oslo" });
  const deadJob = await deadPoster.planPost({
    platform: "fanvue",
    content: { caption: "Dead letter test", text: "Dead letter test" },
  });
  deadJob.scheduledAt = new Date(Date.now() - 1000).toISOString();

  await deadPoster.runOnce();
  await deadPoster.runOnce();
  await deadPoster.runOnce();
  assert.equal(deadPoster.queue.list()[0].status, "dead_letter");
  assert.equal(deadPoster.queue.list()[0].attempts, 3);

  // Scheduler should set a date in the future for default paths.
  const scheduled = await poster.scheduler.calculateOptimalTime({ platform: "fanvue", now: new Date() });
  assert.ok(scheduled.getTime() > Date.now() - 60_000);

  console.log("core.autoposter.test.js passed");
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
