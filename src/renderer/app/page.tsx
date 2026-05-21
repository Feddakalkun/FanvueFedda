"use client";

import { useEffect, useMemo, useState } from "react";
import { Activity, CalendarClock, PlayCircle, PlusCircle, ShieldAlert, Sparkles } from "lucide-react";

type QueueItem = {
  id: string;
  platform: string;
  status: "pending" | "sent" | "dead_letter";
  scheduledAt?: string;
  content?: { caption?: string; text?: string };
  attempts: number;
  lastError?: string;
};

type DashboardSummary = {
  queue: { total: number; pending: number; sent: number; dead_letter: number };
  lastRun: { at: string; status: string; id: string; reason?: string } | null;
  recentFailures: Array<{ id: string; at: string; error?: string; type: string; attempts?: number }>;
  providerHealth: Record<string, { status: string; reason?: string; provider?: string }>;
  providerStatus: "healthy" | "degraded" | "down";
  generationPipeline: { status: string; detail: string };
};

function statusTone(status?: string) {
  if (status === "healthy" || status === "sent") return "ok";
  if (status === "down" || status === "dead_letter" || status === "failed") return "bad";
  return "warn";
}

export default function Home() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [queueItems, setQueueItems] = useState<QueueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const [summaryRes, queueRes] = await Promise.all([
      fetch("/api/dashboard/summary"),
      fetch("/api/queue"),
    ]);

    const summaryData = await summaryRes.json();
    const queueData = await queueRes.json();

    setSummary(summaryData);
    setQueueItems(queueData.items || []);
  };

  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    (async () => {
      setLoading(true);
      try {
        await load();
      } finally {
        setLoading(false);
      }
      timer = setInterval(() => {
        load().catch(() => null);
      }, 5000);
    })();
    return () => clearInterval(timer);
  }, []);

  const providerRows = useMemo(() => {
    if (!summary?.providerHealth) return [];
    return Object.entries(summary.providerHealth).map(([name, value]) => ({ name, ...value }));
  }, [summary]);

  const planDemoPost = async () => {
    setBusy(true);
    try {
      await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "plan",
          platform: "fanvue",
          content: {
            caption: "Nordic editorial test drop",
            text: "Nordic editorial test drop",
          },
        }),
      });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const runQueue = async () => {
    setBusy(true);
    try {
      await fetch("/api/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run" }),
      });
      await load();
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="nordic-shell">
      <section className="hero-ribbon">
        <p className="eyebrow">FanvueFedda Command</p>
        <h1>Autoposter Command Dashboard</h1>
        <p className="lead">Live status for queue, providers, generation pipeline, and failure recovery.</p>
        <div className="hero-actions">
          <button disabled={busy} onClick={planDemoPost} className="btn btn-primary">
            <PlusCircle size={16} />
            Plan Post
          </button>
          <button disabled={busy} onClick={runQueue} className="btn btn-secondary">
            <PlayCircle size={16} />
            Run Queue
          </button>
        </div>
      </section>

      {loading ? (
        <section className="grid-shell">
          <article className="panel shimmer" />
          <article className="panel shimmer" />
          <article className="panel shimmer" />
        </section>
      ) : (
        <>
          <section className="grid-shell stats">
            <article className="panel stat">
              <span>Total Jobs</span>
              <strong>{summary?.queue.total ?? 0}</strong>
            </article>
            <article className="panel stat">
              <span>Pending</span>
              <strong>{summary?.queue.pending ?? 0}</strong>
            </article>
            <article className="panel stat">
              <span>Sent</span>
              <strong>{summary?.queue.sent ?? 0}</strong>
            </article>
            <article className="panel stat">
              <span>Dead Letter</span>
              <strong>{summary?.queue.dead_letter ?? 0}</strong>
            </article>
          </section>

          <section className="grid-shell">
            <article className="panel wide">
              <header>
                <div>
                  <p className="panel-kicker">Queue</p>
                  <h2>Next Scheduled Posts</h2>
                </div>
                <CalendarClock size={18} />
              </header>
              <div className="stack">
                {queueItems.length === 0 ? (
                  <p className="muted">No queued items yet.</p>
                ) : (
                  queueItems.slice(0, 8).map((item) => (
                    <div key={item.id} className="row-item">
                      <div>
                        <p className="mono">{item.platform}</p>
                        <p>{item.content?.caption || item.content?.text || "Untitled"}</p>
                      </div>
                      <div className="align-right">
                        <span className={`chip ${statusTone(item.status)}`}>{item.status}</span>
                        <small>{item.scheduledAt ? new Date(item.scheduledAt).toLocaleString() : "no schedule"}</small>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </article>

            <article className="panel">
              <header>
                <div>
                  <p className="panel-kicker">Providers</p>
                  <h2>Health Matrix</h2>
                </div>
                <Activity size={18} />
              </header>
              <div className="stack">
                {providerRows.map((provider) => (
                  <div key={provider.name} className="row-item compact">
                    <p className="mono">{provider.name}</p>
                    <span className={`chip ${statusTone(provider.status)}`}>{provider.status}</span>
                  </div>
                ))}
              </div>
            </article>
          </section>

          <section className="grid-shell">
            <article className="panel">
              <header>
                <div>
                  <p className="panel-kicker">Generation</p>
                  <h2>Pipeline Status</h2>
                </div>
                <Sparkles size={18} />
              </header>
              <p className="muted">
                Current status:{" "}
                <span className={`chip ${statusTone(summary?.generationPipeline.status)}`}>{summary?.generationPipeline.status}</span>
              </p>
              <p>{summary?.generationPipeline.detail}</p>
            </article>

            <article className="panel">
              <header>
                <div>
                  <p className="panel-kicker">Failures</p>
                  <h2>Recent Recoveries</h2>
                </div>
                <ShieldAlert size={18} />
              </header>
              <div className="stack">
                {summary?.recentFailures?.length ? (
                  summary.recentFailures.slice(0, 6).map((f) => (
                    <div key={`${f.id}-${f.at}`} className="row-item compact">
                      <p className="mono">{f.type}</p>
                      <small>{f.error || "n/a"}</small>
                    </div>
                  ))
                ) : (
                  <p className="muted">No recent failures logged.</p>
                )}
              </div>
            </article>
          </section>
        </>
      )}
    </main>
  );
}
