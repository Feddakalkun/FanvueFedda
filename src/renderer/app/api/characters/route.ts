import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs';
import path from 'path';

export async function GET(request: Request) {
    try {
        const characters = await prisma.character.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        const safeParse = (str: string | null | undefined) => {
            if (!str) return {};
            try {
                return JSON.parse(str);
            } catch (e) {
                return {};
            }
        };

        const parsed = characters.map(c => ({
            ...c,
            platformSettings: safeParse(c.platformSettings),
            attributes: safeParse((c as any).attributes)
        }));

        const { searchParams } = new URL(request.url);
        const action = searchParams.get('action');

        if (action === 'curated') {
            const charId = searchParams.get('id');
            const character = parsed.find(c => c.id === charId);
            if (!character) return NextResponse.json({ error: 'Character not found' }, { status: 404 });

            const storagePath = path.join(process.cwd(), 'public', 'assets', 'curated', character.name);
            const assets: any[] = [];
            try {
                const files = await fs.promises.readdir(storagePath);
                const images = files.filter((f: string) => /\.(jpg|jpeg|png|webp)$/i.test(f));
                for (const img of images) {
                    const base = img.substring(0, img.lastIndexOf('.'));
                    const txt = files.find((f: string) => f.toLowerCase() === (base + '.txt').toLowerCase());
                    let caption = '';
                    if (txt) {
                        caption = await fs.promises.readFile(path.join(storagePath, txt), 'utf8');
                    }
                    assets.push({
                        url: `/assets/curated/${character.name}/${img}`,
                        caption
                    });
                }
            } catch (e) { }
            return NextResponse.json({ assets });
        }

        return NextResponse.json(parsed);
    } catch (error) {
        console.error('Fetch Characters Error:', error);
        return NextResponse.json({ error: 'Failed to fetch characters' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        if (!body.name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        let slug = body.slug || body.name.toLowerCase().replace(/\s+/g, '-');

        // Check for slug collision
        const existing = await prisma.character.findUnique({ where: { slug } });
        if (existing) {
            slug = `${slug}-${Math.random().toString(36).substring(2, 6)}`;
        }

        let character;
        try {
            character = await prisma.character.create({
                data: {
                    name: body.name,
                    slug: slug,
                    handle: body.handle || '',
                    bio: body.bio || '',
                    loraMix: body.loraMix || '',
                    looksDescription: body.looksDescription || '',
                    previewUrl: body.previewUrl || null,
                    platformSettings: body.platformSettings ? JSON.stringify(body.platformSettings) : '{}',
                    attributes: body.attributes ? JSON.stringify(body.attributes) : '{}',
                } as any
            });
        } catch (error: any) {
            console.warn('Prisma creation failed, falling back...', error.message);
            // Fallback: Create without previewUrl or attributes if the client is stale
            character = await prisma.character.create({
                data: {
                    name: body.name,
                    slug: slug,
                    handle: body.handle || '',
                    bio: body.bio || '',
                    loraMix: body.loraMix || '',
                    looksDescription: body.looksDescription || '',
                    platformSettings: body.platformSettings ? JSON.stringify(body.platformSettings) : '{}',
                }
            });
        }

        const safeParse = (str: string | null | undefined) => {
            if (!str) return {};
            try {
                return JSON.parse(str);
            } catch (e) {
                return {};
            }
        };

        return NextResponse.json({
            ...character,
            platformSettings: safeParse(character.platformSettings),
            attributes: safeParse((character as any).attributes)
        });
    } catch (error) {
        console.error('Character Creation Error:', error);
        return NextResponse.json({ error: 'Failed to create persona' }, { status: 500 });
    }
}

export async function DELETE(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        // Get character info before deletion to find the folder
        const character = await prisma.character.findUnique({ where: { id } });

        if (character) {
            const slug = character.slug;
            const personaPath = path.join(process.cwd(), 'public', 'assets', 'personas', slug);
            const recyclePath = path.join(process.cwd(), 'public', 'assets', 'recycle_bin', slug);

            // If the folder exists, move it to recycle bin
            if (fs.existsSync(personaPath)) {
                // Ensure recycle_bin exists
                const recycleBinRoot = path.join(process.cwd(), 'public', 'assets', 'recycle_bin');
                if (!fs.existsSync(recycleBinRoot)) {
                    fs.mkdirSync(recycleBinRoot, { recursive: true });
                }

                // Move folder
                fs.renameSync(personaPath, recyclePath);
                console.log(`Moved assets for ${slug} to recycle bin`);
            }
        }

        await prisma.character.update({
            where: { id },
            data: { isActive: false }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete character error:', error);
        return NextResponse.json({ error: 'Failed to delete character' }, { status: 500 });
    }
}
export async function PATCH(request: Request) {
    try {
        const body = await request.json();
        const { id, ...data } = body;

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const updateData: any = {
            name: data.name,
            handle: data.handle,
            bio: data.bio,
            loraMix: data.loraMix,
            looksDescription: data.looksDescription,
            previewUrl: data.previewUrl,
            platformSettings: data.platformSettings ? JSON.stringify(data.platformSettings) : undefined,
            attributes: data.attributes ? JSON.stringify(data.attributes) : undefined,
        };

        let character;
        try {
            character = await prisma.character.update({
                where: { id },
                data: updateData
            });
        } catch (err: any) {
            // Fallback if Prisma client is stale/out of sync with schema
            if (err.message?.includes('previewUrl')) {
                console.warn('[Prisma] previewUrl not recognized by client, falling back...');
                delete updateData.previewUrl;
                character = await prisma.character.update({
                    where: { id },
                    data: updateData
                });
            } else {
                throw err;
            }
        }

        const safeParse = (str: string | null | undefined) => {
            if (!str) return {};
            try {
                return JSON.parse(str);
            } catch (e) {
                return {};
            }
        };

        return NextResponse.json({
            ...character,
            platformSettings: safeParse(character.platformSettings),
            attributes: safeParse((character as any).attributes)
        });
    } catch (error) {
        console.error('Character Update Error:', error);
        return NextResponse.json({ error: 'Failed to update persona' }, { status: 500 });
    }
}
