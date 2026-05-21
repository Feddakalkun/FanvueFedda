import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const LORAS_PATH = path.join(process.cwd(), 'engine', 'ComfyUI', 'models', 'loras');

export async function GET() {
    try {
        if (!fs.existsSync(LORAS_PATH)) {
            return NextResponse.json([]);
        }

        const files = getAllFiles(LORAS_PATH);
        const loraFiles = files
            .filter(file => file.endsWith('.safetensors') || file.endsWith('.ckpt'))
            .map(file => {
                // Get relative path from LORAS_PATH
                return path.relative(LORAS_PATH, file).replace(/\\/g, '/');
            });

        return NextResponse.json(loraFiles);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to list LoRAs' }, { status: 500 });
    }
}

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
    const files = fs.readdirSync(dirPath);

    files.forEach(function (file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            arrayOfFiles.push(path.join(dirPath, "/", file));
        }
    });

    return arrayOfFiles;
}
