/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#f0f4ff",
          100: "#e0e9fe",
          200: "#c1d3fe",
          300: "#a2bdfd",
          400: "#83a7fc",
          500: "#6491fb",
          600: "#457bfa",
          700: "#2665f9",
          800: "#074ff8",
          900: "#033ec7"
        },
        premium: {
          DEFAULT: "#0f172a",
          light: "#1e293b",
          dark: "#020617",
          gold: "#fbbf24",
          silver: "#94a3b8",
          emerald: "#10b981",
          royal: "#4338ca"
        },
        accent: {
          gold: "#f59e0b",
          royal: "#3730a3",
          emerald: "#059669",
          rose: "#e11d48"
        },
        surface: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          800: "#1e293b",
          900: "#0f172a"
        }
      },
      fontFamily: {
        display: ["Outfit", "Inter", "sans-serif"],
        body: ["Inter", "sans-serif"]
      },
      boxShadow: {
        premium: "0 20px 50px rgba(0, 0, 0, 0.1)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.07)"
      },
      backgroundImage: {
        "gradient-premium": "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        "gradient-glass": "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))"
      }
    },
  },
  plugins: [],
};

