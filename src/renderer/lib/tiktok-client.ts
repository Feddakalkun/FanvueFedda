import { prisma } from './prisma';

export class TikTokClient {
    private clientKey: string;
    private clientSecret: string;

    constructor() {
        this.clientKey = process.env.TIKTOK_CLIENT_KEY || '';
        this.clientSecret = process.env.TIKTOK_CLIENT_SECRET || '';
    }

    async getConnection(characterId: string) {
        return await prisma.tikTokConnection.findUnique({
            where: { characterId }
        });
    }

    async getValidAccessToken(connectionId: string): Promise<string> {
        const connection = await prisma.tikTokConnection.findUnique({
            where: { id: connectionId }
        });

        if (!connection) {
            throw new Error('TikTok connection not found');
        }

        // Check if token is expired (buffer 5 mins)
        if (new Date(Date.now() + 5 * 60000) >= connection.expiresAt) {
            return this.refreshAccessToken(connectionId);
        }

        return connection.accessToken;
    }

    async refreshAccessToken(connectionId: string): Promise<string> {
        const connection = await prisma.tikTokConnection.findUnique({
            where: { id: connectionId }
        });

        if (!connection) {
            throw new Error('TikTok connection not found');
        }

        const response = await fetch('https://open.tiktokapis.com/v2/oauth/token/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: new URLSearchParams({
                client_key: this.clientKey,
                client_secret: this.clientSecret,
                grant_type: 'refresh_token',
                refresh_token: connection.refreshToken
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(`Token refresh failed: ${data.error_description || JSON.stringify(data)}`);
        }

        const { access_token, refresh_token, expires_in } = data;
        const expiresAt = new Date(Date.now() + expires_in * 1000);

        // Update database
        await prisma.tikTokConnection.update({
            where: { id: connectionId },
            data: {
                accessToken: access_token,
                refreshToken: refresh_token,
                expiresIn: expires_in,
                expiresAt,
                lastTokenRefresh: new Date()
            }
        });

        return access_token;
    }

    async publishVideo(
        connectionId: string,
        videoUrl: string,
        caption: string
    ): Promise<{ publish_id: string }> {
        const accessToken = await this.getValidAccessToken(connectionId);

        // Step 1: Initialize Upload (Direct Publish)
        const initResponse = await fetch(
            'https://open.tiktokapis.com/v2/post/publish/video/init/',
            {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    source_info: {
                        source: 'PULL_FROM_URL',
                        video_url: videoUrl
                    },
                    post_info: {
                        caption: caption.slice(0, 2000),
                        privacy_level: 'PUBLIC'
                    }
                })
            }
        );

        const initData = await initResponse.json();

        if (initData.error) {
            throw new Error(`TikTok Publish Init Failed: ${initData.error.message || JSON.stringify(initData.error)}`);
        }

        const { publish_id } = initData.data;

        // Update stats
        await prisma.tikTokConnection.update({
            where: { id: connectionId },
            data: {
                totalPostsVia: { increment: 1 },
                lastPostedAt: new Date()
            }
        });

        return { publish_id };
    }
}

export const tikTokClient = new TikTokClient();
