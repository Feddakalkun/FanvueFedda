import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                accent: {
                    pink: "#ff007a",
                    blue: "#00d4ff",
                    purple: "#7e22ce",
                },
            },
            backgroundImage: {
                'gradient-premium': 'linear-gradient(135deg, #ff007a 0%, #7e22ce 50%, #00d4ff 100%)',
            },
        },
    },
    plugins: [],
};
export default config;
