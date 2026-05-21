import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_REDIRECT_URI = 'https://localhost:3001/api/auth/fanvue/callback';

export async function GET() {
    try {
        const config = await prisma.appConfig.findUnique({
            where: { id: 'global' }
        });
        return NextResponse.json(config || {});
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch config' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const config = await prisma.appConfig.upsert({
            where: { id: 'global' },
            update: {
                fanvueClientId: body.fanvueClientId,
                fanvueClientSecret: body.fanvueClientSecret,
                fanvueRedirectUri: body.fanvueRedirectUri || process.env.OAUTH_REDIRECT_URI || DEFAULT_REDIRECT_URI,
            },
            create: {
                id: 'global',
                fanvueClientId: body.fanvueClientId,
                fanvueClientSecret: body.fanvueClientSecret,
                fanvueRedirectUri: body.fanvueRedirectUri || process.env.OAUTH_REDIRECT_URI || DEFAULT_REDIRECT_URI,
            }
        });
        return NextResponse.json(config);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update config' }, { status: 500 });
    }
}
