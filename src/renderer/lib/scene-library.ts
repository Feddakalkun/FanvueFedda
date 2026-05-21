export interface Scene {
    id: string;
    name: string;
    category: string;
    prompt: string;
    params?: {
        compression?: number;
        cfg?: number;
        strength?: number;
    };
}

export const SCENE_LIBRARY: Scene[] = [
    // --- BATCH 27: OUTDOOR TIKTOK POSES ---
    {
        id: 'batch27_1',
        category: 'Outdoor TikTok Poses',
        name: 'Sunny Beach Walk',
        prompt: 'Sunny tropical beach golden hour wind blowing: {identity} walks barefoot on sand low-rise light wash jeans tiny white crop top hair flowing hips swaying naturally looking away relaxed small perky buttocks petite firm buttocks visible: smooth tracking shot beside 2.5m 35mm f/2.8: viral TikTok cinematic teal-orange glow soft film grain Kodak 2383 LUT high energy: 24fps natural motion blur 180° shutter steady walking rhythm gentle breeze: exact input face outfits pose preserved no morphing flicker text high-freq patterns UI artifacts.',
        params: { compression: 38, cfg: 4, strength: 0.72 }
    },
    {
        id: 'batch27_2',
        category: 'Outdoor TikTok Poses',
        name: 'City Street Golden Hour Lean',
        prompt: 'Busy city street golden hour: {identity} leans against wall low-rise baggy jeans crop top hip cocked looking away confident small perky buttocks petite firm buttocks visible: slow orbit 35° clockwise 35mm f/2.8: viral TikTok cinematic teal-orange glow soft film grain Kodak 2383 LUT high energy: 24fps natural motion blur 180° shutter steady gentle sway rhythm: exact input face outfits pose preserved no morphing flicker text high-freq patterns UI artifacts.',
        params: { compression: 38, cfg: 4, strength: 0.72 }
    },
    {
        id: 'batch27_3',
        category: 'Outdoor TikTok Poses',
        name: 'Park Grass Sit',
        prompt: 'Sunny park grass golden hour: {identity} sits on grass legs stretched low-rise pleated mini skirt crop top chin in hand looking into distance dreamy small perky buttocks petite firm buttocks visible: slow gentle dolly-in 1.5m 35mm f/2.8: viral TikTok cinematic teal-orange glow soft film grain Kodak 2383 LUT high energy: 24fps natural motion blur 180° shutter steady gentle breathing rhythm: exact input face outfits pose preserved no morphing flicker text high-freq patterns UI artifacts.',
        params: { compression: 38, cfg: 4, strength: 0.72 }
    },
    {
        id: 'batch27_4',
        category: 'Outdoor TikTok Poses',
        name: 'Coastal Boardwalk Twirl',
        prompt: '{identity} does cute twirl low-rise denim shorts crop top hair flying looking away happy small perky buttocks petite firm buttocks visible: smooth orbit 45° clockwise 35mm f/2.8: viral TikTok cinematic teal-orange glow soft film grain Kodak 2383 LUT high energy: 24fps natural motion blur 180° shutter steady twirl rhythm: exact input face outfits pose preserved no morphing flicker text high-freq patterns UI artifacts.',
        params: { compression: 38, cfg: 4, strength: 0.72 }
    },
    {
        id: 'batch27_5',
        category: 'Outdoor TikTok Poses',
        name: 'Rooftop Railing Lean',
        prompt: 'City rooftop railing golden hour: {identity} leans on railing low-rise baggy jeans crop top looking into skyline calm small perky buttocks petite firm buttocks visible: slow crane up 1.2m 35mm f/2.8: viral TikTok cinematic teal-orange glow soft film grain Kodak 2383 LUT high energy: 24fps natural motion blur 180° shutter steady gentle wind rhythm: exact input face outfits pose preserved no morphing flicker text high-freq patterns UI artifacts.',
        params: { compression: 38, cfg: 4, strength: 0.72 }
    },
    {
        id: 'batch27_6',
        category: 'Outdoor TikTok Poses',
        name: 'Urban Stairs Sit',
        prompt: 'Urban stairs golden hour: {identity} sits on stairs low-rise ripped jeans crop top arms on knees looking away relaxed small perky buttocks petite firm buttocks visible: slow orbit 30° clockwise 35mm f/2.8: viral TikTok cinematic teal-orange glow soft film grain Kodak 2383 LUT high energy: 24fps natural motion blur 180° shutter steady gentle breathing rhythm: exact input face outfits pose preserved no morphing flicker text high-freq patterns UI artifacts.',
        params: { compression: 38, cfg: 4, strength: 0.72 }
    },
    {
        id: 'batch27_7',
        category: 'Outdoor TikTok Poses',
        name: 'Park Path Walk Hair Flip',
        prompt: 'Sunny park path golden hour: {identity} walks on path low-rise mini skirt crop top hair flip looking away playful small perky buttocks petite firm buttocks visible: smooth tracking shot beside 2m 35mm f/2.8: viral TikTok cinematic teal-orange glow soft film grain Kodak 2383 LUT high energy: 24fps natural motion blur 180° shutter steady walking rhythm: exact input face outfits pose preserved no morphing flicker text high-freq patterns UI artifacts.',
        params: { compression: 38, cfg: 4, strength: 0.72 }
    },
    {
        id: 'batch27_8',
        category: 'Outdoor TikTok Poses',
        name: 'Sunset Beach Railing Lean',
        prompt: 'Sunset beach railing: {identity} leans on railing low-rise shorts crop top looking at sunset dreamy small perky buttocks petite firm buttocks visible: slow gentle dolly-in 1.5m 35mm f/2.8: viral TikTok cinematic teal-orange glow soft film grain Kodak 2383 LUT high energy: 24fps natural motion blur 180° shutter steady gentle ocean waves rhythm: exact input face outfits pose preserved no morphing flicker text high-freq patterns UI artifacts.',
        params: { compression: 38, cfg: 4, strength: 0.72 }
    },

    // --- BATCH 28: INDOOR SOFT BONDAGE ---
    {
        id: 'batch28_1',
        category: 'Indoor Soft Bondage',
        name: 'Silk Ribbon Wrists to Headboard',
        prompt: 'Luxurious bedroom soft warm candlelight silk sheets: {identity} lies on back wrists softly bound with black silk ribbons to headboard low-rise white shorts tiny crop top riding up showing slim waist small perky A-cup petite perky buttocks arched slightly looking away submissive vulnerable: slow gentle dolly-in 1.5m 35mm f/2.8: moody sensual teal-orange filmic glow soft grain Kodak 2383 LUT cinematic texture: 24fps natural motion blur 180° shutter steady gentle breathing rhythm: exact input face outfits pose preserved no morphing flicker text high-freq patterns UI artifacts.',
        params: { compression: 38, cfg: 4, strength: 0.72 }
    },
    {
        id: 'batch28_2',
        category: 'Indoor Soft Bondage',
        name: 'Kneeling on Bed Wrists Behind Back',
        prompt: 'Cozy bedroom soft lamp light silk bedding: {identity} kneels on bed wrists bound behind back with silk ribbons low-rise gray mini skirt crop top small perky A-cup arched back petite perky buttocks visible looking down submissive: slow orbit 30° clockwise 35mm f/2.8: moody sensual teal-orange filmic glow soft grain Kodak 2383 LUT cinematic texture: 24fps natural motion blur 180° shutter steady gentle body tremble rhythm: exact input face outfits pose preserved no morphing flicker text high-freq patterns UI artifacts.',
        params: { compression: 38, cfg: 4, strength: 0.72 }
    },
    {
        id: 'batch28_3',
        category: 'Indoor Soft Bondage',
        name: 'Floor Kneeling Wrists in Front',
        prompt: 'Modern bedroom soft rug candlelight: {identity} kneels on floor wrists softly bound in front with black silk ribbon low-rise black shorts crop top small perky A-cup arched back petite perky buttocks looking away submissive: slow gentle dolly-in 1.5m 35mm f/2.8: moody sensual teal-orange filmic glow soft grain Kodak 2383 LUT cinematic texture: 24fps natural motion blur 180° shutter steady gentle breathing rhythm: exact input face outfits pose preserved no morphing flicker text high-freq patterns UI artifacts.',
        params: { compression: 38, cfg: 4, strength: 0.72 }
    },
    {
        id: 'batch28_4',
        category: 'Indoor Soft Bondage',
        name: 'Bed Edge Wrists Tied to Knees',
        prompt: 'Luxurious bedroom silk sheets soft light: {identity} sits on bed edge wrists softly tied to knees with silk ribbons low-rise shorts crop top small perky A-cup slim waist petite perky buttocks visible looking away vulnerable: slow orbit 35° clockwise 35mm f/2.8: moody sensual teal-orange filmic glow soft grain Kodak 2383 LUT cinematic texture: 24fps natural motion blur 180° shutter steady gentle breathing rhythm: exact input face outfits pose preserved no morphing flicker text high-freq patterns UI artifacts.',
        params: { compression: 38, cfg: 4, strength: 0.72 }
    },
    {
        id: 'batch28_5',
        category: 'Indoor Soft Bondage',
        name: 'Window Light Wrists Behind',
        prompt: 'Bedroom window soft natural light: {identity} stands by window wrists bound behind back with silk ribbon low-rise jeans crop top small perky A-cup petite perky buttocks visible looking out window submissive: slow gentle dolly-in 1.5m 35mm f/2.8: moody sensual teal-orange filmic glow soft grain Kodak 2383 LUT cinematic texture: 24fps natural motion blur 180° shutter steady gentle wind rhythm: exact input face outfits pose preserved no morphing flicker text high-freq patterns UI artifacts.',
        params: { compression: 38, cfg: 4, strength: 0.72 }
    },
    {
        id: 'batch28_6',
        category: 'Indoor Soft Bondage',
        name: 'Sofa Lean Wrists Bound',
        prompt: 'Cozy bedroom sofa candlelight: {identity} leans forward on sofa wrists tied in front with silk ribbon low-rise mini skirt crop top small perky A-cup petite perky buttocks visible looking away submissive: slow orbit 30° clockwise 35mm f/2.8: moody sensual teal-orange filmic glow soft grain Kodak 2383 LUT cinematic texture: 24fps natural motion blur 180° shutter steady gentle breathing rhythm: exact input face outfits pose preserved no morphing flicker text high-freq patterns UI artifacts.',
        params: { compression: 38, cfg: 4, strength: 0.72 }
    },
    {
        id: 'batch28_7',
        category: 'Indoor Soft Bondage',
        name: 'Bed Lying on Stomach Wrists Behind',
        prompt: 'Luxurious bedroom silk sheets soft light: {identity} lies on stomach wrists softly bound behind back with silk ribbons low-rise shorts crop top small perky A-cup petite perky buttocks arched slightly looking away submissive: slow gentle dolly-in 1.5m 35mm f/2.8: moody sensual teal-orange filmic glow soft grain Kodak 2383 LUT cinematic texture: 24fps natural motion blur 180° shutter steady gentle breathing rhythm: exact input face outfits pose preserved no morphing flicker text high-freq patterns UI artifacts.',
        params: { compression: 38, cfg: 4, strength: 0.72 }
    },
    {
        id: 'batch28_8',
        category: 'Indoor Soft Bondage',
        name: 'Mirror Bondage Reflection',
        prompt: 'Bedroom mirror soft lamp light: {identity} stands in front of mirror wrists bound behind back with silk ribbon low-rise jeans crop top small perky A-cup slim waist petite perky buttocks visible looking away submissive: smooth orbit 35° clockwise 35mm f/2.8: moody sensual teal-orange filmic glow soft grain Kodak 2383 LUT cinematic texture: 24fps natural motion blur 180° shutter steady gentle sway rhythm: exact input face outfits pose preserved no morphing flicker text high-freq patterns UI artifacts.',
        params: { compression: 38, cfg: 4, strength: 0.72 }
    }
];
