import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const COMFY_URL = 'http://localhost:8188';

// ─── LTX-2 RAW AV Prompting ──────────────────────────────────────────────────
// Gives full control over motion, dialogue, and sound to the user based on LTX-2 19B's real strength.
function buildLTX2Prompt(persona: any, videoConfig: any, selectedScene: any, selectedTrend: any): { positive: string, negative: string } {
    let rawPrompt = videoConfig?.prompt?.trim();

    if (!rawPrompt) {
        // Fallback if they leave it empty
        rawPrompt = `Medium shot of ${persona.name}. She looks slightly off-camera, breathing naturally and adjusting her posture.`;
    }

    // Give a little cinematic nudge if they didn't specify camera or style, but keep it minimal
    if (!rawPrompt.toLowerCase().includes('shot') && !rawPrompt.toLowerCase().includes('camera')) {
        rawPrompt = `Medium close-up shot of ${persona.name}. ${rawPrompt}. Cinematic lighting, soft 180° shutter angle.`;
    }

    // Always enforce strict negative guardrails to prevent typical LTX-2 artifacts
    const negativeGuardrails = "blurry, low quality, still frame, deformed, messy, distorted, no flicker, no text, no jitter, no morphing, no frame drops, no artifacts, no logo overlays, no color banding";

    return {
        positive: rawPrompt.trim(),
        negative: negativeGuardrails
    };
}

// ─── Wan 2.1 I2V Prompt Builder ──────────────────────────────────────────────
// Structure: Subject movement; camera [action]; aesthetic/light
// Shorter, direct, motion-first. Omit scene/style since image provides context.
function buildWanI2VPrompt(persona: any, videoConfig: any, selectedScene: any, selectedTrend: any): { positive: string, negative: string } {
    let subjectMotion = videoConfig?.prompt?.trim();

    if (!subjectMotion && selectedScene) {
        subjectMotion = `subject ${selectedScene.name.toLowerCase()}, natural fluid motion`;
    }

    if (!subjectMotion) {
        const wanIdleMotions = [
            "subject breathes naturally, subtle hair movement",
            "subject turns head slightly, blinks, natural idle motion",
            "subject shifts weight, shoulder settles, calm natural movement",
        ];
        subjectMotion = wanIdleMotions[Math.floor(Math.random() * wanIdleMotions.length)];
    }

    const cameraActions = [
        "camera static, locked tripod shot",
        "camera slow dolly in to close-up",
        "camera gentle pan right following subject",
        "camera static with subtle organic drift",
    ];
    const cameraAction = cameraActions[Math.floor(Math.random() * cameraActions.length)];

    let aesthetic = "daylight soft light, understated cinematic realism";
    if (persona.attributes?.vibe?.includes('Night') || persona.attributes?.vibe?.includes('Flash')) {
        aesthetic = "low-key moody light, cinematic realism";
    } else if (persona.attributes?.vibe?.includes('Scandi')) {
        aesthetic = "cool Nordic daylight, natural cinematic";
    }

    const negatives = "no extra logos, no heavy blur, no jitter, no text, blurry, deformed";

    return {
        positive: `${subjectMotion}; ${cameraAction}; medium shot; ${aesthetic}.`,
        negative: negatives
    };
}

export async function POST(request: Request) {
    try {
        const { imageBase64, persona, videoConfig, selectedTrend, selectedScene, workflow: workflowType } = await request.json();

        // 1. Load the corresponding workflow template
        let workflowName = 'wan_i2v.json';
        if (workflowType === 'ltx_lipsync') workflowName = 'ltx_lipsync.json';
        if (workflowType === 'ltx2_new') workflowName = 'LTX2-new-api.json';

        const workflowPath = path.join(process.cwd(), 'config', 'workflows', workflowName);
        const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

        // 2. Upload the input image to ComfyUI
        const filename = `vid_input_${Date.now()}.png`;

        // Try JSON upload first, fall back to FormData
        const uploadRes = await fetch(`${COMFY_URL}/upload/image`, {
            method: 'POST',
            body: JSON.stringify({
                image: imageBase64.split(',')[1] || imageBase64,
                overwrite: true,
                filename
            })
        });

        if (!uploadRes.ok) {
            const formData = new FormData();
            // Handle both base64 data URIs and file paths
            const imgUrl = imageBase64.startsWith('data:') || imageBase64.startsWith('http')
                ? imageBase64
                : `http://localhost:3000${imageBase64}`;
            const blob = await (await fetch(imgUrl)).blob();
            formData.append('image', blob, filename);
            formData.append('overwrite', 'true');
            await fetch(`${COMFY_URL}/upload/image`, { method: 'POST', body: formData });
        }

        // 3. Configure workflow based on type
        if (workflowType === 'wan_i2v') {
            if (workflow["116"]) workflow["116"].inputs.image = filename;

            // ✅ Proper Wan 2.1 I2V prompt — subject motion first, camera second
            const { positive, negative } = buildWanI2VPrompt(persona, videoConfig, selectedScene, selectedTrend);
            console.log('[VIDEO] Wan 2.1 I2V Positive:', positive);
            if (workflow["201"]) workflow["201"].inputs.text = positive; // Assuming "201" is text positive for Wan (verify if needed)

        } else if (workflowType === 'ltx2_new') {
            if (workflow["240"]) workflow["240"].inputs.image = filename;

            // ✅ Proper LTX-2 six-element cinematic prompt split
            const { positive, negative } = buildLTX2Prompt(persona, videoConfig, selectedScene, selectedTrend);
            console.log('[VIDEO] LTX-2 Positive Prompt:', positive);
            console.log('[VIDEO] LTX-2 Negative Prompt:', negative);

            if (workflow["236"]) workflow["236"].inputs.value = positive; // Positive Text
            if (workflow["237"]) workflow["237"].inputs.text = negative;  // Negative Target Node

            // Apply Scene-specific LTX-2 Parameters
            if (selectedScene?.params) {
                const { compression, cfg, strength } = selectedScene.params;
                if (compression && workflow["389:360"]) workflow["389:360"].inputs.img_compression = compression;
                if (cfg && workflow["389:367"]) workflow["389:367"].inputs.cfg = cfg;
                if (strength && workflow["389:362"]) workflow["389:362"].inputs.strength = strength; // Core img2vid strength is 389:362
            }

            // Set Duration (Seconds)
            if (workflow["238"]) workflow["238"].inputs.value = parseInt(videoConfig?.duration) || 8;

            // Set Resolution
            if (workflow["389:355"]) {
                workflow["389:355"].inputs.longer_edge = parseInt(videoConfig?.resolution) || 720;
            }

        } else {
            // Old LTX Lipsync fallback
            if (workflow["303"]) workflow["303"].inputs.image = filename;
            if (workflow["302"]) workflow["302"].inputs.prompt = `${persona.name} is looking at the camera and talking with natural emotion`;
        }

        // 4. Submit to ComfyUI
        const promptRes = await fetch(`${COMFY_URL}/prompt`, {
            method: 'POST',
            body: JSON.stringify({ prompt: workflow })
        });

        if (!promptRes.ok) return NextResponse.json({ error: 'ComfyUI prompt failed' }, { status: 500 });
        const { prompt_id } = await promptRes.json();

        // 5. Poll for video completion
        let videoData = null;
        for (let i = 0; i < 150; i++) { // Videos take longer, especially LTX-2 19B
            await new Promise(r => setTimeout(r, 4000));
            const historyRes = await fetch(`${COMFY_URL}/history/${prompt_id}`);
            const history = await historyRes.json();

            if (history[prompt_id]) {
                const outputs = history[prompt_id].outputs;
                // VHS_VideoCombine nodes: 208 (Wan), 190 (Old LTX), 281 (New LTX-2 API)
                let outputNode = "281";
                if (workflowType === 'wan_i2v') outputNode = "208";
                if (workflowType === 'ltx_lipsync') outputNode = "190";

                if (outputs[outputNode] && outputs[outputNode].gifs) {
                    const video = outputs[outputNode].gifs[0];
                    videoData = `${COMFY_URL}/view?filename=${video.filename}&subfolder=${video.subfolder}&type=${video.type}`;
                    break;
                }
            }
        }

        if (!videoData) return NextResponse.json({ error: 'Video generation timed out' }, { status: 504 });

        // 6. Mux Audio if Trend has it
        if (selectedTrend?.audioUrl) {
            try {
                const tempDir = path.join(process.cwd(), 'public', 'temp');
                if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

                const videoId = `muxed_${Date.now()}`;
                const silentVidPath = path.join(tempDir, `${videoId}_silent.mp4`);
                const audioPath = path.join(tempDir, `${videoId}.mp3`);
                const outputPath = path.join(tempDir, `${videoId}_final.mp4`);

                const vRes = await fetch(videoData);
                const vBuf = await vRes.arrayBuffer();
                fs.writeFileSync(silentVidPath, Buffer.from(vBuf));

                const aRes = await fetch(selectedTrend.audioUrl);
                const aBuf = await aRes.arrayBuffer();
                fs.writeFileSync(audioPath, Buffer.from(aBuf));

                const ffmpegCmd = `ffmpeg -y -i "${silentVidPath}" -i "${audioPath}" -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest "${outputPath}"`;
                execSync(ffmpegCmd);

                fs.unlinkSync(silentVidPath);
                fs.unlinkSync(audioPath);

                videoData = `/temp/${videoId}_final.mp4`;
            } catch (muxError) {
                console.error('Muxing failed, returning silent video:', muxError);
            }
        }

        return NextResponse.json({ video: videoData });

    } catch (error) {
        console.error('Video Gen Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
