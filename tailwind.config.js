/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    darkMode: "class",
    theme: {
        extend: {
            colors: {
                "primary": "#f4d125",
                "background-light": "#f8f8f5",
                "background-dark": "#0a0a1a",
                "space-deep": "#050510",
                "accent-cyan": "#22d3ee",
                "accent-purple": "#8b5cf6",
                "accent-pink": "#ec4899",
                "accent-gold": "#fbbf24",
            },
            fontFamily: {
                "display": ["Space Grotesk", "sans-serif"]
            },
            borderRadius: {
                "DEFAULT": "0.25rem",
                "sm": "0.375rem",
                "md": "0.5rem",
                "lg": "0.75rem",
                "xl": "1rem",
                "2xl": "1.25rem",
                "3xl": "1.5rem",
                "full": "9999px"
            },
            keyframes: {
                slideIn: {
                    '0%': { opacity: '0', transform: 'translateY(-20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
            },
            animation: {
                slideIn: 'slideIn 0.3s ease-out',
            },
        },
    },
    plugins: [],
}
