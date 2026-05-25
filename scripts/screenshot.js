// Browser-test the homepage at desktop + mobile widths.
// Run: node scripts/screenshot.js
const puppeteer = require('puppeteer');
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const OUT = path.join(__dirname, '..', '.screenshots');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml',
  '.txt': 'text/plain'
};

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath.endsWith('/')) urlPath += 'index.html';
  const filePath = path.join(ROOT, decodeURIComponent(urlPath));
  if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end('forbidden'); return; }
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('not found: ' + urlPath); return; }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});

(async () => {
  await new Promise(r => server.listen(0, r));
  const port = server.address().port;
  const base = `http://localhost:${port}`;
  console.log('Local server →', base);

  const browser = await puppeteer.launch({ headless: 'new' });

  const cases = [
    { name: 'home-desktop',  url: '/',           w: 1440, h: 900,  full: true  },
    { name: 'home-mobile',   url: '/',           w: 390,  h: 844,  full: true  },
    { name: 'home-hero',     url: '/',           w: 1440, h: 900,  full: false },
    { name: 'home-mission',  url: '/#mission',   w: 1440, h: 900,  full: false }
  ];

  const errors = [];

  for (const c of cases) {
    const page = await browser.newPage();
    await page.setViewport({ width: c.w, height: c.h, deviceScaleFactor: 1 });
    page.on('pageerror', e => errors.push(`[${c.name}] page error: ${e.message}`));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(`[${c.name}] console error: ${msg.text()}`);
    });
    page.on('requestfailed', req => {
      const url = req.url();
      if (url.startsWith(base)) errors.push(`[${c.name}] failed: ${req.method()} ${url.replace(base, '')}`);
    });

    await page.goto(base + c.url, { waitUntil: 'networkidle0', timeout: 15000 });
    // IntersectionObserver only fires for in-viewport elements; for full-page
    // screenshots, force-add .visible so reveal animations don't hide content.
    await page.evaluate(() => {
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    });
    await new Promise(r => setTimeout(r, 800));

    const outPath = path.join(OUT, `${c.name}.png`);
    await page.screenshot({ path: outPath, fullPage: c.full });
    console.log(`  ✓ ${c.name}.png (${c.full ? 'full' : 'viewport'} @ ${c.w}x${c.h})`);
    await page.close();
  }

  await browser.close();
  server.close();

  if (errors.length) {
    console.log('\n⚠ Issues:');
    for (const e of errors) console.log('  ' + e);
    process.exit(1);
  } else {
    console.log('\n✅ No console errors, no failed requests.');
  }
})();
