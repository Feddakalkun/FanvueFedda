import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // In a real scenario, we would use an API like Apify or RapidAPI
        // For now, we'll provide a set of high-performing 'Evergreen' trends 
        // that work well with the Scandi/TikTok aesthetic.

        const mockTrends = [
            {
                id: '1',
                type: 'song',
                title: 'Stargazing (Slowed + Reverb)',
                artist: 'Myles Smith',
                hashtag: '#stargazing',
                vibe: 'Dreamy/Night',
                audioUrl: 'https://v16-webapp-prime.tiktok.com/video/tos/useast2a/tos-useast2a-ve-0068c001-e2/o0EIEDAfA2ZJ8IEAebIDfQAgAIfmEEnf6AeQZA/?a=1988&br=0&bt=0&cd=0%7C0%7C0%7C0&ch=0&cr=0&cs=0&cv=1&dr=0&ds=3&er=&ft=4b~YMM988988V~Ld8r8e.N&l=202405231234567890&lr=tiktok_m&mime_type=audio_mpeg&net=0&pl=0&qs=0&rc=M3U6MzU6MzU6MzU6MzU6MzU6MzU6MzU6&vl=&vr='
            },
            {
                id: '2',
                type: 'song',
                title: 'Nasty',
                artist: 'Tinashe',
                hashtag: '#nasty',
                vibe: 'Confident/Club',
                audioUrl: 'https://v16-webapp-prime.tiktok.com/video/tos/useast2a/tos-useast2a-ve-0068c001-e2/oNastyMockAudioUrl/?mime_type=audio_mpeg'
            },
            {
                id: '3',
                type: 'challenge',
                title: 'Outfit Check (Transition)',
                hashtag: '#outfitcheck',
                vibe: 'Fashion/Minimalist',
                audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' // Placeholder if no official song
            },
            {
                id: '4',
                type: 'song',
                title: 'Espresso',
                artist: 'Sabrina Carpenter',
                hashtag: '#espresso',
                vibe: 'Summer/Vibrant',
                audioUrl: 'https://v16-webapp-prime.tiktok.com/video/tos/useast2a/tos-useast2a-ve-0068c001-e2/oEspressoMockAudioUrl/?mime_type=audio_mpeg'
            },
            {
                id: '5',
                type: 'vibe',
                title: 'Clean Girl Aesthetic',
                hashtag: '#cleangirl',
                vibe: 'Natural/Soft',
                audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3'
            }
        ];

        // If the user has an API Key, we could fetch here:
        /*
        const res = await fetch('https://api.apify.com/v2/acts/codebyte~tiktok-trending-songs-analytics/runs/last/dataset/items?token=' + process.env.APIFY_TOKEN);
        const realTrends = await res.json();
        return NextResponse.json(realTrends.slice(0, 10));
        */

        return NextResponse.json(mockTrends);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 });
    }
}
