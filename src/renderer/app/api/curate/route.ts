import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(req: Request) {
    try {
        const { action, folder, files } = await req.json();
        const storagePath = path.join(process.cwd(), 'public', 'assets', 'curated');

        if (action === 'scan') {
            const foldersToScan = [
                'h:\\LoRAs\\Lora_image_pack',
                'h:\\LoRAs\\Training_Data',
                'h:\\LoRAs\\Helene_new_pack'
            ];

            const results: any = {};

            async function deepScan(currentDir: string, identityName: string, category: string) {
                try {
                    const entries = await fs.readdir(currentDir, { withFileTypes: true });
                    const subEntriesNames = entries.map(e => e.name);

                    const imageFiles = entries
                        .filter(e => !e.isDirectory())
                        .map(e => e.name)
                        .filter(f => {
                            const match = f.match(/\.(jpg|jpeg|png|webp)$/i);
                            if (!match) return false;
                            const baseName = f.substring(0, f.lastIndexOf('.'));
                            return subEntriesNames.includes(baseName + '.txt');
                        });

                    if (imageFiles.length > 0) {
                        if (!results[identityName]) results[identityName] = [];
                        results[identityName].push({
                            path: currentDir,
                            count: imageFiles.length,
                            images: imageFiles.slice(0, 48),
                            category
                        });
                    }

                    for (const entry of entries) {
                        if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'node_modules') {
                            await deepScan(path.join(currentDir, entry.name), identityName, category);
                        }
                    }
                } catch (e) { }
            }

            async function startScan(baseDir: string, category: string) {
                try {
                    const identities = await fs.readdir(baseDir, { withFileTypes: true });
                    for (const idEntry of identities) {
                        if (idEntry.isDirectory()) {
                            await deepScan(path.join(baseDir, idEntry.name), idEntry.name, category);
                        }
                    }
                } catch (e) { }
            }

            await Promise.all(foldersToScan.map((dir, i) => startScan(dir, i === 0 ? 'Packs' : i === 1 ? 'Training' : 'New')));
            return NextResponse.json(results);
        }

        if (action === 'save') {
            const targetDir = path.join(storagePath, folder);
            await fs.mkdir(targetDir, { recursive: true });

            for (const file of files) {
                const sourcePath = file.source;
                const fileName = path.basename(sourcePath);
                const destPath = path.join(targetDir, fileName);

                // Use copyFile instead of symlinks for visibility in public/assets
                await fs.copyFile(sourcePath, destPath);

                // Also copy associated .txt if exists
                const txtPath = sourcePath.replace(/\.[^/.]+$/, "") + ".txt";
                try {
                    await fs.access(txtPath);
                    await fs.copyFile(txtPath, path.join(targetDir, fileName.replace(/\.[^/.]+$/, "") + ".txt"));
                } catch (e) { }
            }
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
