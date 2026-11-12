// twomiah.com's facts, read from the Factory repo — never typed in by hand.
//
//   bun scripts/site-facts.ts <factory checkout>          writes docs/site-facts.md and the generated blocks in the pages
//   bun scripts/site-facts.ts <factory checkout> --check  writes nothing; fails if a page says something the facts do not
//
// <factory checkout> is a checkout of the Factory repo (Jeremiahandson1/twomiah-factory) at the branch that is live, e.g.
// `git worktree add ../site-facts origin/main`. What it reads there:
//   packages/tenant-backend/src/featureRegistry.ts  — the features; a page may name one only if
//                                                     getAdvertisableFeaturesForTemplate(<its template>) returns it
//   packages/tenant-backend/src/plans.ts            — plan names, seats and list prices
//   apps/api/src/config/pricing.ts                  — offeredAddons(): the paid add-ons; the custom build
//   apps/api/src/config/messagingCosts.ts           — the texting / AI switch-on fees and the tracking-number price
//   apps/unified/server/crm/roof/reports/roofCredits.ts — roof measurement packs
//   apps/unified/demo/trades.ts                     — the trades in the demo (https://demo.twomiah.com)
// Comparisons: docs/comparisons.json in this repo (rows sourced to the Factory's docs/parity/*.md, competitor prices
// fetched from each vendor's own site, each with its date). Every row's featureIds are checked against the registry here.
import { readFileSync, writeFileSync, readdirSync, existsSync } from 'node:fs'
import { join, resolve } from 'node:path'

const args = process.argv.slice(2)
const CHECK = args.includes('--check')
const FACTORY = resolve(args.find((a) => !a.startsWith('--')) ?? '../site-facts')
const SITE = resolve(import.meta.dir, '..')
if (!existsSync(join(FACTORY, 'packages/tenant-backend/src/featureRegistry.ts'))) {
  console.error(`Not a Factory checkout: ${FACTORY}`)
  process.exit(2)
}
const reg = await import(join(FACTORY, 'packages/tenant-backend/src/featureRegistry.ts'))
const { PLANS } = await import(join(FACTORY, 'packages/tenant-backend/src/plans.ts'))
const pricing = await import(join(FACTORY, 'apps/api/src/config/pricing.ts'))
const costs = await import(join(FACTORY, 'apps/api/src/config/messagingCosts.ts'))
// roofCredits.ts imports the server's packages, so its one constant is read from the text.
const REPORT_PACK = (() => {
  const m = readFileSync(join(FACTORY, 'apps/unified/server/crm/roof/reports/roofCredits.ts'), 'utf8').match(/REPORT_PACK = \{ roofs: (\d+), priceCents: (\d+) \}/)
  if (!m) throw new Error('REPORT_PACK not found in roofCredits.ts — read it and update this script')
  return { roofs: Number(m[1]), priceCents: Number(m[2]) }
})()
const { DEMO_TRADES } = await import(join(FACTORY, 'apps/unified/demo/trades.ts'))

const DEMO = 'https://demo.twomiah.com'
const demoUrl = (id: string) => `${DEMO}/crm?trade=${encodeURIComponent(id)}`

// The trades twomiah.com sells (Factory docs/PROJECT_BRIEF.md "Open industries for real signups": contractor, fieldservice,
// landscaping, roofing, homecare, restaurant (incl. food truck), bar, salon, basic ("Other"), store. Closed: vet, rv;
// dispensary refused). Template = industryRouting.ts crmTemplateFor(vertical). demo = an id in DEMO_TRADES, or the closest
// one with `closest: true`.
type Trade = { key: string; label: string; templates: string[]; page: string | null; signup: string; demo: string | null; closest?: boolean }
const TRADES: Trade[] = [
  { key: 'contractor', label: 'Contractors & remodelers', templates: ['crm'], page: 'build.html', signup: '/signup/build', demo: 'contractor' },
  { key: 'roofing', label: 'Roofing', templates: ['crm-roof'], page: 'roof.html', signup: '/signup/roof', demo: 'roofing' },
  { key: 'fieldservice', label: 'Field service (HVAC, plumbing, electrical, cleaning…)', templates: ['crm-fieldservice'], page: 'wrench.html', signup: '/signup/wrench', demo: 'contractor', closest: true },
  { key: 'homecare', label: 'Home care', templates: ['crm-homecare'], page: 'care.html', signup: '/signup/care', demo: 'homecare' },
  { key: 'landscaping', label: 'Landscaping & lawn care', templates: ['crm-landscaping'], page: 'landscaping.html', signup: '/signup.html?industry=landscaping', demo: 'contractor', closest: true },
  { key: 'salon', label: 'Salons, spas & barbers', templates: ['crm-salon'], page: 'salon.html', signup: '/signup.html?industry=salon', demo: 'salon' },
  { key: 'restaurant-bar', label: 'Restaurants, bars & food trucks', templates: ['crm-restaurant', 'crm-bar'], page: 'restaurant.html', signup: '/signup.html?industry=restaurant', demo: 'restaurant-bar' },
  { key: 'store', label: 'Shops (online store)', templates: ['crm-store'], page: 'store.html', signup: '/signup.html?industry=retail', demo: 'store' },
  { key: 'basic', label: 'Any other business ("Other")', templates: ['crm-basic'], page: null, signup: '/signup.html?industry=other', demo: null },
]
const TEMPLATE_LABEL: Record<string, string> = { 'crm-restaurant': 'Restaurant & food truck', 'crm-bar': 'Bar & grill' }

type F = { id: string; name: string; description: string; category: string; paid: boolean }
// A feature the registry does not hide but whose own description still says it is "not yet available" is not ready either
// (owner's rule: nothing is advertised until it works). It stays off the site and is listed in the fact sheet.
const NOT_AVAILABLE = /not yet available/i
const offered = (t: string): F[] =>
  reg.getAdvertisableFeaturesForTemplate(t).map((f: any) => {
    const o = f.as?.[t] ?? {}
    return { id: f.id, name: o.name ?? f.name, description: o.description ?? f.description, category: o.category ?? f.category, paid: reg.isPaidAddOn(f.id) }
  })
// The registry's categories are shared across trades, so a landscaper would see a "Roofing" group (Draw on Photos). On a
// trade's own page a group named after another trade gets a neutral name; the features in it do not change.
const CATEGORY_AS: Record<string, Record<string, string>> = {
  crm: { Roofing: 'Payments & Photos', 'Field Service': 'Service & Dispatch' },
  'crm-fieldservice': {},
  'crm-landscaping': { Roofing: 'Photos', 'Field Service': 'Service & Dispatch' },
  'crm-basic': { 'Field Service': 'Service & Dispatch' },
  'crm-restaurant': { Bar: 'Staff, Stock & Tips' },
}
const advertisable = (t: string): F[] =>
  offered(t).filter((f) => !NOT_AVAILABLE.test(f.description)).map((f) => ({ ...f, category: CATEGORY_AS[t]?.[f.category] ?? f.category }))
const notAvailable = (t: string): F[] => offered(t).filter((f) => NOT_AVAILABLE.test(f.description))
const hidden: { id: string; name: string; words: string[] }[] = reg.FEATURE_REGISTRY.filter((f: any) => f.hidden).map((f: any) => ({ id: f.id, name: f.name, words: f.words ?? [] }))

// Usage-priced features: what they cost, from the Factory's code — a page says this beside them, never a made-up number.
const money = (cents: number) => `$${(cents / 100).toFixed(cents % 100 ? 2 : 0)}`
const USAGE: Record<string, string> = {
  two_way_texting: `Texting add-on: ${money(costs.MESSAGING_ENABLE_MONTHLY_CENTS)}/mo, plus each text at cost`,
  chat_to_text: `Uses the texting add-on (${money(costs.MESSAGING_ENABLE_MONTHLY_CENTS)}/mo, texts at cost)`,
  rebooking_reminders: `Bulk texts use the texting add-on (${money(costs.MESSAGING_ENABLE_MONTHLY_CENTS)}/mo, texts at cost)`,
  ai_receptionist: `Uses the texting add-on (${money(costs.MESSAGING_ENABLE_MONTHLY_CENTS)}/mo, texts at cost)`,
  call_tracking_numbers: `${money(costs.CALLTRACK_NUMBER_MONTHLY_CENTS)}/mo a number; calls and recordings at cost`,
  call_tracking: `Calls and recordings at cost`,
  visualizer: `Add-on: $${pricing.offeredAddons('crm').find((a: any) => a.id === 'exterior_visualizer')?.price}/mo`,
  measurement_reports: `Roof measurements in packs: ${REPORT_PACK.roofs} for ${money(REPORT_PACK.priceCents)}`,
  instant_estimator: `Spends roof measurements (${REPORT_PACK.roofs} for ${money(REPORT_PACK.priceCents)})`,
}

const esc = (s: string) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// ─── The fact sheet ─────────────────────────────────────────────────────────────────────────────────────────────────────
function factSheet(factoryRef: string): string {
  const seat = ['starter10', 'team25', 'business50'].map((id) => PLANS[id])
  const addons = pricing.offeredAddons('crm')
  const L: string[] = []
  L.push('# twomiah.com fact sheet', '')
  L.push(`Generated by \`bun scripts/site-facts.ts <factory checkout>\` from the Factory repo at \`${factoryRef}\`. Do not edit by hand —`)
  L.push('re-run it. `--check` fails when a page names a hidden feature, says "free trial", tags a feature its trade does not')
  L.push('offer, or links a demo that is not in the demo.', '')
  L.push('## Rules', '')
  L.push('- Plans differ by **seats only**; every standard feature is in every plan. No feature tiers.')
  L.push('- Charged at signup with a **30-day money-back guarantee**. There is **no free trial**.')
  L.push('- A feature is advertised only if `getAdvertisableFeaturesForTemplate(<template>)` returns it. Hidden = never mentioned.')
  L.push('- Usage-priced items are described as usage-priced, with the price from the code below — never a made-up number.')
  L.push('- Competitor prices: only as fetched from the vendor\'s own site, with the date (docs/comparisons.json).', '')
  L.push('## Plans (packages/tenant-backend/src/plans.ts; the live /api/v1/factory/plans returns the same)', '')
  L.push('| Plan | Users | Price |', '|---|---|---|')
  for (const p of seat) L.push(`| ${p.name} | up to ${p.seats} | $${p.monthlyPrice}/mo |`)
  L.push(`| Website only | — | $${PLANS.website.monthlyPrice}/mo |`)
  L.push(`| Web presence (one page) | — | $${PLANS.webpresence.monthlyPrice}/mo |`)
  L.push('', `Own it (self-hosted licence) = 36 × the monthly price: ${pricing.seatPlanLicenses().map((l: any) => `${l.name} $${l.price.toLocaleString('en-US')}`).join(', ')}.`)
  L.push(`Custom build: ${pricing.DEFAULT_DEPLOY_SERVICES.map((s: any) => `$${s.price} — ${s.description}`).join('; ')}.`, '')
  L.push('## Paid add-ons and usage (apps/api/src/config/pricing.ts offeredAddons, config/messagingCosts.ts)', '')
  for (const a of addons) L.push(`- **${a.name}** — $${a.price}/mo. ${a.description}.${a.id === 'exterior_visualizer' ? ' Contractor and roofing only.' : ''}`)
  L.push(`- **Call tracking numbers** — ${money(costs.CALLTRACK_NUMBER_MONTHLY_CENTS)}/mo a number (services/callTrackingNumbers.ts); each call and recording at what Twilio charges, from the usage wallet.`)
  L.push(`- **Roof measurements** (Measurement Reports and the Instant Roof Estimator) — bought in packs: ${REPORT_PACK.roofs} roofs for ${money(REPORT_PACK.priceCents)} (roofCredits.ts REPORT_PACK).`)
  L.push(`- Texting usage: each text at cost from a prepaid wallet (starts at ${money(costs.MESSAGING_START_CENTS)}); one-time carrier registration at cost.`, '')
  L.push('## Hidden — never mention anywhere', '')
  for (const h of hidden) L.push(`- \`${h.id}\` — ${h.name}${h.words.length ? ` (words: ${h.words.join(', ')})` : ''}`)
  L.push('', '## Not hidden, but its own description says "not yet available" — left off the site', '')
  for (const t of TRADES.flatMap((x) => x.templates)) for (const f of notAvailable(t)) L.push(`- ${t}: \`${f.id}\` — ${f.name}: ${f.description}`)
  L.push('', '## Demo (apps/unified/demo/trades.ts)', '', `${DEMO} — sample businesses; nothing is saved.`, '')
  for (const d of DEMO_TRADES) L.push(`- ${d.label}: ${demoUrl(d.id)}`)
  L.push('', '## Trades sold, and where each lives on the site', '')
  L.push('| Trade | CRM template | Page | Signup | Demo |', '|---|---|---|---|---|')
  for (const t of TRADES) L.push(`| ${t.label} | ${t.templates.join(' + ')} | ${t.page ?? '— (businesses.html)'} | ${t.signup} | ${t.demo ? demoUrl(t.demo) + (t.closest ? ' (closest — no demo of its own)' : '') : 'none'} |`)
  L.push('', 'Not sold (not on the site): veterinary, RV / powersports, dispensary.', '')
  L.push('## Advertisable features per template', '')
  for (const t of TRADES.flatMap((x) => x.templates)) {
    const fs = advertisable(t)
    L.push(`### ${t} — ${fs.length} features`, '')
    const cats = new Map<string, F[]>()
    for (const f of fs) cats.set(f.category, [...(cats.get(f.category) ?? []), f])
    for (const [c, list] of cats) {
      L.push(`**${c}**`, '')
      for (const f of list) L.push(`- \`${f.id}\` **${f.name}** — ${f.description}${USAGE[f.id] ? ` *(${USAGE[f.id]})*` : ''}${f.paid ? ' *(paid add-on)*' : ''}`)
      L.push('')
    }
  }
  return L.join('\n') + '\n'
}

// ─── Generated blocks in the pages ──────────────────────────────────────────────────────────────────────────────────────
// <!-- facts:features crm-roof --> … <!-- /facts:features -->   every advertisable feature, by category
// <!-- facts:compare crm-roof --> … <!-- /facts:compare -->      the comparison table from docs/comparisons.json
const STYLE = `<style>
.fx{max-width:1100px;margin:36px auto 0;text-align:left}
.fx-cat{border-top:1px solid color-mix(in srgb,currentColor 18%,transparent)}
.fx-cat summary{cursor:pointer;padding:14px 4px;font-weight:700;list-style:none;display:flex;align-items:baseline;gap:10px}
.fx-cat summary::-webkit-details-marker{display:none}
.fx-cat summary::after{content:'+';opacity:.6;margin-left:auto}
.fx-cat[open] summary::after{content:'\\2212'}
.fx-cat ul{list-style:none;margin:0;padding:0 4px 16px;display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:10px 28px}
.fx-cat li{font-size:14px;line-height:1.5;opacity:.85}
.fx-cat li b{display:block;opacity:1}
.fx-cat li i{display:block;font-size:12px;opacity:.75}
.fx-n{font-weight:400;opacity:.6}
.fx-h{font-size:13px;letter-spacing:.08em;text-transform:uppercase;opacity:.7;margin:28px 0 6px}
.cx{max-width:900px;margin:0 auto;overflow-x:auto}
.cx table{width:100%;border-collapse:collapse;font-size:14px;text-align:left}
.cx th,.cx td{padding:10px 12px;border-bottom:1px solid color-mix(in srgb,currentColor 14%,transparent);vertical-align:top}
.cx th{font-size:11px;letter-spacing:.1em;text-transform:uppercase;opacity:.7}
.cx td.y{text-align:center;font-weight:700;white-space:nowrap}
.cx .cx-note{font-size:12px;opacity:.65;margin-top:12px;line-height:1.5}
.cx .cx-note a{color:inherit}
@media(max-width:700px){
.cx thead{display:none}
.cx table,.cx tbody,.cx tr,.cx td{display:block;width:100%}
.cx tr{padding:12px 0;border-bottom:1px solid color-mix(in srgb,currentColor 14%,transparent)}
.cx td{border:0;padding:2px 0}
.cx td:first-child{font-weight:700;padding-bottom:6px}
.cx td.y{display:inline-block;width:auto;text-align:left;margin-right:14px;font-size:13px;white-space:normal}
.cx td.y::before{content:attr(data-label) ' ';font-weight:400;opacity:.7}
}
</style>`

function featuresBlock(templates: string[]): string {
  const parts: string[] = [STYLE.replace(/\n/g, ''), '<div class="fx">']
  for (const t of templates) {
    const fs = advertisable(t)
    if (templates.length > 1) parts.push(`<div class="fx-h">${esc(TEMPLATE_LABEL[t] ?? t)} &middot; ${fs.length} features</div>`)
    const cats = new Map<string, F[]>()
    for (const f of fs) cats.set(f.category, [...(cats.get(f.category) ?? []), f])
    for (const [c, list] of cats) {
      parts.push(`<details class="fx-cat"><summary>${esc(c)} <span class="fx-n">${list.length}</span></summary><ul>`)
      for (const f of list) parts.push(`<li data-feature="${f.id}"><b>${esc(f.name)}</b>${esc(f.description)}${USAGE[f.id] ? `<i>${esc(USAGE[f.id])}</i>` : f.paid ? '<i>Paid add-on</i>' : ''}</li>`)
      parts.push('</ul></details>')
    }
  }
  parts.push('</div>')
  return parts.join('\n')
}

type CmpRow = { capability: string; leaders: string[]; featureIds: string[]; source: string }
type CmpTrade = { leaders: string[]; rows: CmpRow[] }
type Price = { product: string; price: string; url: string; date: string }
const CMP_FILE = join(SITE, 'docs/comparisons.json')
const cmp: { trades: Record<string, CmpTrade>; prices: Price[] } = existsSync(CMP_FILE) ? JSON.parse(readFileSync(CMP_FILE, 'utf8')) : { trades: {}, prices: [] }

function compareBlock(template: string): string {
  const c = cmp.trades[template]
  if (!c) return ''
  const leaders = c.leaders
  const ok = new Set(advertisable(template).map((f) => f.id))
  const rows = c.rows.filter((r) => r.featureIds.every((id) => ok.has(id)) && r.leaders.some((l) => leaders.includes(l)))
  const h: string[] = [STYLE.replace(/\n/g, ''), '<div class="cx"><table><thead><tr><th>What the leaders sell you</th>']
  for (const l of leaders) h.push(`<th class="y">${esc(l)}</th>`)
  h.push('<th class="y">Twomiah</th></tr></thead><tbody>')
  for (const r of rows) {
    h.push(`<tr data-feature="${r.featureIds.join(' ')}"><td>${esc(r.capability)}</td>`)
    for (const l of leaders) h.push(`<td class="y" data-label="${esc(l)}">${r.leaders.includes(l) ? '&#10003;' : '&ndash;'}</td>`)
    h.push('<td class="y" data-label="Twomiah">&#10003;</td></tr>')
  }
  const prices = cmp.prices.filter((p) => leaders.includes(p.product))
  h.push('<tr><td><b>Starting price</b></td>')
  for (const l of leaders) {
    const p = prices.find((x) => x.product === l)
    h.push(`<td class="y" data-label="${esc(l)}">${p ? esc(p.price) : '&ndash;'}</td>`)
  }
  h.push(`<td class="y" data-label="Twomiah">From $${PLANS.starter10.monthlyPrice}/mo (up to ${PLANS.starter10.seats} users)</td></tr></tbody></table>`)
  h.push('<p class="cx-note">&#10003; = the leader offers it, from its own product and help pages; &ndash; = not compared here (it may well have it), or a price we could not confirm on its own site. Twomiah: every listed feature on every plan, $' +
    `${PLANS.starter10.monthlyPrice} / $${PLANS.team25.monthlyPrice} / $${PLANS.business50.monthlyPrice} a month for up to ${PLANS.starter10.seats} / ${PLANS.team25.seats} / ${PLANS.business50.seats} users.` +
    (prices.length ? ' Their prices: ' + prices.map((p) => `<a href="${esc(p.url)}" target="_blank" rel="noopener">${esc(p.product)}</a> (checked ${esc(p.date)})`).join(', ') + '.' : '') + '</p></div>')
  return h.join('\n')
}

function inject(html: string, kind: 'features' | 'compare', render: (arg: string) => string): string {
  const re = new RegExp(`(<!-- facts:${kind} ([a-z0-9 -]+) -->)[\\s\\S]*?(<!-- /facts:${kind} -->)`, 'g')
  return html.replace(re, (_m, open, arg, close) => `${open}\n${render(arg.trim())}\n${close}`)
}

// ─── Checks ─────────────────────────────────────────────────────────────────────────────────────────────────────────────
const problems: string[] = []
const pages = readdirSync(SITE).filter((f) => f.endsWith('.html')).concat(
  readdirSync(join(SITE, 'signup')).map((d) => `signup/${d}/index.html`).filter((p) => existsSync(join(SITE, p))),
  existsSync(join(SITE, 'welcome/index.html')) ? ['welcome/index.html'] : [],
)
// Pages about other products (consumer apps, cards, a campus plan) or legal pages that define words: not checked for CRM claims.
const NOT_CRM = new Set(['home.html', 'theblock.html', 'apps.html', 'collectors.html'])
const hiddenNames = [...hidden.map((h) => h.name), ...new Set(TRADES.flatMap((x) => x.templates).flatMap((t) => notAvailable(t).map((f) => f.name)))]
const hiddenWords = reg.notReadyWords() as string[]
const demoIds = new Set(DEMO_TRADES.map((d: any) => d.id))
const text = (html: string) => html.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ')

for (const p of pages) {
  let html = readFileSync(join(SITE, p), 'utf8')
  const before = html
  html = inject(html, 'features', (arg) => featuresBlock(arg.split(/\s+/)))
  html = inject(html, 'compare', (arg) => compareBlock(arg))
  if (html !== before) {
    if (CHECK) problems.push(`${p}: generated blocks are out of date — run without --check`)
    else writeFileSync(join(SITE, p), html)
  }
  const t = text(html)
  // "There is no free trial" / "We do not offer free trials" say what is true; anything else offers one.
  if (/free[\s-]+trial/i.test(t.replace(/\b(?:no|do not offer|don't offer|never offer)\s+free[\s-]+trials?/gi, ''))) problems.push(`${p}: says "free trial" (there is none — 30-day money-back guarantee)`)
  if (NOT_CRM.has(p)) continue
  for (const n of hiddenNames) if (new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(t)) problems.push(`${p}: names hidden feature "${n}"`)
  for (const w of hiddenWords) if (new RegExp(`\\b${w}`, 'i').test(t)) problems.push(`${p}: uses not-ready word "${w}"`)
  // data-template on <body>/<main> says which templates the page's tagged features must come from.
  const tm = html.match(/data-template="([a-z0-9 -]+)"/)
  if (tm) {
    const ok = new Set(tm[1].split(/\s+/).flatMap((x) => advertisable(x).map((f) => f.id)))
    for (const m of html.matchAll(/data-feature="([a-z0-9_ ]+)"/g)) for (const id of m[1].split(/\s+/)) if (!ok.has(id)) problems.push(`${p}: tags "${id}", not advertisable for ${tm[1]}`)
  }
  for (const m of html.matchAll(/demo\.twomiah\.com\/crm\?trade=([a-z-]+)/g)) if (!demoIds.has(m[1])) problems.push(`${p}: demo link to "${m[1]}", which is not in the demo`)
}
for (const [t, c] of Object.entries(cmp.trades)) {
  const ok = new Set(advertisable(t).map((f) => f.id))
  for (const r of c.rows) for (const id of r.featureIds) if (!ok.has(id)) problems.push(`docs/comparisons.json ${t}: "${r.capability}" uses ${id}, not advertisable`)
}

const ref = (() => { try { return readFileSync(join(FACTORY, '.git'), 'utf8').trim() } catch { return FACTORY } })()
let head = ''
try { head = Bun.spawnSync(['git', '-C', FACTORY, 'log', '-1', '--format=%h %cd', '--date=short']).stdout.toString().trim() } catch {}
const sheet = factSheet(head || ref)
const SHEET = join(SITE, 'docs/site-facts.md')
const old = existsSync(SHEET) ? readFileSync(SHEET, 'utf8') : ''
if (old !== sheet) {
  if (CHECK) problems.push('docs/site-facts.md is out of date — run without --check')
  else writeFileSync(SHEET, sheet)
}

if (problems.length) {
  console.error(problems.map((x) => '✗ ' + x).join('\n'))
  if (CHECK) process.exit(1)
}
console.log(`${CHECK ? 'Checked' : 'Wrote'} ${pages.length} pages against the Factory at ${head}. ${problems.length} problem(s).`)
