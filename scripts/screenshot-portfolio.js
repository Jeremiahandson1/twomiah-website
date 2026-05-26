// Captures viewport screenshots of live portfolio sites for proof-point displays.
// Run: node scripts/screenshot-portfolio.js
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const OUT_DIR = path.join(__dirname, '..', 'images');
if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const SITES = [
  { slug: 'portfolio-claflin',         url: 'https://claflinconstruction.net' },
  { slug: 'portfolio-cvhc',            url: 'https://chippewavalleyhomecare.com' },
  { slug: 'portfolio-ickthatish',      url: 'https://ickthatish.com' },
  { slug: 'portfolio-goldstandard',    url: 'https://goldstandardapp.com' },
  { slug: 'portfolio-whosrunningusa',  url: 'https://whosrunningusa.com' },
  { slug: 'portfolio-cardshop',        url: 'https://cardshop.twomiah.com' },
  { slug: 'portfolio-breakreturns',    url: 'https://breakreturns.com' }
];

(async () => {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  let ok = 0, fail = 0;
  for (const site of SITES) {
    const page = await browser.newPage();
    await page.setViewport({ width: 1600, height: 1000, deviceScaleFactor: 1 });
    try {
      await page.goto(site.url, { waitUntil: 'networkidle2', timeout: 45000 });
      await new Promise(r => setTimeout(r, 2000));
      const outPath = path.join(OUT_DIR, `${site.slug}.png`);
      await page.screenshot({ path: outPath, type: 'png' });
      const kb = (fs.statSync(outPath).size / 1024).toFixed(1);
      console.log(`  ok  ${site.slug}.png (${kb} KB)`);
      ok++;
    } catch (err) {
      console.log(`  fail ${site.slug}: ${err.message}`);
      fail++;
    }
    await page.close();
  }
  await browser.close();
  console.log(`\nDone: ${ok} ok, ${fail} failed`);
})();
