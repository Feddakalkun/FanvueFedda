import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import OpenAI from 'openai';
import { VIBE_PRESETS, DEFAULT_VIBE, EXPRESSION_PRESETS, DEFAULT_EXPRESSION } from '@/lib/vibe-presets';

const COMFY_URL = 'http://localhost:8188';

const ollama = new OpenAI({
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'ollama',
});

export async function POST(request: Request) {
    try {
        const {
            loraMix: customLoraMix,
            selectedTrend,
            selectedScene,
            selectedReference,
            customPrompt,
            ...persona
        } = await request.json();

        // ─── Load workflow ────────────────────────────────────────────
        const workflowPath = path.join(process.cwd(), 'config', 'workflows', 'zimage-ultimate-api.json');
        const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

        // ─── Extract LoRA trigger word ────────────────────────────────
        // Convention: character name lowercase, first name only (e.g. "jelene")
        const triggerWord = persona.name?.toLowerCase().split(' ')[0] || 'woman';

        // ─── Build scene context for Ollama ───────────────────────────
        // Ollama generates SCENE ONLY — the LoRA handles who the character is.
        // We do NOT describe the character's appearance here.
        const vibeKey = persona.attributes?.vibe || '';
        const activeVibe = VIBE_PRESETS[vibeKey] || DEFAULT_VIBE;
        const expressionKey = persona.attributes?.expression || '';
        const activeExpression = EXPRESSION_PRESETS[expressionKey] || DEFAULT_EXPRESSION;

        let sceneContext = customPrompt || '';
        if (selectedScene) sceneContext = selectedScene.prompt.replace('{identity}', persona.name);
        if (selectedReference?.caption) sceneContext += ` Wearing: ${selectedReference.caption}.`;
        if (!sceneContext && persona.looksDescription) {
            // Extract scene hints from looksDescription without character description
            sceneContext = 'a candid photo in natural setting';
        }
        if (!sceneContext) sceneContext = 'a candid lifestyle photo outdoors in natural light';

        // ─── Ollama: generate SCENE description only ──────────────────
        let ollamaScene = '';
        try {
            const vibeHint = vibeKey ? `Style/vibe: ${vibeKey}.` : '';
            const referenceHint = selectedReference ? `Reference outfit: ${selectedReference.caption}.` : '';

            const completion = await ollama.chat.completions.create({
                model: 'dolphin-llama3:latest',
                messages: [
                    {
                        role: 'system',
                        content: `You write image generation prompts for FLUX-based LoRA models.
The character identity is handled by the LoRA — DO NOT describe face, hair color, eye color, or body type.
Your ONLY job: write a SHORT scene description (1-2 sentences max) describing:
- What they are wearing
- What they are doing  
- The setting/location
- Lighting and mood
- Camera feel (e.g. "35mm film", "iPhone snapshot", "grainy flash")
${vibeHint}
${referenceHint}
Output ONLY the scene text. No intro, no character name, no physical appearance.`
                    },
                    { role: 'user', content: sceneContext }
                ],
                temperature: 0.7,
                max_tokens: 120,
            });

            if (completion.choices[0]?.message?.content) {
                ollamaScene = completion.choices[0].message.content.trim();
            }

            // VRAM purge
            try {
                await fetch('http://localhost:11434/api/generate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ model: 'dolphin-llama3:latest', keep_alive: 0 })
                });
            } catch (_) { }
        } catch (_) {
            ollamaScene = sceneContext;
        }

        // ─── Assemble FLUX prompt ─────────────────────────────────────
        // Formula: [trigger], [expression], [scene from ollama], [vibe keywords], [quality]
        const qualityTags = 'photorealistic, high quality, sharp focus, detailed face, skin texture, natural lighting';

        const promptParts = [
            triggerWord,                              // LoRA trigger FIRST
            activeExpression || null,                 // expression
            ollamaScene || sceneContext,              // scene (from Ollama)
            activeVibe.keywords || null,              // vibe style keywords
            qualityTags,                              // quality
        ].filter(Boolean);

        const finalPositive = promptParts.join(', ');

        // ─── Negative prompt ──────────────────────────────────────────
        const finalNegative = 'blurry, low quality, bad anatomy, deformed, ugly, watermark, text, duplicate, mutated, extra limbs, missing fingers, anime, cartoon, illustration, 3D render, CGI, doll, unrealistic, oversaturated';

        // ─── Inject into workflow ──────────────────────────────────────
        if (workflow['33']) workflow['33'].inputs.string = finalPositive;
        if (workflow['34']) workflow['34'].inputs.string = finalNegative;

        // ─── Inject LoRA mix ──────────────────────────────────────────
        if (workflow['126']) {
            const loraLoader = workflow['126'];
            const mixToUse = customLoraMix || persona.loraMix || '';
            const entries = mixToUse.split(',').map((s: string) => s.trim()).filter(Boolean);

            // Clear existing lora_ slots
            Object.keys(loraLoader.inputs).forEach(key => {
                if (key.startsWith('lora_')) delete loraLoader.inputs[key];
            });

            let nextIdx = 1;

            // Character LoRA(s)
            entries.forEach((entry: string) => {
                const [name, strengthStr] = entry.split(':');
                if (!name?.trim()) return;
                const loraPath = (name.trim().includes('.') ? name.trim() : `${name.trim()}.safetensors`).replace(/\//g, '\\');
                loraLoader.inputs[`lora_${nextIdx}`] = {
                    on: true,
                    lora: loraPath,
                    strength: parseFloat(strengthStr) || 1.0,
                };
                nextIdx++;
            });

            // Style LoRA from vibe (only if no authoritative scene pack)
            if (!selectedScene && activeVibe.styleLora?.path) {
                loraLoader.inputs[`lora_${nextIdx}`] = {
                    on: true,
                    lora: activeVibe.styleLora.path,
                    strength: activeVibe.styleLora.strength || 0.35,
                };
                nextIdx++;
            }

            // Skin texture LoRA (always on, subtle)
            loraLoader.inputs[`lora_${nextIdx}`] = {
                on: true,
                lora: 'Style\\skin-texture-Photorealistic-style-v4.5.safetensors',
                strength: 0.25,
            };
        }

        // ─── Randomise seeds ──────────────────────────────────────────
        const seed = () => Math.floor(Math.random() * 1_000_000_000_000_000);
        if (workflow['3']) workflow['3'].inputs.seed = seed();
        if (workflow['181']) workflow['181'].inputs.seed = seed();

        // ─── Queue prompt ─────────────────────────────────────────────
        const promptRes = await fetch(`${COMFY_URL}/prompt`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt: workflow }),
        });

        if (!promptRes.ok) {
            const errText = await promptRes.text();
            console.error('ComfyUI prompt error:', errText);
            return NextResponse.json({ error: 'ComfyUI prompt failed', detail: errText }, { status: 500 });
        }

        const { prompt_id } = await promptRes.json();

        // ─── Poll for result ──────────────────────────────────────────
        let imageData: string | null = null;
        for (let i = 0; i < 60; i++) {
            await new Promise(r => setTimeout(r, 2000));
            const histRes = await fetch(`${COMFY_URL}/history/${prompt_id}`);
            const hist = await histRes.json();
            if (hist[prompt_id]?.outputs?.['9']?.images?.[0]) {
                const img = hist[prompt_id].outputs['9'].images[0];
                const imgRes = await fetch(`${COMFY_URL}/view?filename=${img.filename}&subfolder=${img.subfolder}&type=${img.type}`);
                imageData = Buffer.from(await imgRes.arrayBuffer()).toString('base64');
                break;
            }
        }

        if (!imageData) return NextResponse.json({ error: 'Generation timed out' }, { status: 504 });

        // ─── Save image ───────────────────────────────────────────────
        const slug = (persona.slug || persona.name || 'unnamed').toLowerCase().replace(/\s+/g, '-');
        const dateStr = new Date().toISOString().split('T')[0];
        const ts = Date.now();
        const relDir = `/assets/personas/${slug}/${dateStr}`;
        const absDir = path.join(process.cwd(), 'public', 'assets', 'personas', slug, dateStr);
        if (!fs.existsSync(absDir)) fs.mkdirSync(absDir, { recursive: true });

        const fileName = `portrait_${ts}.png`;
        fs.writeFileSync(path.join(absDir, fileName), Buffer.from(imageData, 'base64'));

        return NextResponse.json({ image: `${relDir}/${fileName}`, prompt: finalPositive });

    } catch (error) {
        console.error('Portrait Gen Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
