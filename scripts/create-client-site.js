// Site Studio MVP — scaffold a local-business client site from a brief.
//
// Usage: node scripts/create-client-site.js <path/to/brief.json>
//
// Reads a JSON brief (see scripts/sample-brief.json), customizes the
// starter template at scripts/client-site-template/index.html, and
// writes a complete index.html into clients/<slug>/. Team customizes
// the design from there, then deploys to Netlify manually:
//
//   cd clients/<slug>
//   netlify deploy --prod --dir .
//
// This is intentionally narrow: it automates the boring scaffolding
// (placeholder swaps, services grid HTML, output dir) and leaves the
// actual design work — the part the customer pays $1,000 for — to
// the team. No Netlify API calls here yet; add those when there's
// demand to justify the additional surface area.

const fs = require('fs');
const path = require('path');

const briefPath = process.argv[2];
if (!briefPath) {
  console.error('Usage: node scripts/create-client-site.js <path/to/brief.json>');
  console.error('See scripts/sample-brief.json for the expected format.');
  process.exit(1);
}

if (!fs.existsSync(briefPath)) {
  console.error(`Brief file not found: ${briefPath}`);
  process.exit(1);
}

const brief = JSON.parse(fs.readFileSync(briefPath, 'utf8'));

const required = ['slug', 'businessName', 'tagline'];
for (const k of required) {
  if (!brief[k]) {
    console.error(`Missing required field in brief: ${k}`);
    process.exit(1);
  }
}

if (!/^[a-z0-9][a-z0-9-]*$/.test(brief.slug)) {
  console.error(`Invalid slug "${brief.slug}". Use lowercase letters, digits, hyphens.`);
  process.exit(1);
}

const defaults = {
  primaryColor: '#1a1a1a',
  accentColor: '#FF6D00',
  description: brief.tagline,
  phone: '',
  email: '',
  address: '',
  hours: '',
  aboutText: '',
  ctaText: 'Get in Touch',
  ctaUrl: '#contact-section',
  services: [],
  year: new Date().getFullYear()
};

const data = Object.assign({}, defaults, brief);

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));
}

const servicesHtml = (data.services || []).map(s => `    <div class="service-card">
      <h3>${escapeHtml(s.title || '')}</h3>
      <p>${escapeHtml(s.desc || '')}</p>
    </div>`).join('\n');

const templatePath = path.join(__dirname, 'client-site-template', 'index.html');
const template = fs.readFileSync(templatePath, 'utf8');

let html = template;
for (const k of Object.keys(data)) {
  if (k === 'services') continue;
  const re = new RegExp('\\{\\{' + k + '\\}\\}', 'g');
  html = html.replace(re, escapeHtml(data[k]));
}
html = html.replace(/\{\{services\}\}/g, servicesHtml);

const outDir = path.join(__dirname, '..', 'clients', data.slug);
fs.mkdirSync(outDir, { recursive: true });

const outPath = path.join(outDir, 'index.html');
fs.writeFileSync(outPath, html, 'utf8');

const briefCopyPath = path.join(outDir, 'brief.json');
fs.writeFileSync(briefCopyPath, JSON.stringify(data, null, 2), 'utf8');

console.log(`Created ${outPath}`);
console.log(`Brief copy:  ${briefCopyPath}`);
console.log('');
console.log('Next steps:');
console.log(`  1. Open ${outPath} in a browser to preview`);
console.log(`  2. Customize the design as needed (HTML + CSS in that file)`);
console.log(`  3. Deploy to Netlify:`);
console.log(`       cd ${path.relative(process.cwd(), outDir)}`);
console.log(`       netlify deploy --prod --dir .`);
console.log(`  4. Point the customer's domain at the new Netlify site`);
