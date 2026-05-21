import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
    baseURL: 'http://localhost:11434/v1',
    apiKey: 'ollama', // Required but ignored by Ollama
});

export async function POST(request: Request) {
    try {
        const { imageBase64 } = await request.json();

        if (!imageBase64) {
            return NextResponse.json({ error: 'No image provided' }, { status: 400 });
        }

        // The image usually comes in as "data:image/png;base64,....."
        // OpenAI vision expects the raw base64 or a properly formatted data URI
        const completion = await openai.chat.completions.create({
            model: 'user-v4/joycaption-beta:latest',
            messages: [
                {
                    role: 'system',
                    content: 'You are an Appearance Script Extractor. Your job is to look at the provided image and generate a factual, unopinionated list of the person\'s physical traits (e.g. hair color, style, eye shape, body build, skin texture, distinct facial features). Do NOT use subjective terms like beautiful or gorgeous. Return ONLY a comma-separated list of these descriptive tags.'
                },
                {
                    role: 'user',
                    content: [
                        { type: 'text', text: 'Extract appearance script:' },
                        { type: 'image_url', image_url: { url: imageBase64 } }
                    ]
                }
            ],
            temperature: 0.3,
            max_tokens: 150,
        });

        const caption = completion.choices[0]?.message?.content?.trim() || '';

        return NextResponse.json({ caption });

    } catch (error) {
        console.error('Captioning Error:', error);
        return NextResponse.json({ error: 'Internal server error processing caption' }, { status: 500 });
    }
}
