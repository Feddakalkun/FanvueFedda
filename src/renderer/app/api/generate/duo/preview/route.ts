import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const COMFY_URL = 'http://localhost:8188';

export async function POST(request: Request) {
    try {
        const {
            char1,
            char2,
            prompt,
            maskTarget,
            seed,
            char1Strength,
            char2Strength,
        } = await request.json();

        if (!char1?.loraMix || !char2?.loraMix)
            return NextResponse.json({ error: 'Both characters need a LoRA mix' }, { status: 400 });

        const parseLora = (mix: string) => {
            const first = mix.split(',')[0].trim();
            const [name, str] = first.split(':');
            return {
                lora: (name.includes('.') ? name : `${name}.safetensors`).replace(/\//g, '\\'),
                strength: parseFloat(str) || 1.0,
            };
        };

        const lora1 = parseLora(char1.loraMix);
        const lora2 = parseLora(char2.loraMix);

        const wfPath = path.join(process.cwd(), 'config', 'workflows', '2lora.json');
        const wfFull = JSON.parse(fs.readFileSync(wfPath, 'utf8'));
        const resolvedSeed = seed ?? Math.floor(Math.random() * 1_000_000_000_000_000);

        // === Build PREVIEW-only workflow (pass 1 + masking only, no DetailerForEach) ===
        // Only remove actual pass-2 nodes — keep 114/117/118/121 (needed for pass-1 prompt chain)
        const PASS2_NODES = ['65', '102', '103', '106', '119', '120', '122', '130', '145', '147'];
        const wf: Record<string, any> = {};
        for (const [id, node] of Object.entries(wfFull)) {
            if (!PASS2_NODES.includes(id)) {
                wf[id] = structuredClone(node);
            }
        }

        // Fix sampler name (dpmpp_2m_sde_karras → dpmpp_2m_sde, scheduler stays karras)
        if (wf['46']) {
            wf['46'].inputs.sampler_name = 'dpmpp_2m_sde';
            wf['46'].inputs.scheduler = 'karras';
        }

        // Add SaveImage for pass1 image (from VAEDecode node 13)
        wf['500'] = {
            class_type: 'SaveImage',
            inputs: { filename_prefix: 'duo_preview/pass1', images: ['13', 0] },
        };

        // Add MaskToImage to convert the grown mask to a viewable image
        wf['501'] = {
            class_type: 'MaskToImage',
            inputs: { mask: ['107', 0] },
        };

        // Add SaveImage for the mask
        wf['502'] = {
            class_type: 'SaveImage',
            inputs: { filename_prefix: 'duo_preview/mask', images: ['501', 0] },
        };

        // === Inject settings ===
        wf['125'].inputs.lora_name = lora1.lora;
        wf['125'].inputs.strength_model = char1Strength ?? lora1.strength;
        wf['125'].inputs.strength_clip = Math.min((char1Strength ?? lora1.strength) * 0.9, 1.0);

        wf['124'].inputs.lora_name = lora2.lora;
        wf['124'].inputs.strength_model = char2Strength ?? lora2.strength;
        wf['124'].inputs.strength_clip = Math.min((char2Strength ?? lora2.strength) * 0.9, 1.0);

        const basePrompt = prompt || `Two women together. ${char1.name} and ${char2.name}. Natural lighting, photorealistic.`;
        if (wf['146']) {
            wf['146'].inputs.wildcard_text = basePrompt;
            wf['146'].inputs.populated_text = basePrompt;
        }

        const position = maskTarget === 'right' ? 'right' : 'left';
        wf['53'].inputs.text_input = `${position} woman`;
        // Remove Simple String node 136 — hardcode index into Florence2toCoordinates
        delete wf['136'];
        wf['85'].inputs.index = 0;

        // Remove preview-only/comparer nodes + fix DetailerForEach params
        delete wf['101'];
        delete wf['130'];
        if (wf['102']) {
            delete wf['102'].inputs.tiled_encode;
            delete wf['102'].inputs.tiled_decode;
        }

        wf['126'].inputs.seed = resolvedSeed;

        // === Queue preview prompt ===
        const promptRes = await fetch(`${COMFY_URL}/prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: wf }),
        });

        if (!promptRes.ok) {
            const err = await promptRes.text();
            return NextResponse.json({ error: `ComfyUI rejected prompt: ${err}` }, { status: 500 });
        }

        const { prompt_id } = await promptRes.json();

        // Poll for completion (pass 1 + masking only, ~30-60s)
        for (let i = 0; i < 90; i++) {
            await new Promise(r => setTimeout(r, 2000));
            const histRes = await fetch(`${COMFY_URL}/history/${prompt_id}`);
            const hist = await histRes.json();

            if (hist[prompt_id]) {
                const outputs = hist[prompt_id].outputs;
                const pass1Out = outputs['500'];
                const maskOut = outputs['502'];

                if (pass1Out?.images?.[0] && maskOut?.images?.[0]) {
                    const fetchImg = async (img: any) => {
                        const res = await fetch(`${COMFY_URL}/view?filename=${img.filename}&subfolder=${img.subfolder}&type=${img.type}`);
                        return Buffer.from(await res.arrayBuffer()).toString('base64');
                    };

                    const [pass1B64, maskB64] = await Promise.all([
                        fetchImg(pass1Out.images[0]),
                        fetchImg(maskOut.images[0]),
                    ]);

                    return NextResponse.json({
                        pass1Image: `data:image/png;base64,${pass1B64}`,
                        maskImage: `data:image/png;base64,${maskB64}`,
                        seed: resolvedSeed,
                    });
                }
            }
        }

        return NextResponse.json({ error: 'Preview timed out' }, { status: 504 });

    } catch (error) {
        console.error('DUO Preview Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
