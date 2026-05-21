export const CHARACTER = {
    name: "Emily",
    handle: "@emily_from_north",
    bio: "Full-time fantasy, part-time reality. Denmark-based digital dream. 21 & always online 💕",
    appearance: "platinum blonde hair with natural roots, light blue-grey eyes, Scandinavian features, pale white skin, Danish look, very minimal makeup, fresh natural appearance, cute girl-next-door",
    lora: "Emmy.safetensors",
    themeColor: "#ff007a"
};

export const CONTENT_THEMES = [
    { id: 'authentic', label: 'Authentic', icon: '✨', desc: 'Real, raw, girl-next-door moments.' },
    { id: 'teasing', label: 'Teasing', icon: '😏', desc: 'Playful and flirty teasers.' },
    { id: 'spicy', label: 'Spicy', icon: '🔥', desc: 'Intimate and sultry content.' },
    { id: 'attention', label: 'Attention', icon: '🍑', desc: 'Viral bait and thirst traps.' },
    { id: 'ppv', label: 'Premium PPV', icon: '💰', desc: 'High-end exclusive content.' },
    { id: 'lifestyle', label: 'Lifestyle', icon: '🏠', desc: 'Daily life and cozy vibes.' }
];

export const PROMPT_ENGINE = {
    skin: [
        'ultra-detailed skin pores, visible skin texture, natural skin imperfections',
        'subsurface scattering on skin, translucent skin with visible capillaries',
        'luminous dewy skin with micro-details, skin grain visible',
        'photorealistic skin with subtle blemishes and freckle clusters'
    ],
    eyes: [
        'mesmerizing bright blue eyes with detailed iris patterns',
        'piercing Nordic blue eyes with golden flecks',
        'sparkling sapphire eyes catching light',
        'expressive doe eyes with natural moisture'
    ],
    lighting: {
        authentic: 'natural window light, soft morning glow, cozy ambient',
        spicy: 'dramatic side lighting, moody shadows, candle light',
        attention: 'harsh direct flash, high contrast, vivid colors',
        lifestyle: 'warm-2700K lamp light, cozy home atmosphere',
        ppv: 'cinematic studio lighting, rembrandt lighting, luxury feel'
    }
};

export const MOOD_STYLES: Record<string, any> = {
    authentic: {
        camera: 'iPhone selfie, amateur photo, unposed angle',
        makeup: 'completely bare face, realistic skin texture',
        hair: 'extreme bedhead, tangled, natural'
    },
    spicy: {
        camera: 'harsh flash, direct camera flash, phone camera',
        makeup: 'glossy skin, sweaty sheen, bitten lips',
        hair: 'tousled, wet look'
    },
    ppv: {
        camera: '4k cinema camera, professional macro lens',
        makeup: 'perfect matte skin, dramatic contour',
        hair: 'silk press, perfect shine'
    }
};
