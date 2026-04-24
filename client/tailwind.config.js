/** @type {import('tailwindcss').Config} */
export default {
    content: ["./index.html", "./src/**/*.{js,jsx}"],
    theme: {
      extend: {
        colors: {
          obsidian: "#06080B",
          ink: "#0A0F14",
          panel: "#0D131A",
          panel2: "#101822",
          glass: "rgba(255,255,255,0.04)",
          cyan: {
            300: "#6BE8FF",
            400: "#38DDF8",
            500: "#00C8F0",
            600: "#00A7CC"
          }
        },
        boxShadow: {
          glow: "0 0 0 1px rgba(255,255,255,0.04), 0 10px 30px rgba(0,0,0,0.35)",
          "glow-cyan": "0 0 0 1px rgba(56,221,248,0.18), 0 0 28px rgba(0,200,240,0.12), 0 18px 40px rgba(0,0,0,0.45)",
          "inner-glass": "inset 0 1px 0 rgba(255,255,255,0.06)"
        },
        backdropBlur: {
          xs: "2px"
        },
        backgroundImage: {
          "radial-cyan": "radial-gradient(circle at top, rgba(0,200,240,0.12), transparent 35%)",
          "hero-grid":
            "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)"
        },
        animation: {
          "pulse-soft": "pulseSoft 2.2s ease-in-out infinite",
          "float-soft": "floatSoft 5s ease-in-out infinite",
          shimmer: "shimmer 2.4s linear infinite"
        },
        keyframes: {
          pulseSoft: {
            "0%, 100%": { opacity: "0.45" },
            "50%": { opacity: "1" }
          },
          floatSoft: {
            "0%, 100%": { transform: "translateY(0px)" },
            "50%": { transform: "translateY(-6px)" }
          },
          shimmer: {
            "0%": { backgroundPosition: "-200% 0" },
            "100%": { backgroundPosition: "200% 0" }
          }
        }
      }
    },
    plugins: []
  };