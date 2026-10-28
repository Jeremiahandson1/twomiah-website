# Site claims pass — 2026-10-28 (branch `cloud/site-claims`)

Line numbers are in the files as they stand on this branch.

## 1. 30-day money-back guarantee (stays)
- `terms.html:224-225` §4.5 Refunds rewritten: full refund of subscription fees if asked within 30 days of first payment (email support@twomiah.com). Already-paid-out at-cost third-party charges (domain registration, texting/AI usage) are not refundable. After 30 days: non-refundable except where law requires; no prorating.
- `terms.html:168` "Last Updated" → October 28, 2026 (Effective Date unchanged). Rest of Terms untouched.

## 2. Custom Dev / support contract removed
- `build.html:590` add-ons grid now 3 columns; `build.html:593` "Support Contract $199/mo" card → "Support — Free — Support is free — email us or ask in your CRM's help chat."; "Custom Dev $150/hr" card deleted.
- `care.html:659,662` same change.
- `roof.html:585`, `wrench.html:632` "Support included on every tier" → "Support is free — email us or ask in your CRM's help chat".
- The $499 one-time custom build is left as is (signup pages, `index.html:608`).
- Grep for `150/hr`, `$199/mo` support and "call support" now finds nothing. (`$199` elsewhere is the 50-user plan price.)

## 3. Feature tiers removed
- JS tier maps and colour maps deleted (`buildTiers`, `careTiers`, `roofTiers`, `wrenchTiers`, `leafTiers`, `tierColors`) and the "ENTERPRISE" badge branch they fed: `build.html:442-446`, `care.html:530-537`, `roof.html:475-482`, `wrench.html:523-530`, `leaf.html:671-673`.
- Comparison "Starting Price" cell no longer colour-codes $99 / $139 / $199 like tiers: `build.html:457,467`, `care.html:537`, `leaf.html:683`, `roof.html:479`, `wrench.html:527`.
- `feat-tag` badges ("All Tiers", "Starter +", "Pro +", "Business +") deleted: `roof.html:393-413` (5), `wrench.html:391-431` (10).
- "nothing tier-locked" → "Every X feature included": `build.html:490,505,520`, `care.html:559,574,589`, `roof.html:505,521,537`, `wrench.html:553,569,585`, `leaf.html:707,723,739`; `index.html:600,602`.
- `index.html:571` "no tiers, no upsells" → "no upsells". `wrench.html:374` "at every tier" → "on every plan". `leaf.html:694` "No Tier Games." → "Pick Your Team Size." `mission.html:240` "Flat tiers…isn't a tier" → "Flat prices…isn't an upsell".
- Kept deliberately: plan names Starter / Team / Business (they are the 10 / 25 / 50-user sizes, same in signup), the "4-tier" loyalty program on `leaf.html:523-525` (a customer-loyalty feature), the "Grower/Consumer transparency tier" on `apps.html:225-226` (a different product).
- **Owner decision needed:** Leaf had four rows (cultivation, mfg, wholesale, lab) badged "ENTERPRISE". With tiers gone they now show ✗ ("not offered") in the comparison table, `leaf.html:673`. Change to ✓ if Leaf really includes them.

## 4. EVV / Sandata
Only claim now: caregivers clock in on the Twomiah Care app; clocking in opens the Sandata app, which records the EVV visit for the state.
- `care.html:6,15,26` title / og:title / twitter:description, `care.html:7` + `care.html:16` meta/og description: "EVV" removed.
- `care.html:38` JSON-LD: "EVV compliance integration" removed.
- `care.html:331` hero: "Scheduling, EVV, compliance…" → "Scheduling, compliance…".
- `care.html:348,355` mock dashboard: "EVV" nav item and "98% EVV Rate" stat removed (stat row is 2 columns, `care.html:98`).
- `care.html:376` stat "EVV / Built In" → "Clock-In / Opens Sandata". `care.html:120` stat labels lightened to rgba .62 for 4.5:1 contrast.
- `care.html:399` "Clients, caregivers, EVV, Medicare/Medicaid…" → EVV dropped.
- `care.html:427` "Hours auto-calculated from EVV data." removed.
- `care.html:429` "GPS-verified EVV built in…" → clock-in → Sandata sentence.
- `care.html:440` "built in, not bolted on. EVV, documentation…" → "documentation and reporting for state and federal requirements."
- `care.html:450` compliance item "Electronic Visit Verification / GPS-verified… Cures Act" → "Clock-In & Sandata" + the flow sentence.
- `care.html:463` "EVV Compliance Rate 98.2%" row removed.
- `care.html:534` comparison table: Care's cell for Electronic Visit Verification is now "VIA SANDATA APP", not ✓.
- `businesses.html:337` Care card: EVV compliance → the clock-in → Sandata sentence.
- `mission.html:235` "should know about EVV compliance" → "should fit how caregivers clock in for the state" (not on your list; it implied an EVV feature).

## 5. Competitor comparison (`index.html`)
- `index.html:612` label "What the others charge · as of October 2026".
- `index.html:615` Podium: "website + messaging" → "messaging and reviews"; $399–599/mo.
- `index.html:616` Jobber Plus: added "monthly billing"; $499/mo.
- `index.html:617` "All-in-one resellers" row → "GoHighLevel · its own agency plans" $297–497/mo.
- `index.html:505` the same $297–$497 figure removed from the "agencies reselling" sentence.
- `index.html:620` + CSS `index.html:219-220` sources line: contractortoolstack.com (checked vs Jobber's page Sept 10, 2026), capterra.com/p/164285/Podium/pricing (Podium publishes no prices), gohighlevel.com/pricing.
- **Please verify:** the gohighlevel.com/pricing link and the $297 / $497 plan prices are from my knowledge, not checked live (no network access to that site here).

## Seen, not changed (outside the five decisions)
- `index.html:505` still says resellers are "on contracts, marking up every text" — no source.
- `index.html` Jobber "CRM, no website" and "Triple the price" (the table shows ~5x) — unsourced.
- `build/care/roof/wrench/leaf` banners and compare tables ("Competitors charge more for less", "$150+/user/mo", competitor feature ticks) carry no dated sources.
- `care.html` Medicare/Medicaid claims line, HIPAA / 21st Century Cures wording elsewhere.
- `sub-processors.html:270` lists Sandata as a sub-processor receiving visit records and patient identifiers. If Twomiah does not send data to Sandata, this is wrong too.
- Pre-existing low-contrast small grey text on dark add-on cards (`build.html:591-592`) and a white mobile hamburger on the cream `care.html` header.

## Rendering check
Playwright headless Chromium: desktop 1440×900 and iPhone 13 emulation 390×844 of index, build, care, roof, wrench, leaf, businesses, mission, terms. No horizontal overflow, no JS errors. Region crops opened and checked by eye: index comparison (both widths), care hero/stats/feature/compliance/add-ons/comparison table, build add-ons, wrench features, leaf pricing, businesses, mission, terms §4.5. Not opened as images: roof/wrench pricing cards, build pricing, and the phone crops of leaf, wrench, businesses, mission and terms (the overflow check passed on them).
