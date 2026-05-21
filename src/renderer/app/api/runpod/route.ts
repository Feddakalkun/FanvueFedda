import { NextRequest, NextResponse } from 'next/server';
import * as runpod from '@/lib/runpod';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { apiKey, action, gpuId, podId, templateId, networkVolumeId, volumeName, volumeSize, dataCenterId, volumeId } = body;

        if (!apiKey) {
            return NextResponse.json({ error: 'API Key is required' }, { status: 400 });
        }

        let result;
        switch (action) {
            case 'list_gpus':
                result = await runpod.listGPUs(apiKey);
                break;
            case 'get_pods':
            case 'list_pods':
                result = await runpod.getPods(apiKey);
                break;
            case 'create_pod':
                result = await runpod.createPod(apiKey, gpuId, templateId, networkVolumeId);
                break;
            case 'stop_pod':
                result = await runpod.stopPod(apiKey, podId);
                break;
            case 'start_pod':
                result = await runpod.startPod(apiKey, podId);
                break;
            case 'terminate_pod':
                result = await runpod.terminatePod(apiKey, podId);
                break;
            case 'get_balance':
                result = await runpod.getBalance(apiKey);
                break;
            case 'get_logs':
                result = await runpod.getPodLogs(apiKey, podId);
                break;
            case 'list_volumes':
                result = await runpod.listVolumes(apiKey);
                break;
            case 'create_volume':
                result = await runpod.createVolume(apiKey, volumeName, volumeSize, dataCenterId);
                break;
            case 'delete_volume':
                result = await runpod.deleteVolume(apiKey, volumeId);
                break;
            case 'get_endpoints':
                result = await runpod.getEndpoints(apiKey);
                break;
            case 'get_pod_details':
                result = await runpod.getPodDetails(apiKey, podId);
                break;
            case 'create_template':
                result = await runpod.createTemplate(apiKey, volumeName, templateId); // Note: verify signature if needed, createTemplate(apiKey, name, image)
                break;
            default:
                return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
        }

        return NextResponse.json(result);
    } catch (error: any) {
        console.error('RunPod API Route Error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
