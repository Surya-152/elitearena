/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ea: {
          // Core blacks
          void:    '#02020a',
          abyss:   '#060612',
          deep:    '#0c0c1e',
          card:    '#10101f',
          surface: '#161628',
          border:  '#1e1e3a',
          rim:     '#2a2a4a',
          // Text
          text:    '#ccd0f0',
          muted:   '#5a5a8a',
          dim:     '#3a3a5a',
          // Neon accents
          cyan:    '#00f5ff',
          cyanD:   '#00c4cc',
          magenta: '#ff0080',
          magentaD:'#cc0066',
          green:   '#00ff88',
          greenD:  '#00cc6a',
          gold:    '#ffb800',
          goldD:   '#cc9200',
          orange:  '#ff6b00',
          purple:  '#8b5cf6',
          // Gradients
          'grad-1': '#00f5ff',
          'grad-2': '#7b2fff',
          'grad-3': '#ff0080',
        }
      },
      fontFamily: {
        display: ['"Rajdhani"', 'sans-serif'],
        body:    ['"Outfit"', 'sans-serif'],
        mono:    ['"Share Tech Mono"', 'monospace'],
      },
      backgroundImage: {
        // Gradient presets
        'neon-cyan':    'linear-gradient(135deg, #00f5ff, #0080ff)',
        'neon-magenta': 'linear-gradient(135deg, #ff0080, #8b2fff)',
        'neon-gold':    'linear-gradient(135deg, #ffb800, #ff6b00)',
        'neon-green':   'linear-gradient(135deg, #00ff88, #00c8ff)',
        'hero-grad':    'linear-gradient(135deg, #02020a 0%, #0c0c2a 50%, #02020a 100%)',
        'card-grad':    'linear-gradient(145deg, #10101f, #0c0c1e)',
        'cyber-grid':   "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%231e1e3a' stroke-width='0.5'%3E%3Cpath d='M0 0h60v60H0z'/%3E%3C/g%3E%3C/svg%3E\")",
        'hex-pattern':  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Crect x='27' width='2' height='100' fill='%231e1e3a' opacity='0.5'/%3E%3Crect y='49' width='56' height='2' fill='%231e1e3a' opacity='0.5'/%3E%3C/svg%3E\")",
      },
      boxShadow: {
        'cyan':     '0 0 15px rgba(0,245,255,0.4), 0 0 40px rgba(0,245,255,0.15)',
        'cyan-lg':  '0 0 30px rgba(0,245,255,0.5), 0 0 80px rgba(0,245,255,0.2)',
        'magenta':  '0 0 15px rgba(255,0,128,0.4), 0 0 40px rgba(255,0,128,0.15)',
        'magenta-lg':'0 0 30px rgba(255,0,128,0.5), 0 0 80px rgba(255,0,128,0.2)',
        'gold':     '0 0 15px rgba(255,184,0,0.4), 0 0 40px rgba(255,184,0,0.15)',
        'green':    '0 0 15px rgba(0,255,136,0.4), 0 0 40px rgba(0,255,136,0.15)',
        'card':     '0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,245,255,0.05)',
        'card-hover':'0 16px 48px rgba(0,0,0,0.7), 0 4px 16px rgba(0,245,255,0.1)',
        'inset-cyan':'inset 0 1px 0 rgba(0,245,255,0.15)',
      },
      animation: {
        'slide-up':     'slideUp 0.45s cubic-bezier(0.16,1,0.3,1)',
        'slide-down':   'slideDown 0.3s ease-out',
        'fade-in':      'fadeIn 0.35s ease-out',
        'fade-up':      'fadeUp 0.5s cubic-bezier(0.16,1,0.3,1)',
        'glow-pulse':   'glowPulse 2.5s ease-in-out infinite',
        'border-spin':  'borderSpin 4s linear infinite',
        'float':        'float 3s ease-in-out infinite',
        'scan':         'scan 2s linear infinite',
        'shimmer':      'shimmer 2s infinite',
        'number-up':    'numberUp 0.6s cubic-bezier(0.16,1,0.3,1)',
      },
      keyframes: {
        slideUp:     { from: { opacity:'0', transform:'translateY(24px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        slideDown:   { from: { opacity:'0', transform:'translateY(-10px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        fadeIn:      { from: { opacity:'0' }, to: { opacity:'1' } },
        fadeUp:      { from: { opacity:'0', transform:'translateY(32px) scale(0.98)' }, to: { opacity:'1', transform:'translateY(0) scale(1)' } },
        glowPulse:   { '0%,100%': { opacity:'1' }, '50%': { opacity:'0.6' } },
        float:       { '0%,100%': { transform:'translateY(0)' }, '50%': { transform:'translateY(-8px)' } },
        scan:        { '0%': { transform:'translateY(-100%)' }, '100%': { transform:'translateY(100vh)' } },
        shimmer:     { '0%': { backgroundPosition:'-200% 0' }, '100%': { backgroundPosition:'200% 0' } },
        numberUp:    { from: { opacity:'0', transform:'translateY(10px)' }, to: { opacity:'1', transform:'translateY(0)' } },
        borderSpin:  { '0%': { backgroundPosition:'0% 50%' }, '50%': { backgroundPosition:'100% 50%' }, '100%': { backgroundPosition:'0% 50%' } },
      },
      transitionTimingFunction: {
        'spring': 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
}
