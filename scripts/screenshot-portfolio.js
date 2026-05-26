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
  { slug: 'portfolio-breakreturns',    url: 'https://breakreturns.com' },
  // Case study: same local business, two builders. Full-page so the
  // contrast carries even after the visitor stops scrolling on /businesses.
  // scrollFirst triggers IntersectionObserver-driven fade-ins before capture
  // so the screenshot shows real content, not opacity:0 placeholders.
  { slug: 'case-potatopotahto-before', url: 'https://potato-potahto.com',         fullPage: true, scrollFirst: true },
  { slug: 'case-potatopotahto-after',  url: 'https://potato-potahto.netlify.app', fullPage: true, scrollFirst: true }
];

// Slow-scroll the page from top to bottom so scroll-triggered animations
// (reveals, lazy images, IntersectionObserver fade-ins) actually fire,
// then return to top before the screenshot.
async function autoScrollPage(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let y = 0;
      const step = 120;
      const tick = setInterval(() => {
        const max = document.body.scrollHeight;
        window.scrollBy(0, step);
        y += step;
        if (y >= max) {
          clearInterval(tick);
          window.scrollTo(0, 0);
          setTimeout(resolve, 900);
        }
      }, 90);
    });
  });
}

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
      if (site.scrollFirst) {
        await autoScrollPage(page);
      }
      const outPath = path.join(OUT_DIR, `${site.slug}.png`);
      await page.screenshot({ path: outPath, type: 'png', fullPage: !!site.fullPage });
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
