import axios, { AxiosInstance } from 'axios';
import { prisma } from '@/lib/prisma';

export interface FanvueAuth {
    accessToken: string;
}

export class FanvueClient {
    private client: AxiosInstance;

    constructor(token: string) {
        const baseURL = 'https://api.fanvue.com';

        this.client = axios.create({
            baseURL,
            headers: {
                'Content-Type': 'application/json',
                'X-Fanvue-API-Version': '2025-06-26',
                'Authorization': `Bearer ${token}`,
                'User-Agent': 'FanvueUltimateStudio/1.0',
            },
        });
    }

    /**
     * Factory: Create client for a character by fetching token from DB
     */
    static async fromCharacter(slug: string): Promise<FanvueClient> {
        const character = await prisma.character.findUnique({
            where: { slug }
        });

        if (!character || !character.fanvueAccessToken) {
            throw new Error(`Character '${slug}' has no active Fanvue session. Please connect via OAuth.`);
        }

        // TODO: Add token expiry check and refresh logic here

        return new FanvueClient(character.fanvueAccessToken);
    }

    async getProfile() {
        const response = await this.client.get('/users/me');
        return response.data;
    }

    async createPost(data: {
        text: string;
        mediaUuids?: string[];
        scheduledAt?: string;
        price?: number;
        audience?: 'subscribers' | 'followers-and-subscribers' | 'everyone';
    }) {
        const payload = {
            text: data.text,
            mediaUuids: data.mediaUuids || [],
            audience: data.audience || 'subscribers',
            price: data.price ? Math.round(data.price * 100) : 0,
            scheduledAt: data.scheduledAt
        };

        const response = await this.client.post('/posts', payload);
        return response.data;
    }

    async uploadMedia(fileBuffer: Buffer, filename: string): Promise<string> {
        // Step 1: Initialize upload
        const initRes = await this.client.post('/media/uploads', {
            name: filename.replace(/\.[^.]+$/, ''),
            filename: filename,
            mediaType: 'image'
        });

        const { mediaUuid, uploadId } = initRes.data;

        // Step 2: Get part URL
        const partRes = await this.client.get(`/media/uploads/${uploadId}/parts/1/url`);
        const uploadUrl = partRes.data;

        // Step 3: Put to S3
        const s3Res = await axios.put(uploadUrl, fileBuffer, {
            headers: { 'Content-Type': 'application/octet-stream' }
        });

        const etag = s3Res.headers['etag'];

        // Step 4: Complete
        await this.client.patch(`/media/uploads/${uploadId}`, {
            parts: [{ ETag: etag, PartNumber: 1 }]
        });

        return mediaUuid;
    }
}
