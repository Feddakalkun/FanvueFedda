import { PROMPT_ENGINE, MOOD_STYLES, CHARACTER } from './constants';

export function generatePrompt(story: any) {
    // Random selection logic
    const randSkin = PROMPT_ENGINE.skin[Math.floor(Math.random() * PROMPT_ENGINE.skin.length)];
    const randEyes = PROMPT_ENGINE.eyes[Math.floor(Math.random() * PROMPT_ENGINE.eyes.length)];

    const style = MOOD_STYLES[story.mood] || MOOD_STYLES.authentic;
    const lighting = (PROMPT_ENGINE.lighting as any)[story.mood] || PROMPT_ENGINE.lighting.authentic;

    return `
        masterpiece, award-winning photography, ultra high resolution,
        photo of ${CHARACTER.appearance}, 
        ${randSkin}, ${randEyes},
        ${style.makeup}, ${style.hair},
        ${story.scene}, 
        ${lighting}, ${style.camera},
        ultra detailed, photorealistic, 8k UHD, RAW photo, best quality,
        sharp focus on eyes, catchlight in eyes, detailed iris,
        professional color grading, cinematic
    `.replace(/\s+/g, ' ').trim();
}
