import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const COMFY_URL = 'http://localhost:8188';

export async function POST(request: Request) {
    try {
        const {
            char1,       // { loraMix, name, looksDescription, attributes }
            char2,       // { loraMix, name, looksDescription, attributes }
            prompt,      // shared scene prompt
            maskTarget,  // 'left' | 'right' — which person gets replaced in pass 2
            seed,        // number | null (null = random)
            char1Strength,
            char2Strength,
        } = await request.json();

        if (!char1?.loraMix || !char2?.loraMix)
            return NextResponse.json({ error: 'Both characters need a LoRA mix' }, { status: 400 });

        // Extract primary LoRA path from loraMix string (take first entry)
        const parseLora = (mix: string): { lora: string; strength: number } => {
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
        const wf = JSON.parse(fs.readFileSync(wfPath, 'utf8'));

        // Remove Simple String node 136, hardcode index in Florence2toCoordinates
        delete wf['136'];
        wf['85'].inputs.index = 0;

        const resolvedSeed = seed ?? Math.floor(Math.random() * 1_000_000_000_000_000);

        // === Inject Character 1 (Pass 1 — generates base scene with Char1 LoRA only) ===
        // node 125 = Person 1 LoraLoader (feeds KSampler for pass 1)
        wf['125'].inputs.lora_name = lora1.lora;
        wf['125'].inputs.strength_model = char1Strength ?? lora1.strength;
        wf['125'].inputs.strength_clip = Math.min((char1Strength ?? lora1.strength) * 0.9, 1.0);

        // === Inject Character 2 (Pass 2 — inpaints masked region with Char2 LoRA only) ===
        // node 124 = Person 2 LoraLoader (feeds DetailerForEach for pass 2)
        wf['124'].inputs.lora_name = lora2.lora;
        wf['124'].inputs.strength_model = char2Strength ?? lora2.strength;
        wf['124'].inputs.strength_clip = Math.min((char2Strength ?? lora2.strength) * 0.9, 1.0);

        // === Inject shared scene prompt ===
        const char1Desc = char1.looksDescription || char1.name || '';
        const char2Desc = char2.looksDescription || char2.name || '';

        const basePrompt = prompt ||
            `Two women together in an intimate scene. ${char1.name} and ${char2.name}. Natural lighting, photorealistic.`;

        // node 118 = "Additional info picture 1" (char1 traits)
        wf['118'].inputs.text = char1Desc ? `${char1.name}, ${char1Desc}` : char1.name;
        // node 119 = "Additional info picture 2" (char2 traits)
        wf['119'].inputs.text = char2Desc ? `${char2.name}, ${char2Desc}` : char2.name;

        // node 146 = ImpactWildcardProcessor (main scene prompt)
        wf['146'].inputs.wildcard_text = basePrompt;
        wf['146'].inputs.populated_text = basePrompt;

        // === Inject Florence2 mask target ===
        // node 53: Florence2Run — text_input describes WHO to isolate
        const position = maskTarget === 'right' ? 'right' : 'left';
        wf['53'].inputs.text_input = `${position} woman`;

        // Remove Simple String node 136, hardcode index directly into Florence2toCoordinates
        delete wf['136'];
        wf['85'].inputs.index = 0;

        // === Inject seed ===
        // node 126 = ttN seed
        wf['126'].inputs.seed = resolvedSeed;

        // === Save prefix ===
        const ts = Date.now();
        const slug1 = (char1.name || 'char1').toLowerCase().replace(/\s+/g, '-');
        const slug2 = (char2.name || 'char2').toLowerCase().replace(/\s+/g, '-');
        wf['145'].inputs.filename_prefix = `IMAGE/duo/${slug1}_x_${slug2}_${ts}_`;
        if (wf['147']) wf['147'].inputs.filename_prefix = `delete/duo_pass1_${ts}_`;

        // === Fix DetailerForEach (node 102) — remove params removed in newer Impact-Pack ===
        if (wf['102']) {
            delete wf['102'].inputs.tiled_encode;
            delete wf['102'].inputs.tiled_decode;
        }

        // Remove preview-only nodes that cause validation issues (Image Comparer rgthree)
        delete wf['101'];
        delete wf['130'];
        // Remove Simple String node 136 (second delete is harmless)
        delete wf['136'];

        // === Queue prompt ===
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

        // === Poll for completion (DUO is slower — 2 passes, allow 8 min) ===
        let imageData = null;
        for (let i = 0; i < 240; i++) {
            await new Promise(r => setTimeout(r, 2000));
            const historyRes = await fetch(`${COMFY_URL}/history/${prompt_id}`);
            const history = await historyRes.json();

            if (history[prompt_id]) {
                const outputs = history[prompt_id].outputs;
                // node 145 = final SaveImage (after DetailerForEach pass 2)
                const finalOut = outputs['145'];
                if (finalOut?.images?.[0]) {
                    const img = finalOut.images[0];
                    const imgRes = await fetch(`${COMFY_URL}/view?filename=${img.filename}&subfolder=${img.subfolder}&type=${img.type}`);
                    const buffer = await imgRes.arrayBuffer();
                    imageData = Buffer.from(buffer).toString('base64');
                    break;
                }
            }
        }

        if (!imageData) return NextResponse.json({ error: 'DUO generation timed out (8 min)' }, { status: 504 });

        // Save to personas duo folder
        const dateStr = new Date().toISOString().split('T')[0];
        const relDir = `/assets/duo/${slug1}_x_${slug2}/${dateStr}`;
        const absDir = path.join(process.cwd(), 'public', relDir);
        if (!fs.existsSync(absDir)) fs.mkdirSync(absDir, { recursive: true });

        const fileName = `duo_${ts}.png`;
        fs.writeFileSync(path.join(absDir, fileName), Buffer.from(imageData, 'base64'));

        return NextResponse.json({
            image: `${relDir}/${fileName}`,
            seed: resolvedSeed,
        });

    } catch (error) {
        console.error('DUO Gen Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
