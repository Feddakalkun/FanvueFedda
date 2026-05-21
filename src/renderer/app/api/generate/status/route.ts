import { NextResponse } from 'next/server';

const COMFY_URL = 'http://localhost:8188';

export async function GET() {
    try {
        const res = await fetch(`${COMFY_URL}/prompt`);
        const data = await res.json();

        const executing = data.executing;
        if (!executing || !executing.node) {
            return NextResponse.json({ status: 'idle' });
        }

        const nodeId = executing.node;
        const promptId = executing.prompt_id;

        // Try to get the prompt details from the queue to find the node title
        const queueRes = await fetch(`${COMFY_URL}/queue`);
        const queueData = await queueRes.json();

        let nodeTitle = `Node ${nodeId}`;

        // Find the active prompt in the running queue
        const runningPrompt = queueData.queue_running?.find((p: any) => p[1] === promptId);
        if (runningPrompt) {
            const workflow = runningPrompt[2]; // The full prompt object
            if (workflow[nodeId] && workflow[nodeId]._meta) {
                nodeTitle = workflow[nodeId]._meta.title || nodeTitle;
            }
        }

        return NextResponse.json({
            status: 'processing',
            nodeId,
            nodeTitle,
            promptId,
            queueCount: (queueData.queue_running?.length || 0) + (queueData.queue_pending?.length || 0)
        });
    } catch (e) {
        return NextResponse.json({ status: 'offline' });
    }
}
