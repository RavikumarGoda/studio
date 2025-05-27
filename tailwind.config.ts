
import type { Config } from "tailwindcss";

export default {
    darkMode: ["class"], // Ensure 'class' strategy is used
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: { height: '0' },
  				to: { height: 'var(--radix-accordion-content-height)' }
  			},
  			'accordion-up': {
  				from: { height: 'var(--radix-accordion-content-height)' },
  				to: { height: '0' }
  			},
        'electric-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px 0px hsla(var(--primary-hsl), 0.7), 0 0 10px 0px hsla(var(--primary-hsl), 0.5)' },
          '50%': { boxShadow: '0 0 15px 5px hsla(var(--primary-hsl), 0.9), 0 0 25px 5px hsla(var(--primary-hsl), 0.7)' },
        },
        'electric-flicker': {
          '0%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 2px hsl(var(--primary-hsl)))' },
          '25%': { opacity: '0.8', filter: 'drop-shadow(0 0 4px hsl(var(--primary-hsl)))' },
          '50%': { opacity: '1', filter: 'drop-shadow(0 0 2px hsl(var(--primary-hsl)))' },
          '75%': { opacity: '0.7', filter: 'drop-shadow(0 0 5px hsl(var(--primary-hsl)))' },
        },
        'border-flash-anim': {
          '0%': { borderColor: 'hsla(var(--primary-hsl), 0.5)' },
          '50%': { borderColor: 'hsla(var(--accent-hsl), 0.8)' },
          '100%': { borderColor: 'hsla(var(--primary-hsl), 0.5)' },
        },
        'text-glow-anim': {
          '0%, 100%': { textShadow: '0 0 5px hsla(var(--foreground-hsl), 0.7), 0 0 8px hsla(var(--primary-hsl), 0.3)' },
          '50%': { textShadow: '0 0 10px hsla(var(--foreground-hsl), 0.9), 0 0 15px hsla(var(--primary-hsl), 0.5)' },
        },
        'tab-trail': {
          from: { left: '-100%', width: '0%', opacity: '0' },
          to: { left: '0', width: '100%', opacity: '1' },
        }
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
        'electric-pulse': 'electric-pulse 2s infinite ease-in-out',
        'electric-flicker': 'electric-flicker 0.5s infinite alternate',
        'border-flash': 'border-flash-anim 0.3s linear',
        'text-glow': 'text-glow-anim 1.5s infinite alternate',
        'tab-trail-anim': 'tab-trail 0.5s ease-out forwards',
  		},
      textShadow: { // Custom text shadow utility
        'glow-primary-sm': '0 0 4px hsla(var(--primary-hsl), 0.6)',
        'glow-primary-md': '0 0 8px hsla(var(--primary-hsl), 0.7)',
        'glow-accent-sm': '0 0 4px hsla(var(--accent-hsl), 0.6)',
        'glow-accent-md': '0 0 8px hsla(var(--accent-hsl), 0.7)',
        'glow-light': '0 0 6px hsla(var(--foreground-hsl), 0.5)',
      },
      boxShadow: { // Custom box shadow for "lit" effects or deeper glass
        'glass-edge': 'inset 0 0 0 1px hsla(var(--border-hsl), 0.3), 0 1px 3px hsla(0,0%,0%,0.2)',
        'electric-glow-sm': '0 0 8px 2px hsla(var(--primary-hsl), 0.5)',
        'electric-glow-md': '0 0 15px 4px hsla(var(--primary-hsl), 0.6)',
      }
  	}
  },
  plugins: [
    require("tailwindcss-animate"),
    function ({ addUtilities }: { addUtilities: any }) {
      addUtilities({
        '.backdrop-blur-sm': {
          'backdrop-filter': 'blur(4px)',
        },
        '.backdrop-blur-md': {
          'backdrop-filter': 'blur(8px)',
        },
        '.backdrop-blur-lg': {
          'backdrop-filter': 'blur(12px)',
        },
         '.text-shadow-glow-primary': {
          textShadow: '0 0 6px hsla(var(--primary-hsl), 0.7), 0 0 12px hsla(var(--primary-hsl), 0.4)',
        },
        '.text-shadow-glow-accent': {
          textShadow: '0 0 6px hsla(var(--accent-hsl), 0.7), 0 0 12px hsla(var(--accent-hsl), 0.4)',
        },
        '.text-shadow-glow-light': {
          textShadow: '0 0 8px hsla(var(--foreground-hsl), 0.6)',
        }
      });
    },
  ],
} satisfies Config;

    