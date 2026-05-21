import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const filePath = searchParams.get('path');

    if (!filePath) {
        return new NextResponse('Missing path', { status: 400 });
    }

    // Security: Only allow paths within the known LoRA directories
    const allowedBases = [
        'h:\\LoRAs\\Lora_image_pack',
        'h:\\LoRAs\\Training_Data',
        'h:\\LoRAs\\Helene_new_pack'
    ].map(p => p.toLowerCase());

    const requestedLower = filePath.toLowerCase();
    const isAllowed = allowedBases.some(base => requestedLower.startsWith(base));

    if (!isAllowed) {
        return new NextResponse('Access denied', { status: 403 });
    }

    try {
        if (!fs.existsSync(filePath)) {
            return new NextResponse('File not found', { status: 404 });
        }

        const fileBuffer = fs.readFileSync(filePath);
        const ext = path.extname(filePath).toLowerCase();

        let contentType = 'image/jpeg';
        if (ext === '.png') contentType = 'image/png';
        else if (ext === '.webp') contentType = 'image/webp';

        return new NextResponse(fileBuffer, {
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable'
            }
        });
    } catch (error) {
        return new NextResponse('Error reading file', { status: 500 });
    }
}
