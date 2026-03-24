export const hero = [
  `<svg viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hero1bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#FAFAFA" />
        <stop offset="100%" stop-color="#EAEAEA" />
      </linearGradient>
      <linearGradient id="hero1btn" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#000" />
        <stop offset="100%" stop-color="#333" />
      </linearGradient>
      <style>
        .hero1btn { transition: transform 0.3s; cursor: pointer; }
        .hero1btn:hover { transform: scale(1.05); }
        .fade-in { animation: fadeIn 1s ease-in; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
      </style>
    </defs>
    <rect width="1200" height="800" fill="url(#hero1bg)" />
    <g class="fade-in">
      <rect x="300" y="140" width="600" height="48" rx="24" fill="#222" />
      <rect x="400" y="210" width="400" height="16" rx="8" fill="#888" />
      <g class="hero1btn">
        <rect x="520" y="280" width="160" height="48" rx="24" fill="url(#hero1btn)" />
        <rect x="560" y="300" width="80" height="8" rx="4" fill="#FFF" opacity="0.8" />
      </g>
      <rect x="100" y="380" width="1000" height="360" rx="24" fill="#E2E8F0" stroke="#CBD5E1" stroke-width="2" />
    </g>
  </svg>`,
  `<svg viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="hero2grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#111" />
        <stop offset="100%" stop-color="#444" />
      </linearGradient>
      <style>
        .slide-right { animation: slideR 1s ease-out; }
        .scale-up { animation: scaleU 1.2s ease-out; }
        @keyframes slideR { from { opacity: 0; transform: translateX(-50px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes scaleU { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      </style>
    </defs>
    <rect width="1200" height="800" fill="#FFFFFF" />
    <g class="slide-right">
      <rect x="100" y="240" width="450" height="48" rx="24" fill="url(#hero2grad)" />
      <rect x="100" y="340" width="380" height="16" rx="8" fill="#E2E8F0" />
      <rect x="100" y="370" width="280" height="16" rx="8" fill="#E2E8F0" />
      <rect x="100" y="460" width="160" height="56" rx="12" fill="#000" />
      <rect x="140" y="484" width="80" height="8" rx="4" fill="#FFF" opacity="0.9" />
    </g>
    <g class="scale-up">
      <rect x="640" y="100" width="460" height="600" rx="32" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2" />
    </g>
  </svg>`,
  `<svg viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="800" fill="#0F0F0F" />
    <defs>
      <radialGradient id="hero4glow" cx="50%" cy="50%" r="50%">
        <stop offset="0%" stop-color="#333" />
        <stop offset="100%" stop-color="#0F0F0F" />
      </radialGradient>
      <style>
        .pulse { animation: pulseAnim 2s infinite; }
        .bounce { animation: bounceAnim 2s infinite; }
        @keyframes pulseAnim { 0% { transform: scale(1); opacity: 0.8; } 50% { transform: scale(1.05); opacity: 1; } 100% { transform: scale(1); opacity: 0.8; } }
        @keyframes bounceAnim { 0%, 20%, 50%, 80%, 100% { transform: translateY(0); } 40% { transform: translateY(-10px); } 60% { transform: translateY(-5px); } }
      </style>
    </defs>
    <rect x="200" y="100" width="800" height="600" fill="url(#hero4glow)" />
    <g class="pulse" transform-origin="600 350">
      <rect x="300" y="320" width="600" height="40" rx="20" fill="#FFF" />
    </g>
    <rect x="400" y="460" width="400" height="16" rx="8" fill="#333" />
    <g class="bounce" transform-origin="600 620">
      <circle cx="600" cy="620" r="40" fill="#333" />
      <path d="M600 595 L600 645 M585 630 L600 645 L615 630" stroke="#FFF" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    </g>
  </svg>`,
  `<svg viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="heroGlassBg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#1E293B" />
        <stop offset="100%" stop-color="#0F172A" />
      </linearGradient>
      <style>
        .float-obj { animation: floatAnim 4s ease-in-out infinite alternate; }
        @keyframes floatAnim { from { transform: translateY(0); } to { transform: translateY(-20px); } }
      </style>
    </defs>
    <rect width="1200" height="800" fill="url(#heroGlassBg)" />
    <g class="float-obj">
      <rect x="250" y="200" width="700" height="400" rx="40" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
      <rect x="350" y="280" width="500" height="48" rx="24" fill="#FFF" />
      <rect x="400" y="360" width="400" height="16" rx="8" fill="#EAEAEA" opacity="0.6" />
      <rect x="500" y="440" width="200" height="64" rx="32" fill="#3B82F6" />
    </g>
  </svg>`,
  `<svg viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="800" fill="#F8FAFC" />
    <rect x="100" y="190" width="380" height="56" rx="16" fill="#0F172A" />
    <rect x="100" y="270" width="340" height="56" rx="16" fill="#1E293B" opacity="0.8" />
    <rect x="100" y="370" width="460" height="16" rx="8" fill="#94A3B8" />
    <rect x="100" y="500" width="200" height="64" rx="12" fill="#3B82F6" />
    <rect x="550" y="150" width="600" height="440" rx="32" fill="#E2E8F0" />
  </svg>`
];

export const navbar: string[] = [];  // Deprecated - merged into header

export const feature = [
  `<svg viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="600" fill="#F9F9F9" />
    <rect x="400" y="80" width="400" height="40" rx="20" fill="#111" />
    <g transform="translate(100, 200)">
      <rect width="300" height="300" rx="24" fill="#FFF" stroke="#EEE" stroke-width="2" />
      <circle cx="60" cy="60" r="30" fill="#F0F0F0" />
      <rect x="30" y="220" width="200" height="20" rx="10" fill="#111" />
      <rect x="30" y="250" width="150" height="12" rx="6" fill="#888" />
    </g>
    <g transform="translate(450, 200)">
      <rect width="300" height="300" rx="24" fill="#FFF" stroke="#EEE" stroke-width="2" />
      <circle cx="60" cy="60" r="30" fill="#F0F0F0" />
      <rect x="30" y="220" width="200" height="20" rx="10" fill="#111" />
      <rect x="30" y="250" width="150" height="12" rx="6" fill="#888" />
    </g>
    <g transform="translate(800, 200)">
      <rect width="300" height="300" rx="24" fill="#FFF" stroke="#EEE" stroke-width="2" />
      <circle cx="60" cy="60" r="30" fill="#F0F0F0" />
      <rect x="30" y="220" width="200" height="20" rx="10" fill="#111" />
      <rect x="30" y="250" width="150" height="12" rx="6" fill="#888" />
    </g>
  </svg>`
];

export const pricing = [
  `<svg viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="pricingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F8FAFC" />
        <stop offset="100%" stop-color="#F1F5F9" />
      </linearGradient>
    </defs>
    <rect width="1200" height="800" fill="url(#pricingGrad)" />
    <rect x="400" y="80" width="400" height="40" rx="20" fill="#0F172A" />
    <g transform="translate(100, 200)">
      <rect width="300" height="450" rx="24" fill="#FFF" stroke="#E2E8F0" stroke-width="2" />
      <rect x="40" y="40" width="120" height="20" rx="10" fill="#CBD5E1" />
      <rect x="40" y="80" width="220" height="48" rx="12" fill="#E2E8F0" />
      <rect x="40" y="160" width="220" height="12" rx="6" fill="#F1F5F9" />
      <rect x="40" y="190" width="200" height="12" rx="6" fill="#F1F5F9" />
      <rect x="40" y="360" width="220" height="48" rx="24" fill="#CBD5E1" />
    </g>
    <g transform="translate(450, 180)">
      <rect width="300" height="490" rx="24" fill="#FFF" stroke="#3B82F6" stroke-width="3" />
      <rect x="40" y="40" width="120" height="20" rx="10" fill="#3B82F6" opacity="0.1" />
      <rect x="40" y="80" width="220" height="48" rx="12" fill="#3B82F6" />
      <rect x="40" y="160" width="220" height="12" rx="6" fill="#F1F5F9" />
      <rect x="40" y="400" width="220" height="48" rx="24" fill="#3B82F6" />
    </g>
    <g transform="translate(800, 200)">
      <rect width="300" height="450" rx="24" fill="#FFF" stroke="#E2E8F0" stroke-width="2" />
      <rect x="40" y="40" width="120" height="20" rx="10" fill="#CBD5E1" />
      <rect x="40" y="80" width="220" height="48" rx="12" fill="#E2E8F0" />
      <rect x="40" y="360" width="220" height="48" rx="24" fill="#CBD5E1" />
    </g>
  </svg>`
];

export const testimonial = [
  `<svg viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="600" fill="#F8FAFC" />
    <rect x="400" y="70" width="400" height="40" rx="20" fill="#CBD5E1" />
    <g transform="translate(100, 180)">
      <rect width="460" height="300" rx="24" fill="#FFF" stroke="#E2E8F0" stroke-width="2" />
      <rect x="40" y="60" width="380" height="12" rx="6" fill="#F1F5F9" />
      <rect x="40" y="90" width="340" height="12" rx="6" fill="#F1F5F9" />
      <circle cx="70" cy="230" r="30" fill="#E2E8F0" />
      <rect x="120" y="215" width="120" height="16" rx="8" fill="#CBD5E1" />
    </g>
    <g transform="translate(640, 180)">
      <rect width="460" height="300" rx="24" fill="#FFF" stroke="#E2E8F0" stroke-width="2" />
      <rect x="40" y="60" width="380" height="12" rx="6" fill="#F1F5F9" />
      <rect x="40" y="90" width="300" height="12" rx="6" fill="#F1F5F9" />
      <circle cx="70" cy="230" r="30" fill="#E2E8F0" />
      <rect x="120" y="215" width="120" height="16" rx="8" fill="#CBD5E1" />
    </g>
  </svg>`
];

// Footer section components
export const footer = [
  // Footer 1: Simple centered footer with logo, links, and social icons
  `<svg viewBox="0 0 1200 300" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="300" fill="#0F172A" />
    <rect x="550" y="40" width="100" height="32" rx="8" fill="#334155" />
    <rect x="350" y="100" width="80" height="12" rx="6" fill="#64748B" />
    <rect x="460" y="100" width="80" height="12" rx="6" fill="#64748B" />
    <rect x="570" y="100" width="80" height="12" rx="6" fill="#64748B" />
    <rect x="680" y="100" width="80" height="12" rx="6" fill="#64748B" />
    <circle cx="520" cy="180" r="20" fill="#334155" />
    <circle cx="580" cy="180" r="20" fill="#334155" />
    <circle cx="640" cy="180" r="20" fill="#334155" />
    <circle cx="700" cy="180" r="20" fill="#334155" />
    <rect x="400" y="250" width="400" height="10" rx="5" fill="#1E293B" />
  </svg>`,
  // Footer 2: Multi-column footer with newsletter
  `<svg viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="400" fill="#F8FAFC" />
    <rect width="1200" height="1" y="0" fill="#E2E8F0" />
    <g transform="translate(100, 60)">
      <rect width="80" height="32" rx="8" fill="#0F172A" />
      <rect y="60" width="200" height="12" rx="6" fill="#94A3B8" />
      <rect y="84" width="160" height="12" rx="6" fill="#94A3B8" />
    </g>
    <g transform="translate(400, 60)">
      <rect width="80" height="16" rx="8" fill="#0F172A" />
      <rect y="40" width="100" height="10" rx="5" fill="#CBD5E1" />
      <rect y="60" width="80" height="10" rx="5" fill="#CBD5E1" />
      <rect y="80" width="90" height="10" rx="5" fill="#CBD5E1" />
      <rect y="100" width="70" height="10" rx="5" fill="#CBD5E1" />
    </g>
    <g transform="translate(600, 60)">
      <rect width="80" height="16" rx="8" fill="#0F172A" />
      <rect y="40" width="100" height="10" rx="5" fill="#CBD5E1" />
      <rect y="60" width="80" height="10" rx="5" fill="#CBD5E1" />
      <rect y="80" width="90" height="10" rx="5" fill="#CBD5E1" />
    </g>
    <g transform="translate(850, 60)">
      <rect width="120" height="16" rx="8" fill="#0F172A" />
      <rect y="40" width="250" height="48" rx="8" fill="#FFF" stroke="#E2E8F0" stroke-width="2" />
      <rect x="170" y="48" width="70" height="32" rx="6" fill="#3B82F6" />
    </g>
    <rect x="100" y="340" width="1000" height="1" fill="#E2E8F0" />
    <rect x="100" y="360" width="200" height="10" rx="5" fill="#94A3B8" />
  </svg>`,
  // Footer 3: Dark footer with large logo and grid links
  `<svg viewBox="0 0 1200 350" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="350" fill="#111827" />
    <rect x="100" y="50" width="150" height="48" rx="12" fill="#1F2937" />
    <g transform="translate(100, 130)">
      <rect width="60" height="12" rx="6" fill="#6B7280" />
      <rect y="24" width="80" height="10" rx="5" fill="#4B5563" />
      <rect y="44" width="70" height="10" rx="5" fill="#4B5563" />
      <rect y="64" width="90" height="10" rx="5" fill="#4B5563" />
    </g>
    <g transform="translate(300, 130)">
      <rect width="60" height="12" rx="6" fill="#6B7280" />
      <rect y="24" width="80" height="10" rx="5" fill="#4B5563" />
      <rect y="44" width="70" height="10" rx="5" fill="#4B5563" />
      <rect y="64" width="90" height="10" rx="5" fill="#4B5563" />
    </g>
    <g transform="translate(500, 130)">
      <rect width="60" height="12" rx="6" fill="#6B7280" />
      <rect y="24" width="80" height="10" rx="5" fill="#4B5563" />
      <rect y="44" width="70" height="10" rx="5" fill="#4B5563" />
    </g>
    <g transform="translate(900, 50)">
      <circle r="18" cx="18" cy="18" fill="#374151" />
      <circle r="18" cx="60" cy="18" fill="#374151" />
      <circle r="18" cx="102" cy="18" fill="#374151" />
    </g>
    <rect x="100" y="290" width="1000" height="1" fill="#1F2937" />
    <rect x="100" y="310" width="300" height="10" rx="5" fill="#374151" />
    <rect x="800" y="310" width="300" height="10" rx="5" fill="#374151" />
  </svg>`
];

// CTA/Banner section components
export const ctaBanner = [
  // CTA 1: Centered CTA with gradient background
  `<svg viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ctaGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#3B82F6" />
        <stop offset="100%" stop-color="#8B5CF6" />
      </linearGradient>
    </defs>
    <rect width="1200" height="400" fill="url(#ctaGrad1)" />
    <rect x="350" y="100" width="500" height="48" rx="24" fill="#FFF" />
    <rect x="400" y="170" width="400" height="16" rx="8" fill="rgba(255,255,255,0.6)" />
    <rect x="450" y="200" width="300" height="12" rx="6" fill="rgba(255,255,255,0.4)" />
    <rect x="480" y="270" width="240" height="56" rx="28" fill="#FFF" />
    <rect x="540" y="294" width="120" height="8" rx="4" fill="#3B82F6" />
  </svg>`,
  // CTA 2: Split CTA with image placeholder
  `<svg viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="400" fill="#F8FAFC" />
    <rect x="100" y="100" width="400" height="40" rx="20" fill="#0F172A" />
    <rect x="100" y="160" width="350" height="16" rx="8" fill="#64748B" />
    <rect x="100" y="190" width="300" height="16" rx="8" fill="#94A3B8" />
    <rect x="100" y="270" width="180" height="56" rx="12" fill="#3B82F6" />
    <rect x="300" y="270" width="180" height="56" rx="12" fill="#FFF" stroke="#E2E8F0" stroke-width="2" />
    <rect x="650" y="50" width="450" height="300" rx="24" fill="#E2E8F0" />
  </svg>`,
  // CTA 3: Dark banner with decorative elements
  `<svg viewBox="0 0 1200 350" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="350" fill="#0F172A" />
    <circle cx="100" cy="50" r="200" fill="#1E293B" opacity="0.5" />
    <circle cx="1100" cy="300" r="150" fill="#1E293B" opacity="0.5" />
    <rect x="300" y="100" width="600" height="40" rx="20" fill="#FFF" />
    <rect x="350" y="160" width="500" height="14" rx="7" fill="#64748B" />
    <rect x="400" y="190" width="400" height="14" rx="7" fill="#475569" />
    <rect x="450" y="260" width="140" height="48" rx="24" fill="#3B82F6" />
    <rect x="610" y="260" width="140" height="48" rx="24" fill="transparent" stroke="#64748B" stroke-width="2" />
  </svg>`
];

// Blog/Article layout components
export const blogArticle = [
  // Blog 1: Featured post with grid
  `<svg viewBox="0 0 1200 700" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="700" fill="#FFF" />
    <rect x="100" y="50" width="200" height="32" rx="16" fill="#0F172A" />
    <rect x="100" y="120" width="600" height="350" rx="16" fill="#E2E8F0" />
    <rect x="100" y="490" width="400" height="24" rx="12" fill="#0F172A" />
    <rect x="100" y="530" width="500" height="12" rx="6" fill="#94A3B8" />
    <rect x="100" y="560" width="100" height="10" rx="5" fill="#CBD5E1" />
    <g transform="translate(750, 120)">
      <rect width="350" height="160" rx="12" fill="#F1F5F9" />
      <rect y="180" width="250" height="16" rx="8" fill="#334155" />
      <rect y="210" width="300" height="10" rx="5" fill="#94A3B8" />
    </g>
    <g transform="translate(750, 360)">
      <rect width="350" height="160" rx="12" fill="#F1F5F9" />
      <rect y="180" width="250" height="16" rx="8" fill="#334155" />
      <rect y="210" width="300" height="10" rx="5" fill="#94A3B8" />
    </g>
  </svg>`,
  // Blog 2: Card grid layout
  `<svg viewBox="0 0 1200 700" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="700" fill="#F8FAFC" />
    <rect x="400" y="50" width="400" height="40" rx="20" fill="#0F172A" />
    <rect x="450" y="100" width="300" height="14" rx="7" fill="#94A3B8" />
    <g transform="translate(100, 160)">
      <rect width="320" height="200" rx="16" fill="#E2E8F0" />
      <rect y="220" width="200" height="20" rx="10" fill="#1E293B" />
      <rect y="250" width="280" height="10" rx="5" fill="#94A3B8" />
      <rect y="270" width="240" height="10" rx="5" fill="#CBD5E1" />
      <rect y="310" width="80" height="10" rx="5" fill="#3B82F6" />
    </g>
    <g transform="translate(440, 160)">
      <rect width="320" height="200" rx="16" fill="#E2E8F0" />
      <rect y="220" width="200" height="20" rx="10" fill="#1E293B" />
      <rect y="250" width="280" height="10" rx="5" fill="#94A3B8" />
      <rect y="270" width="240" height="10" rx="5" fill="#CBD5E1" />
      <rect y="310" width="80" height="10" rx="5" fill="#3B82F6" />
    </g>
    <g transform="translate(780, 160)">
      <rect width="320" height="200" rx="16" fill="#E2E8F0" />
      <rect y="220" width="200" height="20" rx="10" fill="#1E293B" />
      <rect y="250" width="280" height="10" rx="5" fill="#94A3B8" />
      <rect y="270" width="240" height="10" rx="5" fill="#CBD5E1" />
      <rect y="310" width="80" height="10" rx="5" fill="#3B82F6" />
    </g>
  </svg>`,
  // Blog 3: List layout with sidebar
  `<svg viewBox="0 0 1200 700" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="700" fill="#FFF" />
    <g transform="translate(100, 80)">
      <rect width="200" height="120" rx="12" fill="#F1F5F9" />
      <rect x="220" y="10" width="300" height="20" rx="10" fill="#0F172A" />
      <rect x="220" y="45" width="400" height="10" rx="5" fill="#94A3B8" />
      <rect x="220" y="65" width="350" height="10" rx="5" fill="#CBD5E1" />
      <rect x="220" y="95" width="80" height="10" rx="5" fill="#64748B" />
    </g>
    <g transform="translate(100, 230)">
      <rect width="200" height="120" rx="12" fill="#F1F5F9" />
      <rect x="220" y="10" width="300" height="20" rx="10" fill="#0F172A" />
      <rect x="220" y="45" width="400" height="10" rx="5" fill="#94A3B8" />
      <rect x="220" y="65" width="350" height="10" rx="5" fill="#CBD5E1" />
      <rect x="220" y="95" width="80" height="10" rx="5" fill="#64748B" />
    </g>
    <g transform="translate(100, 380)">
      <rect width="200" height="120" rx="12" fill="#F1F5F9" />
      <rect x="220" y="10" width="300" height="20" rx="10" fill="#0F172A" />
      <rect x="220" y="45" width="400" height="10" rx="5" fill="#94A3B8" />
      <rect x="220" y="65" width="350" height="10" rx="5" fill="#CBD5E1" />
      <rect x="220" y="95" width="80" height="10" rx="5" fill="#64748B" />
    </g>
    <rect x="750" y="80" width="350" height="450" rx="16" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2" />
    <rect x="780" y="110" width="100" height="16" rx="8" fill="#0F172A" />
    <rect x="780" y="150" width="290" height="10" rx="5" fill="#CBD5E1" />
    <rect x="780" y="170" width="250" height="10" rx="5" fill="#CBD5E1" />
    <rect x="780" y="190" width="270" height="10" rx="5" fill="#CBD5E1" />
  </svg>`
];

// Contact/Form section components
export const contactForm = [
  // Contact 1: Split layout with form
  `<svg viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="600" fill="#F8FAFC" />
    <rect x="100" y="100" width="300" height="40" rx="20" fill="#0F172A" />
    <rect x="100" y="160" width="350" height="14" rx="7" fill="#64748B" />
    <rect x="100" y="190" width="300" height="14" rx="7" fill="#94A3B8" />
    <g transform="translate(100, 260)">
      <circle r="20" cx="20" cy="20" fill="#E2E8F0" />
      <rect x="60" y="10" width="200" height="12" rx="6" fill="#64748B" />
      <rect x="60" y="28" width="150" height="10" rx="5" fill="#94A3B8" />
    </g>
    <g transform="translate(100, 330)">
      <circle r="20" cx="20" cy="20" fill="#E2E8F0" />
      <rect x="60" y="10" width="200" height="12" rx="6" fill="#64748B" />
      <rect x="60" y="28" width="150" height="10" rx="5" fill="#94A3B8" />
    </g>
    <rect x="600" y="80" width="500" height="440" rx="24" fill="#FFF" stroke="#E2E8F0" stroke-width="2" />
    <rect x="650" y="130" width="100" height="12" rx="6" fill="#64748B" />
    <rect x="650" y="150" width="400" height="48" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
    <rect x="650" y="220" width="100" height="12" rx="6" fill="#64748B" />
    <rect x="650" y="240" width="400" height="48" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
    <rect x="650" y="310" width="100" height="12" rx="6" fill="#64748B" />
    <rect x="650" y="330" width="400" height="100" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1" />
    <rect x="650" y="460" width="400" height="48" rx="24" fill="#3B82F6" />
  </svg>`,
  // Contact 2: Centered form with map placeholder
  `<svg viewBox="0 0 1200 700" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="700" fill="#FFF" />
    <rect x="400" y="50" width="400" height="40" rx="20" fill="#0F172A" />
    <rect x="350" y="100" width="500" height="14" rx="7" fill="#94A3B8" />
    <rect x="200" y="160" width="800" height="300" rx="16" fill="#E2E8F0" />
    <rect x="300" y="500" width="250" height="48" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2" />
    <rect x="570" y="500" width="250" height="48" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2" />
    <rect x="300" y="570" width="520" height="80" rx="8" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="2" />
    <rect x="840" y="570" width="160" height="80" rx="8" fill="#3B82F6" />
  </svg>`,
  // Contact 3: Card-based contact options
  `<svg viewBox="0 0 1200 500" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="500" fill="#0F172A" />
    <rect x="400" y="50" width="400" height="40" rx="20" fill="#FFF" />
    <rect x="450" y="100" width="300" height="14" rx="7" fill="#64748B" />
    <g transform="translate(100, 170)">
      <rect width="300" height="250" rx="16" fill="#1E293B" />
      <circle cx="150" cy="70" r="35" fill="#334155" />
      <rect x="50" y="130" width="200" height="20" rx="10" fill="#FFF" />
      <rect x="60" y="165" width="180" height="10" rx="5" fill="#64748B" />
      <rect x="75" y="200" width="150" height="10" rx="5" fill="#475569" />
    </g>
    <g transform="translate(450, 170)">
      <rect width="300" height="250" rx="16" fill="#1E293B" />
      <circle cx="150" cy="70" r="35" fill="#334155" />
      <rect x="50" y="130" width="200" height="20" rx="10" fill="#FFF" />
      <rect x="60" y="165" width="180" height="10" rx="5" fill="#64748B" />
      <rect x="75" y="200" width="150" height="10" rx="5" fill="#475569" />
    </g>
    <g transform="translate(800, 170)">
      <rect width="300" height="250" rx="16" fill="#1E293B" />
      <circle cx="150" cy="70" r="35" fill="#334155" />
      <rect x="50" y="130" width="200" height="20" rx="10" fill="#FFF" />
      <rect x="60" y="165" width="180" height="10" rx="5" fill="#64748B" />
      <rect x="75" y="200" width="150" height="10" rx="5" fill="#475569" />
    </g>
  </svg>`
];

// Gallery/Portfolio components
export const galleryPortfolio = [
  // Gallery 1: Masonry-style grid
  `<svg viewBox="0 0 1200 700" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="700" fill="#FFF" />
    <rect x="400" y="40" width="400" height="40" rx="20" fill="#0F172A" />
    <rect x="100" y="120" width="320" height="250" rx="16" fill="#E2E8F0" />
    <rect x="100" y="390" width="320" height="180" rx="16" fill="#F1F5F9" />
    <rect x="440" y="120" width="320" height="180" rx="16" fill="#F1F5F9" />
    <rect x="440" y="320" width="320" height="250" rx="16" fill="#E2E8F0" />
    <rect x="780" y="120" width="320" height="220" rx="16" fill="#E2E8F0" />
    <rect x="780" y="360" width="320" height="210" rx="16" fill="#F1F5F9" />
  </svg>`,
  // Gallery 2: Full-width showcase with thumbnails
  `<svg viewBox="0 0 1200 700" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="700" fill="#0F172A" />
    <rect x="100" y="50" width="1000" height="450" rx="24" fill="#1E293B" />
    <rect x="150" y="100" width="900" height="350" rx="16" fill="#334155" />
    <g transform="translate(100, 540)">
      <rect width="150" height="100" rx="12" fill="#334155" stroke="#3B82F6" stroke-width="3" />
      <rect x="170" width="150" height="100" rx="12" fill="#1E293B" />
      <rect x="340" width="150" height="100" rx="12" fill="#1E293B" />
      <rect x="510" width="150" height="100" rx="12" fill="#1E293B" />
      <rect x="680" width="150" height="100" rx="12" fill="#1E293B" />
      <rect x="850" width="150" height="100" rx="12" fill="#1E293B" />
    </g>
  </svg>`
];

export const ecommerce = [
  `<svg viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="800" fill="#FFF" />
    <rect x="100" y="100" width="500" height="500" rx="24" fill="#F1F5F9" />
    <rect x="680" y="120" width="350" height="48" rx="24" fill="#0F172A" />
    <rect x="680" y="210" width="160" height="32" rx="16" fill="#1E293B" />
    <rect x="680" y="400" width="400" height="64" rx="12" fill="#3B82F6" />
  </svg>`,
  // Updated Product Layout 2 with strictly soft skeletons
  `<svg viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="ecom2bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#F8FAFC" />
        <stop offset="100%" stop-color="#E2E8F0" />
      </linearGradient>
      <style>
        .spin-3d { animation: float3d 6s ease-in-out infinite alternate; transform-origin: 750px 400px; cursor: pointer; }
        @keyframes float3d { from { transform: translateY(0) rotate(-2deg); } to { transform: translateY(-20px) rotate(2deg); } }
      </style>
    </defs>
    <rect width="1200" height="800" fill="url(#ecom2bg)" />
    <rect x="100" y="100" width="300" height="48" rx="24" fill="#CBD5E1" />
    <rect x="100" y="160" width="220" height="32" rx="16" fill="#E2E8F0" />
    <rect x="100" y="240" width="350" height="12" rx="6" fill="#F1F5F9" />
    <rect x="100" y="270" width="300" height="12" rx="6" fill="#F1F5F9" />
    <rect x="100" y="380" width="120" height="12" rx="6" fill="#CBD5E1" />
    <g transform="translate(100, 410)">
      <rect width="64" height="64" rx="16" fill="#FFF" stroke="#CBD5E1" stroke-width="2" />
      <rect x="12" y="12" width="40" height="40" rx="8" fill="#F1F5F9" />
    </g>
    <rect x="100" y="550" width="280" height="72" rx="36" fill="#3B82F6" />
    <rect x="160" y="578" width="160" height="16" rx="8" fill="#FFF" opacity="0.9" />
    <g class="spin-3d">
      <rect x="400" y="120" width="700" height="480" fill="#FFFFFF" stroke="#F1F5F9" stroke-width="10" rx="40" filter="drop-shadow(0 40px 60px rgba(0,0,0,0.08))" />
      <rect x="480" y="200" width="540" height="320" rx="20" fill="#F8FAFC" />
    </g>
  </svg>`,
  `<svg viewBox="0 0 1200 800" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="800" fill="#F8FAFC" />
    <rect width="600" height="800" fill="#F1F5F9" />
    <rect x="180" y="100" width="360" height="600" rx="24" fill="#FFF" />
    <rect x="680" y="110" width="300" height="32" rx="16" fill="#111" />
    <rect x="680" y="160" width="160" height="24" rx="12" fill="#3B82F6" />
    <rect x="680" y="250" width="400" height="12" rx="6" fill="#E2E8F0" />
  </svg>`
];

// Header section components - All skeleton style (rectangles only, no text)
export const header = [
  // Header 1: Minimal - Logo + nav links + CTA button
  `<svg viewBox="0 0 1200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="80" fill="#FFFFFF"/>
    <!-- Logo -->
    <rect x="50" y="20" width="40" height="40" rx="8" fill="#0F172A"/>
    <!-- Brand name -->
    <rect x="100" y="30" width="70" height="20" rx="10" fill="#0F172A"/>
    <!-- Nav links -->
    <rect x="400" y="32" width="45" height="16" rx="8" fill="#94A3B8"/>
    <rect x="465" y="32" width="50" height="16" rx="8" fill="#94A3B8"/>
    <rect x="535" y="32" width="60" height="16" rx="8" fill="#94A3B8"/>
    <rect x="615" y="32" width="55" height="16" rx="8" fill="#94A3B8"/>
    <!-- CTA Button -->
    <rect x="1020" y="22" width="130" height="36" rx="18" fill="#0F172A"/>
    <rect x="1050" y="36" width="70" height="8" rx="4" fill="#FFFFFF"/>
  </svg>`,
  // Header 2: Floating - Contained in rounded pill container
  `<svg viewBox="0 0 1200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="100" fill="#F8FAFC"/>
    <!-- Floating container -->
    <rect x="100" y="20" width="1000" height="60" rx="30" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
    <!-- Logo -->
    <rect x="130" y="34" width="32" height="32" rx="8" fill="#3B82F6"/>
    <!-- Brand name -->
    <rect x="175" y="42" width="60" height="16" rx="8" fill="#0F172A"/>
    <!-- Nav links -->
    <rect x="420" y="42" width="45" height="16" rx="8" fill="#94A3B8"/>
    <rect x="485" y="42" width="60" height="16" rx="8" fill="#94A3B8"/>
    <rect x="565" y="42" width="50" height="16" rx="8" fill="#94A3B8"/>
    <rect x="635" y="42" width="40" height="16" rx="8" fill="#94A3B8"/>
    <!-- CTA Button -->
    <rect x="970" y="30" width="110" height="40" rx="20" fill="#3B82F6"/>
    <rect x="1000" y="45" width="50" height="10" rx="5" fill="#FFFFFF"/>
  </svg>`,
  // Header 3: Center Logo - Nav links on both sides of centered logo
  `<svg viewBox="0 0 1200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="80" fill="#FFFFFF"/>
    <!-- Left nav links -->
    <rect x="100" y="32" width="45" height="16" rx="8" fill="#94A3B8"/>
    <rect x="165" y="32" width="50" height="16" rx="8" fill="#94A3B8"/>
    <rect x="235" y="32" width="60" height="16" rx="8" fill="#94A3B8"/>
    <!-- Center logo -->
    <circle cx="600" cy="40" r="28" fill="#0F172A"/>
    <!-- Right nav links -->
    <rect x="860" y="32" width="60" height="16" rx="8" fill="#94A3B8"/>
    <rect x="940" y="32" width="40" height="16" rx="8" fill="#94A3B8"/>
    <rect x="1000" y="32" width="55" height="16" rx="8" fill="#94A3B8"/>
  </svg>`,
  // Header 4: Glass - Translucent/blur background style
  `<svg viewBox="0 0 1200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="80" fill="#FFFFFF" fill-opacity="0.85"/>
    <rect width="1200" height="80" fill="none" stroke="#E2E8F0" stroke-width="1"/>
    <!-- Logo -->
    <rect x="50" y="20" width="40" height="40" rx="10" fill="#0F172A"/>
    <!-- Brand name -->
    <rect x="100" y="30" width="55" height="20" rx="10" fill="#0F172A"/>
    <!-- Nav links -->
    <rect x="400" y="32" width="45" height="16" rx="8" fill="#64748B"/>
    <rect x="465" y="32" width="60" height="16" rx="8" fill="#64748B"/>
    <rect x="545" y="32" width="50" height="16" rx="8" fill="#64748B"/>
    <!-- CTA Button -->
    <rect x="1010" y="22" width="140" height="36" rx="18" fill="#3B82F6"/>
    <rect x="1045" y="36" width="70" height="8" rx="4" fill="#FFFFFF"/>
  </svg>`,
  // Header 5: Dark - Dark theme variant
  `<svg viewBox="0 0 1200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="80" fill="#0F172A"/>
    <!-- Logo -->
    <rect x="50" y="20" width="40" height="40" rx="8" fill="#3B82F6"/>
    <!-- Brand name -->
    <rect x="100" y="30" width="65" height="20" rx="10" fill="#F8FAFC"/>
    <!-- Nav links -->
    <rect x="380" y="32" width="45" height="16" rx="8" fill="#64748B"/>
    <rect x="445" y="32" width="60" height="16" rx="8" fill="#64748B"/>
    <rect x="525" y="32" width="50" height="16" rx="8" fill="#F8FAFC"/>
    <rect x="595" y="32" width="40" height="16" rx="8" fill="#64748B"/>
    <!-- CTA Button -->
    <rect x="1020" y="22" width="130" height="36" rx="18" fill="#FFFFFF"/>
    <rect x="1050" y="36" width="70" height="8" rx="4" fill="#0F172A"/>
  </svg>`,
  // Header 6: Underline - Active state with underline indicator
  `<svg viewBox="0 0 1200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="80" fill="#FFFFFF"/>
    <rect width="1200" height="1" y="79" fill="#E2E8F0"/>
    <!-- Logo -->
    <rect x="50" y="20" width="40" height="40" rx="8" fill="#0F172A"/>
    <!-- Brand name -->
    <rect x="100" y="30" width="60" height="20" rx="10" fill="#0F172A"/>
    <!-- Nav links -->
    <rect x="400" y="26" width="45" height="16" rx="8" fill="#94A3B8"/>
    <!-- Active link with underline -->
    <rect x="470" y="26" width="50" height="16" rx="8" fill="#0F172A"/>
    <rect x="470" y="54" width="50" height="3" rx="1.5" fill="#3B82F6"/>
    <rect x="545" y="26" width="60" height="16" rx="8" fill="#94A3B8"/>
    <rect x="625" y="26" width="55" height="16" rx="8" fill="#94A3B8"/>
    <!-- CTA Button -->
    <rect x="1020" y="22" width="130" height="36" rx="18" fill="#0F172A"/>
    <rect x="1050" y="36" width="70" height="8" rx="4" fill="#FFFFFF"/>
  </svg>`,
  // Header 7: Boxed - Bordered container style
  `<svg viewBox="0 0 1200 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="100" fill="#F8FAFC"/>
    <!-- Boxed container -->
    <rect x="50" y="15" width="1100" height="70" rx="12" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="2"/>
    <!-- Logo -->
    <rect x="80" y="30" width="40" height="40" rx="8" fill="#0F172A"/>
    <!-- Brand name -->
    <rect x="135" y="42" width="55" height="16" rx="8" fill="#0F172A"/>
    <!-- Nav links -->
    <rect x="370" y="42" width="45" height="16" rx="8" fill="#94A3B8"/>
    <rect x="435" y="42" width="60" height="16" rx="8" fill="#94A3B8"/>
    <rect x="515" y="42" width="50" height="16" rx="8" fill="#94A3B8"/>
    <rect x="585" y="42" width="55" height="16" rx="8" fill="#94A3B8"/>
    <!-- CTA Button -->
    <rect x="1000" y="32" width="120" height="36" rx="8" fill="#0F172A"/>
    <rect x="1030" y="46" width="60" height="8" rx="4" fill="#FFFFFF"/>
  </svg>`,
  // Header 8: Gradient - Gradient accent border/element
  `<svg viewBox="0 0 1200 84" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="headerGrad8" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#3B82F6"/>
        <stop offset="100%" stop-color="#8B5CF6"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="80" fill="#FFFFFF"/>
    <rect width="1200" height="4" y="80" fill="url(#headerGrad8)"/>
    <!-- Logo -->
    <rect x="50" y="20" width="40" height="40" rx="8" fill="#0F172A"/>
    <!-- Brand name -->
    <rect x="100" y="30" width="70" height="20" rx="10" fill="#0F172A"/>
    <!-- Nav links -->
    <rect x="400" y="32" width="45" height="16" rx="8" fill="#94A3B8"/>
    <rect x="465" y="32" width="60" height="16" rx="8" fill="#94A3B8"/>
    <rect x="545" y="32" width="50" height="16" rx="8" fill="#94A3B8"/>
    <rect x="615" y="32" width="40" height="16" rx="8" fill="#94A3B8"/>
    <!-- CTA Button with gradient -->
    <rect x="1010" y="22" width="140" height="36" rx="18" fill="url(#headerGrad8)"/>
    <rect x="1045" y="36" width="70" height="8" rx="4" fill="#FFFFFF"/>
  </svg>`,
  // Header 9: Sidebar - Vertical sidebar navigation layout
  `<svg viewBox="0 0 280 600" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="280" height="600" fill="#0F172A"/>
    <!-- Logo and brand -->
    <rect x="30" y="30" width="40" height="40" rx="10" fill="#3B82F6"/>
    <rect x="85" y="42" width="70" height="16" rx="8" fill="#F8FAFC"/>
    <!-- Nav items -->
    <rect x="20" y="110" width="240" height="44" rx="8" fill="#1E293B"/>
    <rect x="40" y="125" width="80" height="14" rx="7" fill="#F8FAFC"/>
    <rect x="20" y="164" width="240" height="44" rx="8" fill="transparent"/>
    <rect x="40" y="179" width="70" height="14" rx="7" fill="#64748B"/>
    <rect x="20" y="218" width="240" height="44" rx="8" fill="transparent"/>
    <rect x="40" y="233" width="60" height="14" rx="7" fill="#64748B"/>
    <rect x="20" y="272" width="240" height="44" rx="8" fill="transparent"/>
    <rect x="40" y="287" width="50" height="14" rx="7" fill="#64748B"/>
    <rect x="20" y="326" width="240" height="44" rx="8" fill="transparent"/>
    <rect x="40" y="341" width="65" height="14" rx="7" fill="#64748B"/>
    <!-- Logout -->
    <rect x="20" y="520" width="240" height="44" rx="8" fill="#1E293B"/>
    <rect x="40" y="535" width="55" height="14" rx="7" fill="#64748B"/>
  </svg>`,
  // Header 10: Center CTA - Prominent centered call-to-action
  `<svg viewBox="0 0 1200 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="80" fill="#FFFFFF"/>
    <!-- Logo -->
    <rect x="50" y="20" width="40" height="40" rx="8" fill="#0F172A"/>
    <!-- Brand name -->
    <rect x="100" y="30" width="60" height="20" rx="10" fill="#0F172A"/>
    <!-- Left nav links -->
    <rect x="260" y="32" width="45" height="16" rx="8" fill="#94A3B8"/>
    <rect x="325" y="32" width="50" height="16" rx="8" fill="#94A3B8"/>
    <!-- Center CTA Button -->
    <rect x="500" y="16" width="200" height="48" rx="24" fill="#3B82F6"/>
    <rect x="545" y="35" width="110" height="10" rx="5" fill="#FFFFFF"/>
    <!-- Right nav links -->
    <rect x="780" y="32" width="50" height="16" rx="8" fill="#94A3B8"/>
    <rect x="850" y="32" width="40" height="16" rx="8" fill="#94A3B8"/>
    <!-- Icon placeholders -->
    <circle cx="1060" cy="40" r="20" fill="#E2E8F0"/>
    <circle cx="1110" cy="40" r="20" fill="#E2E8F0"/>
  </svg>`,
  // Header 11: Thin - Compact/minimal height variant
  `<svg viewBox="0 0 1200 50" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="1200" height="50" fill="#FFFFFF"/>
    <rect width="1200" height="1" y="49" fill="#E2E8F0"/>
    <!-- Logo -->
    <rect x="50" y="10" width="30" height="30" rx="6" fill="#0F172A"/>
    <!-- Brand name -->
    <rect x="90" y="17" width="45" height="16" rx="8" fill="#0F172A"/>
    <!-- Nav links -->
    <rect x="360" y="17" width="40" height="16" rx="8" fill="#94A3B8"/>
    <rect x="420" y="17" width="45" height="16" rx="8" fill="#94A3B8"/>
    <rect x="485" y="17" width="55" height="16" rx="8" fill="#94A3B8"/>
    <rect x="560" y="17" width="50" height="16" rx="8" fill="#94A3B8"/>
    <!-- CTA Button -->
    <rect x="1040" y="10" width="110" height="30" rx="15" fill="#0F172A"/>
    <rect x="1065" y="20" width="60" height="10" rx="5" fill="#FFFFFF"/>
  </svg>`,
  // Header 12: Floating Gradient CTA - Skeleton style
  `<svg viewBox="0 0 1200 120" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="headerGrad12" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#6366F1"/>
        <stop offset="100%" stop-color="#06B6D4"/>
      </linearGradient>
    </defs>
    <!-- Light gray background -->
    <rect width="1200" height="120" fill="#F5F7FB"/>
    <!-- White floating container -->
    <rect x="100" y="20" width="1000" height="80" rx="14" fill="white"/>
    <!-- Logo placeholder -->
    <rect x="140" y="45" width="60" height="30" rx="6" fill="#111"/>
    <!-- Nav link placeholders -->
    <rect x="420" y="52" width="50" height="16" rx="8" fill="#94A3B8"/>
    <rect x="490" y="52" width="60" height="16" rx="8" fill="#94A3B8"/>
    <rect x="570" y="52" width="50" height="16" rx="8" fill="#94A3B8"/>
    <rect x="640" y="52" width="40" height="16" rx="8" fill="#94A3B8"/>
    <rect x="700" y="52" width="55" height="16" rx="8" fill="#94A3B8"/>
    <!-- Gradient CTA Button -->
    <rect x="920" y="40" width="140" height="40" rx="10" fill="url(#headerGrad12)"/>
    <rect x="950" y="55" width="80" height="10" rx="5" fill="white" opacity="0.9"/>
  </svg>`
];
