
export interface VibePreset {
    id: string;
    name: string;
    aestheticDriver: string;
    keywords: string;
    styleLora?: {
        path: string;
        strength: number;
    };
    negativePrompt?: string;
}

export const VIBE_PRESETS: Record<string, VibePreset> = {
    'Viral SoMe / Turnon': {
        id: 'viral_some',
        name: 'Viral SoMe / Turnon',
        aestheticDriver: "(raw amateur smartphone photo:1.3), (candid unposed snapshot:1.2), (stunning woman in her mid-20s:1.4), (natural lighting:1.1), (full body framing:1.1), messy domestic background",
        keywords: "standing in a bedroom, (ultra low-rise pants:1.3), (showing sharp hip bones:1.3), (flat belly:1.2), (abs definition:1.1), (stomach focus:1.2), wearing a tiny crop top, navel visible, messy authentic room, viral aesthetic, raw amateur photo",
        styleLora: { path: 'Style\\mysticXXXZITV5.KEmz.safetensors', strength: 0.35 }
    },
    'TikTok Mirror Selfie': {
        id: 'tiktok_mirror',
        name: 'TikTok Mirror Selfie',
        aestheticDriver: "(raw amateur smartphone photo:1.3), (candid unposed snapshot:1.2), (stunning woman in her mid-20s:1.4), (natural lighting:1.1), (full body framing:1.1), messy domestic background",
        keywords: "(bored neutral expression:1.3), looking at camera in a mirror, (mirror selfie:1.2), holding smartphone, messy bathroom background, harsh overhead lighting, grainy snapchat photo style, unposed authentic snap",
        styleLora: { path: 'Style\\mysticXXXZITV5.KEmz.safetensors', strength: 0.35 }
    },
    'Vintage Disposable Film': {
        id: 'vintage_film',
        name: 'Vintage Disposable Film',
        aestheticDriver: "(raw amateur smartphone photo:1.3), (candid unposed snapshot:1.2), (stunning woman in her mid-20s:1.4), (natural lighting:1.1), (full body framing:1.1), messy domestic background",
        keywords: "candid party moment, (disposable camera flash:1.3), overexposed direct flash, red-eye effect, grainy 35mm film texture, slight motion blur, authentic raw nightlife aesthetic",
        styleLora: { path: 'Style\\mysticXXXZITV5.KEmz.safetensors', strength: 0.35 }
    },
    'Scandi Y2K Style': {
        id: 'scandi_y2k',
        name: 'Scandi Y2K Style',
        aestheticDriver: "(raw amateur smartphone photo:1.3), (candid unposed snapshot:1.2), (stunning woman in her mid-20s:1.4), (natural lighting:1.1), (full body framing:1.1), messy domestic background",
        keywords: "Scandinavian petite woman, (super low-rise baggy cargo jeans:1.2), (tiny crop top:1.2), Y2K 2000s aesthetic, showing hip bones, flat belly, amateur smartphone camera angle, blurry candid",
        styleLora: { path: 'Style\\mysticXXXZITV5.KEmz.safetensors', strength: 0.35 }
    },
    'Natural Window Light': {
        id: 'natural_light',
        name: 'Natural Window Light',
        aestheticDriver: "(professional studio photography:1.1), (stunning woman in her mid-20s:1.3), (sharp focus:1.1), (soft studio lighting:1.1), (3/4 body shot:1.2), indoor apartment background",
        keywords: "relaxed natural female expression, soft morning window light, (no makeup look:1.1), casual everyday outfit, cozy indoor atmosphere, natural skin texture, soft shadows",
        styleLora: { path: 'Style\\nicegirls_Zimage.safetensors', strength: 0.3 }
    },
    'Messy Morning Bedroom': {
        id: 'morning_bedroom',
        name: 'Messy Morning Bedroom',
        aestheticDriver: "(raw amateur smartphone photo:1.3), (candid unposed snapshot:1.2), (stunning woman in her mid-20s:1.4), (natural lighting:1.1), (full body framing:1.1), messy domestic background",
        keywords: "just woke up aesthetic, messy unmade bed background, (oversized t-shirt:1.2), tousled messy hair, morning glow, raw unedited smartphone photo, soft focus",
        styleLora: { path: 'Style\\lenovo_z.safetensors', strength: 0.35 }
    },
    'Cozy Apartment Snap': {
        id: 'cozy_apt',
        name: 'Cozy Apartment Snap',
        aestheticDriver: "(raw amateur smartphone photo:1.3), (candid unposed snapshot:1.2), (stunning woman in her mid-20s:1.4), (natural lighting:1.1), (full body framing:1.1), messy domestic background",
        keywords: "casual unposted candid snap, messy modern apartment background, standing in a doorway, relaxed posture, everyday casual clothes, natural warm lighting",
        styleLora: { path: 'Style\\lenovo_z.safetensors', strength: 0.35 }
    },
    'High-Contrast Flash': {
        id: 'high_contrast_flash',
        name: 'High-Contrast Flash',
        aestheticDriver: "(raw amateur smartphone photo:1.3), (candid unposed snapshot:1.2), (stunning woman in her mid-20s:1.4), dark background",
        keywords: "(harsh direct flash:1.4), dark background, high contrast, (raw flash photography:1.2), visible skin pores and imperfections, sharp focus on subject, authentic snapshot vibe",
        styleLora: { path: 'Style\\nicegirls_Zimage.safetensors', strength: 0.4 }
    },
    'Studio Professional': {
        id: 'studio_pro',
        name: 'Studio Professional',
        aestheticDriver: "(professional studio photography:1.2), (stunning woman in her mid-20s:1.4), (sharp focus:1.1), (soft studio lighting:1.1), (3/4 body shot:1.2), (neutral minimalist grey studio background:1.3)",
        keywords: "(clean minimal studio background:1.3), (solid grey backdrop:1.2), professional ring light, sharp detailed features, ultra-high resolution, sophisticated adult woman",
    },
    'Neon Night Street': {
        id: 'neon_night',
        name: 'Neon Night Street',
        aestheticDriver: "(professional photography:1.1), (stunning woman in her mid-20s:1.3), cinematic lighting, city street at night",
        keywords: "standing on a city street at night, (vibrant neon lighting:1.3), colorful reflections on skin, night city bokeh, cinematic urban atmosphere, high detail",
    },
    'Lace & Silk Detail': {
        id: 'lace_silk',
        name: 'Lace & Silk Detail',
        aestheticDriver: "(professional photography:1.1), (stunning woman in her mid-20s:1.4), intimate bedroom setting",
        keywords: "wearing (intricate sheer white lace bodysuit:1.3), silk textures, close up on fabric, soft moody bedroom lighting, elegant feminine posture, sensual but tasteful",
        styleLora: { path: 'Style\\mysticXXXZITV5.KEmz.safetensors', strength: 0.4 }
    },
    'Minimalist Lingerie': {
        id: 'min_lingerie',
        name: 'Minimalist Lingerie',
        aestheticDriver: "(raw amateur smartphone photo:1.3), (candid unposed snapshot:1.2), (stunning woman in her mid-20s:1.4), (natural lighting:1.1), messy domestic background",
        keywords: "wearing (minimalist black bra and matching thong:1.3), simple modern bedroom, (grainy smartphone photo:1.2), harsh flash, low-angle candid, unposed and raw",
        styleLora: { path: 'Style\\mysticXXXZITV5.KEmz.safetensors', strength: 0.45 }
    },
    'Mood Kink / Leather': {
        id: 'mood_kink',
        name: 'Mood Kink / Leather',
        aestheticDriver: "(raw amateur smartphone photo:1.3), (candid unposed snapshot:1.2), (stunning woman in her mid-20s:1.4), dark bedroom setting",
        keywords: "(tight black leather choker:1.2), leather harness, submissive posture, low-key lighting, dark aesthetic, (grainy amateur snap:1.3), provocative but unposed",
        styleLora: { path: 'Style\\mysticXXXZITV5.KEmz.safetensors', strength: 0.5 }
    },
    'Passport Studio': {
        id: 'passport_studio',
        name: 'Passport Studio',
        aestheticDriver: "(professional passport photo:1.3), (id photo style:1.2), (stunning woman in her early 20s:1.4), (neutral grey studio background:1.4), sharp focus, centered framing, high resolution",
        keywords: "clean formal lighting, looking directly at camera, front view, (flat lighting:1.1), (white or light grey backdrop:1.2), clear facial features, 3/4 face framing or closer, professional studio quality",
    }
};

export const DEFAULT_VIBE: VibePreset = {
    id: 'default',
    name: 'Default',
    aestheticDriver: "(professional studio photography:1.2), (stunning woman in her early 20s:1.4), (high detail skin texture:1.1), (cinematic studio lighting:1.1), (3/4 body framing:1.2), (solid neutral grey background:1.3)",
    keywords: "a high-fidelity professional studio portrait, minimalist tight-fitting outfit, looking at camera, neutral expression, realistic skin"
};

export const EXPRESSION_PRESETS: Record<string, string> = {
    'Neutral': 'neutral expression, calm face, looking at camera',
    'Smiling': 'wide happy smile, showing teeth, cheerful expression, eyes sparkling with joy',
    'Serious': 'serious intense expression, focused gaze, slightly compressed lips, authoritative look, looking into lens',
    'Ahegao': '(ecstatic expression of intense pleasure:1.4), head tilted back, (eyes rolled back slightly:1.2), (heavy lidded eyes:1.1), (tongue out:1.2), natural sweat on skin, (flushed face:1.3), heavy heavy blushing, intense blissful expression, mouth open, messy hair, breathless, (ultra-realistic skin texture:1.3), raw and candid',
    'Pouting': 'sultry pouty face, slightly compressed lips, playful moody expression, looking at camera, mature features',
    'Wink': 'playful wink, one eye closed, smiling, flirtatious expression, mature woman'
};

export const DEFAULT_EXPRESSION = EXPRESSION_PRESETS['Neutral'];
