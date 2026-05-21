import { NextRequest, NextResponse } from 'next/server';
import { FanvueClient } from '@/lib/fanvue/client';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
    try {
        // Fetch the first character in the DB for the dashboard view
        const character = await prisma.character.findFirst({
            where: { fanvueAccessToken: { not: null } }
        });

        if (!character?.slug) {
            return NextResponse.json({ success: false, message: 'No character connected' }, { status: 401 });
        }

        const client = await FanvueClient.fromCharacter(character.slug);
        const profile = await client.getProfile();

        return NextResponse.json({
            success: true,
            profile,
            character: {
                name: character.name,
                handle: character.handle,
                slug: character.slug
            }
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message
        }, { status: 401 });
    }
}
