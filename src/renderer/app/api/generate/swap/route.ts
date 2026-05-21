import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const COMFY_URL = 'http://localhost:8188';

export async function POST(request: Request) {
    try {
        const { imageBase64, prompt, persona } = await request.json();

        // 1. Load the template workflow
        const workflowPath = path.join(process.cwd(), 'config', 'workflows', 'try_on_api.json');
        const workflow = JSON.parse(fs.readFileSync(workflowPath, 'utf8'));

        // 2. Upload the input image (source of pose/person)
        const uploadRes = await fetch(`${COMFY_URL}/upload/image`, {
            method: 'POST',
            body: JSON.stringify({
                image: imageBase64.split(',')[1],
                overwrite: true,
                filename: 'swap_input.png'
            })
        });

        if (!uploadRes.ok) {
            const formData = new FormData();
            const blob = await (await fetch(imageBase64)).blob();
            formData.append('image', blob, 'swap_input.png');
            formData.append('overwrite', 'true');
            await fetch(`${COMFY_URL}/upload/image`, { method: 'POST', body: formData });
        }

        // 3. Inject new outfit prompt and Persona LoRAs
        if (workflow["33"]) {
            // Strong emphasis on the new outfit
            workflow["33"].inputs.string = `(candid unedited amateur photo:1.2), (harsh flash:1.1), (natural skin texture:1.2), ${persona.looksDescription}, absolutely wearing ${prompt}, highly detailed clothing texture`;
        }

        if (workflow["126"]) {
            const loraLoader = workflow["126"];
            const entries = (persona.loraMix || "").split(',').map((s: string) => s.trim());

            // Map entries to lora_1, lora_2, etc. (reuse code from portrait endpoint)
            let nextLoraIndex = 1;
            entries.forEach((entry: string) => {
                const [name, strength] = entry.split(':');
                if (name) {
                    const loraPath = name.includes('.') ? name : `${name}.safetensors`;
                    loraLoader.inputs[`lora_${nextLoraIndex}`] = {
                        on: true,
                        lora: loraPath,
                        strength: parseFloat(strength) || 1.15
                    };
                    nextLoraIndex++;
                }
            });
        }

        // 4. Submit to ComfyUI
        const promptRes = await fetch(`${COMFY_URL}/prompt`, {
            method: 'POST',
            body: JSON.stringify({ prompt: workflow })
        });

        if (!promptRes.ok) return NextResponse.json({ error: 'ComfyUI prompt failed' }, { status: 500 });
        const { prompt_id } = await promptRes.json();

        // 5. Poll for completion
        let imageData = null;
        for (let i = 0; i < 30; i++) {
            await new Promise(r => setTimeout(r, 2000));
            const historyRes = await fetch(`${COMFY_URL}/history/${prompt_id}`);
            const history = await historyRes.json();

            if (history[prompt_id]) {
                const outputs = history[prompt_id].outputs;
                if (outputs["9"] && outputs["9"].images) {
                    const img = outputs["9"].images[0];
                    const imgRes = await fetch(`${COMFY_URL}/view?filename=${img.filename}&subfolder=${img.subfolder}&type=${img.type}`);
                    const buffer = await imgRes.arrayBuffer();
                    imageData = `data:image/png;base64,${Buffer.from(buffer).toString('base64')}`;
                    break;
                }
            }
        }

        if (!imageData) return NextResponse.json({ error: 'Generation timed out' }, { status: 504 });

        return NextResponse.json({ image: imageData });

    } catch (error) {
        console.error('Swap Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
