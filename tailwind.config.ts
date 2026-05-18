import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono: ["Geist Mono", "DM Mono", "ui-monospace", "monospace"],
        display: ["Instrument Serif", "Inter", "system-ui", "serif"],
        serif: ["Instrument Serif", "Georgia", "serif"],
      },
      colors: {
        border: "hsl(var(--border))",
        "border-strong": "hsl(var(--border-strong))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        // STOS colors
        bg0: "hsl(var(--bg0))",
        bg1: "hsl(var(--bg1))",
        bg2: "hsl(var(--bg2))",
        bg3: "hsl(var(--bg3))",
        bg4: "hsl(var(--bg4))",
        bg5: "hsl(var(--bg5))",
        teal: {
          DEFAULT: "hsl(var(--teal))",
          muted: "hsl(var(--teal-muted))",
          subtle: "hsl(var(--teal-subtle))",
        },
        amber: {
          DEFAULT: "hsl(var(--amber))",
          muted: "hsl(var(--amber-muted))",
          subtle: "hsl(var(--amber-subtle))",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          muted: "hsl(var(--danger-muted))",
          subtle: "hsl(var(--danger-subtle))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          muted: "hsl(var(--info-muted))",
          subtle: "hsl(var(--info-subtle))",
        },
        purple: {
          DEFAULT: "hsl(var(--purple))",
          muted: "hsl(var(--purple-muted))",
        },
        green: {
          DEFAULT: "hsl(var(--green))",
          muted: "hsl(var(--green-muted))",
        },
        t1: "hsl(var(--t1))",
        t2: "hsl(var(--t2))",
        t3: "hsl(var(--t3))",
        t4: "hsl(var(--t4))",
        "border-accent": "hsl(var(--border-accent))",
        // OTRN status palette
        status: {
          active:    "hsl(var(--status-active))",
          "active-bg":   "hsl(var(--status-active-bg))",
          idle:      "hsl(var(--status-idle))",
          "idle-bg":     "hsl(var(--status-idle-bg))",
          warning:   "hsl(var(--status-warning))",
          "warning-bg":  "hsl(var(--status-warning-bg))",
          missing:   "hsl(var(--status-missing))",
          "missing-bg":  "hsl(var(--status-missing-bg))",
          resigned:  "hsl(var(--status-resigned))",
          "resigned-bg": "hsl(var(--status-resigned-bg))",
        },
        chart: {
          1: "hsl(var(--chart-1))",
          2: "hsl(var(--chart-2))",
          3: "hsl(var(--chart-3))",
          4: "hsl(var(--chart-4))",
          5: "hsl(var(--chart-5))",
          6: "hsl(var(--chart-6))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.97)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-in-right": {
          "0%": { opacity: "0", transform: "translateX(12px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        "bar-grow": {
          "0%": { transform: "scaleY(0)" },
          "100%": { transform: "scaleY(1)" },
        },
        "progress-fill": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.35s ease-out both",
        "fade-in": "fade-in 0.3s ease-out both",
        "scale-in": "scale-in 0.25s ease-out both",
        "slide-in-right": "slide-in-right 0.3s ease-out both",
        "bar-grow": "bar-grow 0.5s ease-out both",
        "progress-fill": "progress-fill 0.6s ease-out both",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
