import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { FanvueAuth } from '@/core/api/fanvue/auth.js';

const DEFAULT_REDIRECT_URI = 'https://localhost:3001/api/auth/fanvue/callback';
export async function GET(request: NextRequest) {
    const config = await prisma.appConfig.findUnique({ where: { id: 'global' } });

    if (!config?.fanvueClientId) {
        return new NextResponse(
            `<html>
                <body style="background: #000; color: #fff; font-family: sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; text-align: center;">
                    <div style="background: rgba(255,255,255,0.05); padding: 3rem; border-radius: 2rem; border: 1px solid rgba(255,255,255,0.1); max-width: 500px;">
                        <h1 style="font-weight: 900; font-style: italic; letter-spacing: -0.05em; margin-bottom: 1rem;">OAUTH NOT CONFIGURED</h1>
                        <p style="color: rgba(255,255,255,0.4); font-size: 0.9rem; line-height: 1.6; margin-bottom: 2rem;">
                            Your Fanvue Developer credentials have not been set. <br/>
                            Go to <b>Settings > Fanvue Developer Access</b> to configure your Client ID and Secret first.
                        </p>
                        <a href="/" style="background: #fff; color: #000; padding: 1rem 2rem; border-radius: 99px; text-decoration: none; font-weight: 900; text-transform: uppercase; font-size: 0.75rem; letter-spacing: 0.2rem; transition: transform 0.2s;">
                            Back to Studio
                        </a>
                    </div>
                </body>
            </html>`,
            { headers: { 'Content-Type': 'text/html' }, status: 400 }
        );
    }

    const redirectUri = config.fanvueRedirectUri || process.env.OAUTH_REDIRECT_URI || DEFAULT_REDIRECT_URI;
    const auth = new FanvueAuth({
        clientId: config.fanvueClientId,
        clientSecret: config.fanvueClientSecret || "",
        redirectUri,
    });
    const { state, codeVerifier: verifier, codeChallenge: challenge } = auth.generatePKCE();

    // Store verifier and state in secure cookies for the callback
    const cookieStore = await cookies();
    const secureCookie = request.nextUrl.protocol === 'https:' || process.env.NODE_ENV === 'production';
    cookieStore.set('fanvue_oauth_state', state, { httpOnly: true, secure: secureCookie, sameSite: 'lax', path: '/', maxAge: 600 });
    cookieStore.set('fanvue_oauth_verifier', verifier, { httpOnly: true, secure: secureCookie, sameSite: 'lax', path: '/', maxAge: 600 });

    const authUrl = auth.getAuthorizationUrl(challenge, state);
    return NextResponse.redirect(authUrl);
}
