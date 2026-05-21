import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const COMFY_MODELS_PATH = path.join(process.cwd(), 'engine', 'ComfyUI', 'models');

const PACKAGES = [
    {
        id: "1",
        name: "Character Creator (Z-Image)",
        description: "Essential models for high-quality portraits and persona building.",
        size: "~25GB",
        checks: [
            'unet/z_image_turbo_bf16.safetensors',
            'clip/qwen_3_4b.safetensors',
            'vae/z-image-vae.safetensors'
        ]
    },
    {
        id: "2",
        name: "Video Suite (Wan + LTX)",
        description: "Models for generating cinemative video and motion.",
        size: "~40GB",
        checks: [
            'diffusion_models/wan2.1_i2v_480p_14b_fp8.safetensors',
            'checkpoints/ltx-video-2b-fp16.safetensors'
        ]
    },
    {
        id: "3",
        name: "Upscalers",
        description: "Enhance image resolution and sharp details.",
        size: "~200MB",
        checks: [
            'upscale_models/4x-UltraSharp.pth'
        ]
    }
];

export async function GET() {
    try {
        const status = PACKAGES.map(pkg => {
            const installed = pkg.checks.every(file => {
                return fs.existsSync(path.join(COMFY_MODELS_PATH, file));
            });
            return {
                ...pkg,
                installed
            };
        });
        return NextResponse.json(status);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to check model status' }, { status: 500 });
    }
}
