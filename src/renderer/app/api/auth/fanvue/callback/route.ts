import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import axios from 'axios';
import { cookies } from 'next/headers';
import { FanvueAuth } from '@/core/api/fanvue/auth.js';
import { TokenStore } from '@/core/api/fanvue/tokenStore.js';

const DEFAULT_REDIRECT_URI = 'https://localhost:3001/api/auth/fanvue/callback';
const FANVUE_API_URL = 'https://api.fanvue.com';

type FanvueProfile = {
    uuid?: string;
    id?: string | number;
    handle?: string;
    username?: string;
    displayName?: string;
    name?: string;
};

function getProfileHandle(profile: FanvueProfile) {
    const rawHandle = profile.handle || profile.username || 'fanvue';
    return rawHandle.startsWith('@') ? rawHandle : `@${rawHandle}`;
}

function getProfileSlug(profile: FanvueProfile) {
    return getProfileHandle(profile)
        .replace(/^@/, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'fanvue';
}

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');

    if (error) {
        return NextResponse.redirect(new URL('/?error=' + error, request.url));
    }

    const cookieStore = await cookies();
    const storedState = cookieStore.get('fanvue_oauth_state')?.value;
    const verifier = cookieStore.get('fanvue_oauth_verifier')?.value;

    if (!code || state !== storedState || !verifier) {
        return NextResponse.redirect(new URL('/?error=invalid_session', request.url));
    }

    const config = await prisma.appConfig.findUnique({ where: { id: 'global' } });
    if (!config || !config.fanvueClientId || !config.fanvueClientSecret) {
        return NextResponse.redirect(new URL('/?error=app_not_configured', request.url));
    }

    try {
        const redirectUri = config.fanvueRedirectUri || process.env.OAUTH_REDIRECT_URI || DEFAULT_REDIRECT_URI;
        const tokenStore = new TokenStore();
        const auth = new FanvueAuth({
            tokenStore,
            clientId: config.fanvueClientId,
            clientSecret: config.fanvueClientSecret,
            redirectUri,
        });

        const tokenData = await auth.exchangeCodeForTokens(code, verifier);
        const { access_token, refresh_token, expires_in } = tokenData;

        // Get user profile to identify who connected
        const profileRes = await axios.get(`${FANVUE_API_URL}/users/me`, {
            headers: {
                Authorization: `Bearer ${access_token}`,
                'X-Fanvue-API-Version': '2025-06-26',
                'Accept': 'application/json',
            }
        });
        const profile: FanvueProfile = profileRes.data;

        // Save or update the character in DB
        const slug = getProfileSlug(profile);
        const handle = getProfileHandle(profile);
        const displayName = profile.displayName || profile.name || handle.replace(/^@/, '');
        const fanvueUserId = (profile.uuid || profile.id)?.toString();

        await prisma.character.upsert({
            where: { slug },
            update: {
                fanvueAccessToken: access_token,
                fanvueRefreshToken: refresh_token,
                fanvueTokenExpiresAt: new Date(Date.now() + (expires_in * 1000)),
                handle,
                name: displayName,
                fanvueUserId,
                fanvueConnected: true,
            },
            create: {
                slug,
                name: displayName,
                handle,
                fanvueAccessToken: access_token,
                fanvueRefreshToken: refresh_token,
                fanvueTokenExpiresAt: new Date(Date.now() + (expires_in * 1000)),
                fanvueUserId,
                fanvueConnected: true,
            }
        });

        await tokenStore.save(slug, {
            ...tokenData,
            access_token,
            refresh_token,
            expires_at: new Date(Date.now() + ((expires_in || 3600) * 1000)).toISOString(),
        });

        cookieStore.set('fanvue_access_token', access_token, {
            httpOnly: true,
            secure: request.nextUrl.protocol === 'https:' || process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: expires_in || 3600,
        });

        // Cleanup cookies
        cookieStore.delete('fanvue_oauth_state');
        cookieStore.delete('fanvue_oauth_verifier');

        return NextResponse.redirect(new URL('/?connected=true&slug=' + slug, request.url));

    } catch (err: any) {
        console.error('OAuth Callback Error:', err.response?.data || err.message);
        return NextResponse.redirect(new URL('/?error=token_exchange_failed', request.url));
    }
}
