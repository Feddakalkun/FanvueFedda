import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    const config = await prisma.appConfig.findUnique({
        where: { id: 'global' }
    });

    return NextResponse.json(config || {});
}

export async function POST(request: NextRequest) {
    const body = await request.json();

    const config = await prisma.appConfig.upsert({
        where: { id: 'global' },
        update: {
            fanvueClientId: body.fanvueClientId,
            fanvueClientSecret: body.fanvueClientSecret,
            setupCompleted: true
        },
        create: {
            id: 'global',
            fanvueClientId: body.fanvueClientId,
            fanvueClientSecret: body.fanvueClientSecret,
            setupCompleted: true
        }
    });

    return NextResponse.json({ success: true, config });
}
