// Generates 1200x630 OG share cards (SVG + PNG) for Twomiah pages.
// Run: node scripts/generate-og-images.js
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'og');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const ROOT = path.join(__dirname, '..');

const products = [
  {
    slug: 'default',
    bg: '#0D0D0D',
    glow: '#FF3D00',
    stopA: '#FFAB00', stopB: '#FF6D00', stopC: '#FF3D00',
    eyebrow: 'SOFTWARE BUILT DIFFERENT',
    title: 'TWOMIAH',
    headline: 'Pro Tools. Real People.',
    line1: 'Industry-specific CRMs and websites for contractors,',
    line2: 'roofers, trades, home care, and dispensaries.',
    footer: 'TWOMIAH.COM  ·  EAU CLAIRE, WI'
  },
  {
    slug: 'build',
    bg: '#0D0D0D', glow: '#FF3D00',
    stopA: '#FFAB00', stopB: '#FF6D00', stopC: '#FF3D00',
    eyebrow: 'GENERAL CONTRACTOR CRM',
    title: 'BUILD',
    headline: 'Built for Contractors.',
    line1: 'CRM, jobs, quotes, invoicing, scheduling, website,',
    line2: 'and AI home visualizer — one platform.',
    footer: 'BUILD.TWOMIAH.COM  ·  FROM $49/MO'
  },
  {
    slug: 'roof',
    bg: '#0A1628', glow: '#FF6B35',
    stopA: '#FF8F66', stopB: '#FF6B35', stopC: '#E55A2B',
    eyebrow: 'ROOFING CRM',
    title: 'ROOF',
    headline: 'Built for Roofers.',
    line1: 'Satellite measurements, storm tracking,',
    line2: 'insurance workflow, canvassing tools.',
    footer: 'ROOF.TWOMIAH.COM  ·  FROM $49/MO'
  },
  {
    slug: 'wrench',
    bg: '#08111E', glow: '#0EA5E9',
    stopA: '#38BDF8', stopB: '#0EA5E9', stopC: '#0284C7',
    eyebrow: 'FIELD SERVICE SOFTWARE',
    title: 'WRENCH',
    headline: 'Built for the Trades.',
    line1: 'Dispatch, scheduling, service agreements,',
    line2: 'flat-rate pricebook, mobile tech app.',
    footer: 'WRENCH.TWOMIAH.COM  ·  FROM $49/MO'
  },
  {
    slug: 'care',
    bg: '#FAF8F5', glow: '#0D7377', dark: true,
    stopA: '#0FA3A8', stopB: '#0D7377', stopC: '#095456',
    eyebrow: 'HOME CARE AGENCY PLATFORM',
    title: 'CARE',
    headline: 'Built for Home Care.',
    line1: 'Scheduling, care plans, caregiver management,',
    line2: 'family portal, EVV compliance.',
    footer: 'CARE.TWOMIAH.COM  ·  FROM $49/MO'
  },
  {
    slug: 'leaf',
    bg: '#060d08', glow: '#16a34a',
    stopA: '#22c55e', stopB: '#16a34a', stopC: '#059669',
    eyebrow: 'DISPENSARY SOFTWARE',
    title: 'LEAF',
    headline: 'Software That Sells.',
    line1: 'POS, loyalty, delivery, inventory, and a',
    line2: 'website customers actually want to scroll.',
    footer: 'LEAF.TWOMIAH.COM  ·  FROM $299/MO'
  },
  {
    slug: 'factory',
    bg: '#0D0D0D', glow: '#FF3D00',
    stopA: '#FFAB00', stopB: '#FF6D00', stopC: '#FF3D00',
    eyebrow: 'WHITE-LABEL CRM ENGINE',
    title: 'FACTORY',
    headline: 'CRM. Live in Minutes.',
    line1: 'B2B deployment engine. Your logo, your',
    line2: 'domain, your data. Branded in minutes.',
    footer: 'FACTORY.TWOMIAH.COM  ·  FROM $149/MO'
  },
  {
    slug: 'vision',
    bg: '#0A0A0A', glow: '#D97706',
    stopA: '#FCD34D', stopB: '#D97706', stopC: '#92400E',
    eyebrow: 'AI HOME EXTERIOR VISUALIZER',
    title: 'VISION',
    headline: 'Show Their Actual House.',
    line1: 'AI exterior visualization embedded on your site.',
    line2: '450+ real products. Photorealistic in seconds.',
    footer: 'VISION.TWOMIAH.COM  ·  $49/MO'
  },
  {
    slug: 'ickapp',
    bg: '#0D0D0D', glow: '#28C840',
    stopA: '#28C840', stopB: '#16a34a', stopC: '#059669',
    eyebrow: 'FOOD BARCODE SCANNER',
    title: 'ICKAPP',
    headline: "What's In Your Food?",
    line1: 'Scan any barcode. Health score, harmful',
    line2: 'ingredient warnings, cleaner alternatives.',
    footer: 'ICK.TWOMIAH.COM  ·  FREE  ·  NO ADS'
  },
  {
    slug: 'cardshop',
    bg: '#0A0A0A', glow: '#E8B84B',
    stopA: '#F6D365', stopB: '#E8B84B', stopC: '#C8922A',
    eyebrow: 'SPORTS CARD PLATFORM',
    title: 'CARD SHOP',
    headline: 'Built for the Hobby.',
    line1: 'QR-tracked inventory, digital ownership,',
    line2: 'buy/sell/trade. Stores from $49/mo.',
    footer: 'CARDSHOP.TWOMIAH.COM'
  },
  // The three audience-bucket landing pages — branded share cards so
  // /businesses /apps /collectors get their own preview when shared.
  {
    slug: 'businesses',
    bg: '#0D0D0D', glow: '#FF3D00',
    stopA: '#FFAB00', stopB: '#FF6D00', stopC: '#FF3D00',
    eyebrow: 'CRMS · TOOLS · WEBSITES',
    title: 'BUSINESSES',
    headline: 'Real software, real businesses.',
    line1: 'Industry CRMs for trades, care, and dispensaries,',
    line2: 'plus websites for local small businesses.',
    footer: 'TWOMIAH.COM/BUSINESSES'
  },
  {
    slug: 'apps',
    bg: '#0D0D0D', glow: '#FF3D00',
    stopA: '#FFAB00', stopB: '#FF6D00', stopC: '#FF3D00',
    eyebrow: 'CONSUMER APPS',
    title: 'APPS',
    headline: 'For Real People.',
    line1: 'Food transparency, cannabis lab data,',
    line2: 'and civic accountability. Free. No ads.',
    footer: 'TWOMIAH.COM/APPS'
  },
  {
    slug: 'collectors',
    bg: '#0A0A0A', glow: '#E8B84B',
    stopA: '#F6D365', stopB: '#E8B84B', stopC: '#C8922A',
    eyebrow: 'CARD COLLECTORS',
    title: 'COLLECTORS',
    headline: 'Built for the Hobby.',
    line1: 'A chain-of-custody marketplace + live',
    line2: 'breaking platform for sports cards.',
    footer: 'TWOMIAH.COM/COLLECTORS'
  }
];

function buildSvg(p) {
  const textPrimary = p.dark ? '#1A1F2E' : '#F5F0EB';
  const textBody    = p.dark ? '#2D3347' : '#FFFFFF';
  const bodyOpacity = p.dark ? '0.7'     : '0.55';
  const footerColor = p.dark ? '#5A6178' : '#FFFFFF';
  const footerOpacity = p.dark ? '0.7'   : '0.4';
  const wmOpacity = p.dark ? '0.06' : '0.025';

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <defs>
    <linearGradient id="g" x1="0" y1="630" x2="1200" y2="0" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="${p.stopA}"/>
      <stop offset="50%" stop-color="${p.stopB}"/>
      <stop offset="100%" stop-color="${p.stopC}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="100%" r="60%">
      <stop offset="0%" stop-color="${p.glow}" stop-opacity="0.28"/>
      <stop offset="100%" stop-color="${p.bg}" stop-opacity="0"/>
    </radialGradient>
    <filter id="soft" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="6" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="${p.bg}"/>
  <rect width="1200" height="630" fill="url(#glow)"/>

  <text x="600" y="500" font-family="'DejaVu Sans', 'Arial Black', sans-serif" font-size="280" font-weight="900" letter-spacing="20" text-anchor="middle" fill="${p.title === 'TWOMIAH' ? '#FFFFFF' : '#FFFFFF'}" opacity="${wmOpacity}">${p.title}</text>

  <g transform="translate(110,135) scale(2.6)">
    <path d="M42 96 L20 48 L42 60 L52 24 L62 52 L75 40 L60 96 Z" fill="url(#g)" opacity="0.65"/>
    <path d="M78 96 L56 44 L68 58 L78 18 L88 50 L104 36 L96 96 Z" fill="url(#g)" filter="url(#soft)"/>
    <rect x="16" y="96" width="88" height="3" rx="1.5" fill="url(#g)" opacity="0.45"/>
  </g>

  <text x="470" y="270" font-family="'DejaVu Sans', 'Arial Black', sans-serif" font-size="110" font-weight="900" letter-spacing="6" fill="url(#g)">${p.title}</text>
  <text x="473" y="340" font-family="'DejaVu Sans', 'Arial Black', sans-serif" font-size="46" font-weight="700" letter-spacing="2" fill="${textPrimary}">${p.headline}</text>
  <text x="475" y="408" font-family="'DejaVu Sans', sans-serif" font-size="24" fill="${textBody}" opacity="${bodyOpacity}">${p.line1}</text>
  <text x="475" y="442" font-family="'DejaVu Sans', sans-serif" font-size="24" fill="${textBody}" opacity="${bodyOpacity}">${p.line2}</text>

  <g transform="translate(110,540)">
    <rect width="6" height="42" fill="url(#g)"/>
    <text x="22" y="20" font-family="'DejaVu Sans', sans-serif" font-size="14" letter-spacing="4" fill="${p.stopB}" font-weight="700">${p.eyebrow}</text>
    <text x="22" y="40" font-family="'DejaVu Sans', sans-serif" font-size="13" letter-spacing="2" fill="${footerColor}" opacity="${footerOpacity}">${p.footer}</text>
  </g>
</svg>`;
}

(async () => {
  let count = 0;
  for (const p of products) {
    const svg = buildSvg(p);
    const svgPath = path.join(OUT_DIR, `og-${p.slug}.svg`);
    const pngPath = path.join(OUT_DIR, `og-${p.slug}.png`);
    fs.writeFileSync(svgPath, svg, 'utf8');
    await sharp(Buffer.from(svg), { density: 144 })
      .resize(1200, 630)
      .png({ compressionLevel: 9, quality: 92 })
      .toFile(pngPath);
    console.log(`  ✓ og/og-${p.slug}.png (${(fs.statSync(pngPath).size / 1024).toFixed(1)} KB)`);
    count++;
  }

  // Also overwrite the root og-image.png + og-image.svg with the default.
  const defaultSvg = buildSvg(products[0]);
  fs.writeFileSync(path.join(ROOT, 'og-image.svg'), defaultSvg, 'utf8');
  await sharp(Buffer.from(defaultSvg), { density: 144 })
    .resize(1200, 630)
    .png({ compressionLevel: 9, quality: 92 })
    .toFile(path.join(ROOT, 'og-image.png'));
  console.log(`  ✓ og-image.png (root default)`);
  console.log(`\nGenerated ${count + 1} OG images.`);
})();
