# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Lunorb — project specifics

Lunorb is an AI-workspace product: a directory of 750 tools, guided "everyday" playbooks, a branching workflow builder, a projects board, community, learning, workspace and insights, over an animated aurora-and-mountains background. The frontend is static vanilla HTML/CSS/JS with no build step (`public/`). Accounts and data are on Supabase, payments on Stripe, and hosting plus serverless functions on Netlify (`netlify/`).

**Where this conflicts with the generic recreation workflow below, this section wins:** the project uses split CSS/JS files (not Tailwind, not inline), it loads Google Fonts and favicon services over the network on purpose, and the user keeps adding features on top of the reference screenshots. Keep the established aurora visual language. The user explicitly asked that the aurora canvas rendering stay unchanged. Mountain/scenery tweaks are fine.

**Product honesty rule.** This is a real product, so never show invented numbers: no fake ratings or reviews, follower or like counts, notifications, streaks or analytics. Show real data from `S.d` or Supabase. Where real data doesn't exist yet, show an honest empty state or the `Pending` pill (`.pending`, `pendingCard()`). Anything simulated must be labelled (the bento latency chart and terminal are).

## Live setup

Production is https://lunorb.netlify.app (Netlify project `lunorb`). It deploys automatically on every push to `main` of https://github.com/dylanzane2980/LUNORB; `npx netlify deploy --prod` also works. Server secrets are Netlify environment variables, and the Stripe webhook (test mode) points at `/api/stripe-webhook`. Netlify team login protection was turned off on request so the site and webhook are public. Netlify injects a free-tier "Powered by Netlify" badge script after `</body>`; `globe.js` adds `body.nf-badge` on DOMContentLoaded to lift the Ask Lunorb button above it.

## Layout

```
public/            static site (Netlify publish dir) — index.html, css/, js/, data/, img/, vendor/
netlify/functions/ checkout, portal, stripe-webhook, pricing, account-delete  → served at /api/*
netlify/lib/       server.mjs: Stripe + Supabase service-role clients, auth check, JSON helpers
supabase/schema.sql  tables, row-level security, column grants, triggers, creators view (idempotent)
scripts/check.mjs  deploy-readiness smoke test
.env               local secrets (gitignored). .env.example lists every variable.
```

## Commands

```sh
npm install                      # function dependencies: stripe, @supabase/supabase-js
npx netlify-cli dev              # site + functions on http://localhost:8888 (reads .env)
npm run check                    # calls the real functions in-process: Stripe price, auth refusal, webhook signature, Supabase tables
for f in public/js/*.js netlify/functions/*.mjs netlify/lib/*.mjs; do node --check "$f"; done
cp node_modules/@supabase/supabase-js/dist/umd/supabase.js public/vendor/   # after upgrading supabase-js
```

Opening `public/index.html` directly (file://) still works in **local mode**: with no `supabaseUrl` in `public/js/config.js`, there is no sign-in and state stays in localStorage. `/api/*` only exists under `netlify dev` or on Netlify.

URL hooks: `?still` disables entrance animations; `?q=` fills the search; `?tool=Claude` opens the tool drawer; `?pb=trip` opens a playbook runner; `?ask=…` opens Ask Lunorb; `?wf=<uuid>` opens a shared workflow; `?checkout=success|cancel` is Stripe's return. Headless Chrome won't render narrower than ~500px, so check "mobile" at ~520px. To screenshot signed-in screens without a backend, serve `public/` over http and use puppeteer request interception to replace `vendor/supabase.js` with a fake `createClient` and `js/config.js` with a dummy URL.

## Architecture

**Script order matters** (classic `<script>` tags sharing one global scope): `data/tools.js` → `js/app.js` → `js/features.js` → `js/life.js` → `js/bento.js` → `js/globe.js` → `vendor/supabase.js` → `js/config.js` → `js/cloud.js` → `js/boot.js`. Later files read earlier `const`s directly. Earlier files may call later functions only at runtime. `boot.js` must stay last: it awaits `cloudInit()` and only then renders the first page (or the auth page).

- `app.js`: core. Icons (`P`/`ic`), `logoHTML`, toast, hash router `go(name)`, home search, the workflow builder (`wf`, `LIB`, `TPL`, `stagesOf`, `renderFlow`, zoom, stage-by-stage Preview), insights (from `S.d.daily`/`S.d.catUse`), and the scene: the aurora canvas in `makeScene().draw` (leave it alone) plus `sceneSVG`, which composes the photo mountains (`MTN`, `img/mountains-night.webp` and its pre-baked reflection `img/mountains-reflect.webp`), haze, the foreground ridge (`ridge`), trees (`trees`) and the lake. Meteors in `drawSky` are time-based, appearing every 3–9 s at any frame rate.
- `features.js`: builds `ALL` (750 tool objects) and `CATS` from `window.LUNORB_DATA`, plus `searchTools`, persisted state `S`, usage tracking (`dayKey`, `track`, `log`), the tool drawer `openTool`, the palette, the goal finder, notifications (`notify`), and the Discover, Projects, Community (`COMMUNITY`, `renderCreators`, `renderPopWf`), Learn and Workspace pages.
- `life.js`: Everyday page. Research stats, `PLAYBOOKS`, curated `INSIGHTS` with sources, the guided runner `openRunner` (branch-aware `{{prev}}`), the Ask Lunorb helper, the compare view, and the builder step panel (parallel toggle `#pnPar`).
- `bento.js`: the “Your AI stack” bento on Home (vanilla port of a React TechStackBento). Glow cards, a simulated latency chart and `lunorb.sh` terminal, progress rings from `S.d`, the saved-tools stack. Timers only run while Home is visible. Keep terminal lines under ~27 characters.
- `globe.js`: the Ask Lunorb globe: a canvas-drawn rotating globe with an orbit ring, used for every `canvas.globe` (helper button, mobile tab bar, boot loader). It spins faster on hover.
- `cloud.js`: everything backend. It gates the router to `#p-auth` while signed out (`gated`), renders the auth card (sign in, sign up, reset, set new password, check email), and syncs `S.d` to `user_state` (debounced, with a keepalive flush on hide). It also handles workflows in Supabase (it overrides `store.get/remove` and the Save button; the free limit comes back as a `FREE_LIMIT` error and opens billing), publish/unpublish and share links, community data, follows and likes, billing (`openBilling` → `/api/checkout` or `/api/portal`), account settings and deletion. `cleanStep`/`sanitizeSteps` must run on every workflow loaded from the database, because shared workflows are other people's data.

**Workflow stages.** `wf.s` is a flat list. A step object with `par:true` runs alongside the step above it, and consecutive parallel steps form one stage (`stagesOf`). Use `removeStep` (it un-parallels the next sibling when a stage head is deleted). Templates mark parallel indices with `TPL[k].par`. In the runner, `{{prev}}` is the combined notes of the previous stage.

**Extension by wrapping.** Later modules extend earlier behaviour by reassigning top-level function declarations, e.g. `const _openTool=openTool; openTool=function(k){_openTool(k); …}`. This is used for `openTool`, `renderFlow`, `go` (life.js, bento.js, cloud.js), `closeOverlays`, `loadTpl` and `addToolStep`. Community hooks (`followCreator`, `likeShared`, `shareWorkflow`) are top-level `let`s in features.js that cloud.js reassigns. It only works for `function` declarations and `let`, not `const`.

**Routing.** Each page is `<section class="page" id="p-NAME">`. `go(name)` toggles `.on`, calls `ENTER[name]`, applies `TABS[name](tab)` when a link carries `data-tab`, and calls `sceneFor(name)`. `body.gate` (auth page) hides nav links, the helper button and the tab bar. Adding a page means adding the section, a nav link, an `ENTER` hook, an `SCN` entry, and renumbering the `NN / 09` footers.

**Event delegation via `data-*`.** A capture-phase document listener in `features.js` handles `data-save`, `data-open` (tool id), `data-tool` (tool name), `data-cat`, `data-addstep` and `data-act`. `life.js` adds `data-pb` and `data-compare`; community uses `data-usewf`, `data-usecwf`, `data-clike`, `data-sharewf`. These names are global (the insights donut uses `data-icat`). Don't store state in `data-*` attributes on a container whose children are matched with `closest()` by the same attribute name (the step menu uses `data-addmode` for this reason).

**Data shapes.** Tool tuples in `data/tools.js` become `{id, n, ci, sub, desc, best, free, url, aud[], api, c, m, g, rank}`; there are no ratings. Workflow steps are `LIB` keys (strings) or `{i,t,d,tool,c,r,prompt,par}`; always read them through `stepOf()` and escape `t`/`d`/`r`/`tool` when rendering.

**State.** `S.d` (saved, likes, notes, board, goals, lesson, runs, activity, recent, daily, catUse, toolUse) persists to `localStorage['lunorb.v2']` and, when signed in, to Supabase `user_state`. New accounts start from `CLEAN()` in cloud.js, not the demo defaults in features.js. Saved workflows are `localStorage['lunorb.wf']` in local mode and the `workflows` table when signed in.

**Backend rules.** Secrets live only in `.env` and Netlify env vars (`SUPABASE_URL`, `SUPABASE_SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_PRICE_PRO`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PORTAL_CONFIGURATION`, `SITE_URL`, `ANTHROPIC_API_KEY`). The browser only gets the Supabase URL and publishable key (`public/js/config.js`). Every table has RLS. Members can't write `likes_count`, `plan`, Stripe IDs or owners (column grants). Only the webhook, using the service role, writes `subscriptions`. The free limit (3 saved workflows) is enforced by the `enforce_workflow_limit` trigger. The webhook re-fetches the subscription from Stripe on every event. Supabase Auth's Site URL and Redirect URLs must include the deployed URL and `http://localhost:8888`.

**Logos.** `logoHTML` loads `google.com/s2/favicons?domain=…&sz=128`. A result under 32px is Google's generic placeholder, so it retries DuckDuckGo's icon service, then falls back to the coloured monogram.

**CSS layers.** `css/styles.css` holds the original design and tokens (`--bg`, `--blue`, `.glass`, `.btn`, …). `features.css`, `life.css` and `bento.css` hold later components. `app.css` holds the product layer: photo cards, pending states, globe, flowchart stages and zoom, auth, plans, account. Generic element selectors in `styles.css` leak into new markup (e.g. buttons centre their content vertically, so card-like buttons need `display:flex;flex-direction:column`).

**Scene performance (important).** Don't put SVG filters (`feTurbulence`, `feDiffuseLighting`, displacement) into `sceneSVG`. They forced a repaint on every aurora frame and dropped the frame rate from about 22 fps to 6. Bake any realism into images instead. `.scene svg` has `will-change:transform`.

**Images and credits.** `public/img/media/*.webp` are card images: the prompt cards, the Lunorb-pick workflow covers and the collection thumbnails. Three came from the user (`prompt-*`, `wf-cinematic`). `prompt-cyber-city` and `wf-cinematic` are crops of official Cyberpunk 2077 art, and `prompt-city-dusk` is from a wallpaper site, so they need licensing or replacing before a commercial launch. The rest are from Wikimedia Commons: NASA (public domain) for `col-ai-for-good` and `col-dreamscapes`; CC0 for `wf-brand-visuals` (Pierre Blaché) and `wf-game-assets` (Wikideas1); CC BY 4.0 for `col-cyber-realms` (Acediscovery) and `col-creator-essentials` (Myotus), which need attribution. The mountain photo is adapted from “Snow Dome + Dome Glacier” by Qyd (CC BY-SA 3.0) and credited under the Home footer (`.credit`). It's drawn at `x:-120,w:1840` (overscan); even-seeded pages mirror it.

`index.v1.bak.html` (repo root) is the original single-file version, kept for reference only. Nothing loads it.

---

# Reference-accurate website recreation (generic workflow)

## Mission

Recreate a website or page from the user's reference screenshot as faithfully as possible. Treat the screenshot as the visual source of truth. The goal is **reproduction, not redesign**.

Success means the implementation matches the reference's visible content, layout, typography, spacing, colors, imagery, borders, shadows, and responsive behavior as closely as the available evidence permits.

## Non-Negotiable Rules

- Do not invent, remove, rewrite, rearrange, or “improve” visible content, sections, features, or interactions.
- Do not substitute your personal design preferences for evidence in the reference.
- Do not stop after the first implementation. Render, compare, correct, and render again.
- Do not claim a screenshot was captured, a test passed, or a visual match was achieved unless you actually verified it.
- Keep existing project conventions and working functionality unless the user explicitly asks to change them.
- Make the smallest change that fixes each mismatch. Avoid unrelated refactors.
- If an important detail cannot be determined from the screenshot, make the least-assumptive choice and report the uncertainty rather than inventing specificity.

## Instruction Priority

When requirements conflict, use this order:

1. The user's explicit instructions for the current task.
2. The supplied screenshot(s) and assets.
3. User-supplied design tokens, CSS, copy, and implementation constraints.
4. Existing project conventions and architecture.
5. The defaults in this file.

Use the reference image to determine what should be visible. Use explicit user instructions to resolve any requested differences from that image.

## Trigger and Inputs

Use this workflow whenever the user supplies a screenshot, mockup, or visual reference and asks to recreate, clone, reproduce, or closely match it.

Inspect all available inputs before editing:

- Reference screenshot(s), including their dimensions and visible viewport.
- User-supplied CSS, design tokens, written notes, copy, logos, icons, and image assets.
- Existing source files, components, stylesheets, package scripts, and project structure.
- Available browser, screenshot, and visual-diff tools.

Do not ask the user to provide information that is already present in the files or screenshot. Ask a concise question only when a missing detail blocks a meaningful implementation; otherwise proceed using a clearly stated, low-risk assumption.

## Phase 1 — Inspect Before Building

1. Identify the current working directory and inspect the repository before creating or changing files.
2. Detect the existing framework, package manager, entry point, routing, styling system, and available test/screenshot commands.
3. Reuse the existing stack and components when practical. Do not replace a working app with a standalone page merely because the default below is simpler.
4. If the project is empty or the user explicitly requests a standalone recreation, default to one `index.html` using Tailwind CSS via CDN. Keep CSS and JavaScript inline unless separate files are requested or clearly necessary.
5. Check which assets already exist. Reuse them before sourcing or generating replacements. Preserve relevant filenames and paths.
6. Record the target screenshot's width, height, aspect ratio, crop, and apparent device context. Distinguish the actual page from browser chrome or margins surrounding the screenshot.

Before coding, form a compact visual inventory:

- Overall canvas, page background, content width, and alignment.
- Header, navigation, hero, content sections, cards, footer, and their order.
- Major columns, grids, gaps, gutters, and section heights.
- Typography: likely family, size, weight, line height, letter spacing, wrapping, and text width.
- Color palette, gradients, image crops, borders, corner radii, shadows, and overlays.
- Icon style, size, alignment, and placement.
- Visible interaction states and any responsive evidence.

Treat the inventory as an implementation checklist, not permission to add missing content.

## Phase 2 — Translate the Screenshot into Measurable Constraints

- Start with large-scale geometry before tuning small details.
- Estimate key dimensions from the screenshot: outer margins, maximum content width, section spacing, card dimensions, column ratios, and alignment anchors.
- Identify repeated design values and express them as reusable CSS variables or existing design tokens where this improves consistency without adding unnecessary abstraction.
- Match text wrapping intentionally. Text width, font metrics, line height, and letter spacing can change the geometry of the entire page.
- Use stable layout primitives such as Grid and Flexbox where they fit the reference. Avoid arbitrary absolute positioning for normal document flow; use it only where the design calls for layering or anchoring.
- Preserve the reference's visual hierarchy even when the underlying semantic markup differs.
- If several screenshots show different sections or states, map each one to the corresponding page state or viewport before implementation.

## Phase 3 — Build

### Architecture and styling

- Follow the project's existing conventions, component boundaries, lint rules, and naming patterns.
- Prefer the project's existing styling solution. For a standalone page, Tailwind CDN is the default; use custom CSS for precise details that are awkward or unclear in utility classes.
- Keep the implementation readable and easy to adjust. Do not compress the entire page into an unreadable one-liner.
- Use semantic HTML where appropriate, without compromising the reference layout.
- Avoid unnecessary dependencies, plugins, build systems, or framework migrations.
- Do not replace real project functionality with visual mockups unless the user requests a static recreation.

### Text, icons, and assets

- Preserve supplied copy verbatim, including capitalization, punctuation, labels, prices, and line breaks when these are visibly intentional.
- Do not generate filler text to occupy space when the reference content can be reproduced.
- Prefer exact supplied images, logos, and icons. For image crops, adjust `object-fit`, `object-position`, aspect ratio, and container dimensions before changing the source asset.
- Do not use an emoji as a substitute for a branded icon or logo.
- Do not invent a brand asset or fetch an unrelated image just because it looks attractive.
- If an original asset is unavailable, use a neutral placeholder only if necessary to preserve layout. Match its dimensions and crop, and report the missing asset in the final summary.
- Do not introduce external fonts, scripts, image hosts, or other network dependencies unless they are already used by the project, supplied by the user, or required and acceptable for the task.

### Visual restraint

- No extra sections, content, badges, animations, gradients, decorative elements, testimonials, buttons, or cards unless they appear in the reference or are explicitly requested.
- Do not “modernize,” simplify, embellish, or rebrand the design.
- Do not hide a mismatch with overlays or hacks that break other viewports or content flow.
- Preserve existing behavior and accessibility basics where possible. Do not claim a control works if no real action has been implemented.

## Phase 4 — Render a Baseline Screenshot

After the first implementation, run the page and capture a screenshot using the best tool already available in the project, such as Playwright, Puppeteer, or an existing browser workflow.

- Reproduce the reference viewport dimensions as closely as possible for the primary comparison.
- Keep browser zoom at 100% and use a consistent browser/engine, viewport, device scale factor, and font-loading state across comparison rounds.
- Wait for fonts and images to finish loading before capture. Avoid arbitrary long sleeps when a meaningful readiness condition is available.
- Capture the full page when the reference covers a full page; also capture individual sections when that makes comparison more reliable.
- Record the command used and where the screenshot was saved, when practical.
- If the environment prevents automated screenshots, use an available browser workflow. If no reliable capture method is available, state that limitation and do not pretend visual verification occurred.

Do not change the reference target to make the implementation look better. Match the implementation to the reference.

## Phase 5 — Compare Systematically

Compare the rendered output against the reference at the same scale and viewport. Use side-by-side inspection and, when available, a transparent overlay or pixel-difference image. Automated pixel diffs are evidence, not a complete measure of visual quality; browser rendering and font rasterization can create harmless noise.

Inspect differences in this order:

1. **Structure:** missing or extra sections, overall page silhouette, content order, and major containers.
2. **Geometry:** content width, margins, section heights, columns, alignment, card dimensions, and image aspect ratios.
3. **Typography:** font family, size, weight, line height, line wrapping, letter spacing, and baseline alignment.
4. **Spacing:** padding, margins, grid gaps, and whitespace distribution.
5. **Color and surfaces:** exact or visually closest colors, gradients, borders, radii, shadows, and overlays.
6. **Assets and details:** image crop, logos, icon size, icon stroke/weight, and subtle alignment.
7. **Responsive behavior:** overflow, wrapping, stacking, and breakpoint transitions where the evidence supports them.

When useful, maintain a short mismatch list with concrete observations, for example:

- Main container is about 40 px too wide.
- Heading wraps to three lines instead of two.
- Card gap is visibly smaller than the reference.
- Hero image subject is positioned too far to the left.

Fix the highest-impact mismatches first. Do not randomly tweak unrelated CSS properties.

## Phase 6 — Iterate Until the Result Is Credibly Close

- Complete at least **two full render-and-compare rounds**. One implementation pass is not sufficient.
- After each comparison, fix the largest remaining mismatches and capture a fresh screenshot; never assume the previous capture reflects the latest code.
- Recheck earlier sections after global changes to fonts, widths, spacing tokens, or breakpoints.
- Prefer a few deliberate corrections over many untracked micro-adjustments.
- Stop when all visible high-impact mismatches are resolved and the remaining differences are minor or attributable to unavailable assets or rendering-environment limits.
- If substantial mismatches remain after several rounds, continue if feasible. If blocked, explain exactly what remains and why; do not label it pixel-perfect.

## Responsive Verification

The supplied reference viewport is the primary fidelity target.

- If the user supplies mobile and desktop references, reproduce and test each independently.
- If the reference implies a responsive page but provides only one viewport, preserve that viewport first, then check that nearby and common viewport sizes do not create obvious breakage.
- Unless the project specifies other targets, use approximately 390 × 844 for a mobile sanity check and 1440 × 900 for a desktop sanity check when relevant.
- Do not invent a different mobile design unsupported by evidence. Use conservative reflow rules that preserve the same hierarchy and content.
- Check for horizontal scrolling, clipped content, unexpected wrapping, overlapping elements, collapsed navigation, and images with distorted proportions.
- Responsive sanity checks must not degrade fidelity at the reference dimensions.

## Functional and Technical Checks

Run the checks that are available and relevant to the changed files:

- Confirm the app starts or the standalone HTML page loads.
- Check the browser console for new errors and failed asset requests.
- Check for missing images, fonts, icons, and other resources.
- Verify links, buttons, menus, and controls that are visible and intended to work; do not invent backend behavior.
- Run the existing lint, typecheck, build, or focused tests where available.
- Check common viewport overflow and obvious layout breakage.
- Review the final diff for accidental changes, dead code, debug artifacts, and unrelated formatting churn.

Do not install new packages or make destructive project changes without a clear need. If a command fails, identify the actual failure and distinguish it from failures caused by the environment.

## Definition of Done

The task is not complete until all applicable items below are true:

- [ ] Only the sections and content supported by the reference or user instructions are present.
- [ ] Major layout, sizing, alignment, typography, spacing, colors, imagery, and surface treatments have been compared against the reference.
- [ ] At least two render-and-compare rounds have been completed, or a real environment limitation has been documented.
- [ ] The primary screenshot was captured at the reference viewport when tooling allowed it.
- [ ] Relevant responsive checks have been completed.
- [ ] No new console errors or broken assets remain unexplained.
- [ ] Relevant available build, type, lint, or test checks have been run.
- [ ] The implementation and final report do not claim verification that was not performed.

A numeric pixel tolerance is not a substitute for visual judgment. Aim for near-identical geometry and styling, but be honest about differences caused by missing source assets, unavailable fonts, browser engines, or reference-image limitations.

## Final Response Format

Keep the final report concise and factual. Include:

1. **Implemented:** what page or sections were recreated and which files changed.
2. **Verification:** the actual screenshot commands, viewport(s), tests, and checks performed.
3. **Remaining differences:** only real, unresolved mismatches or environmental limitations.
4. **Artifacts:** paths to rendered screenshots or comparison images, when generated.

Never say “pixel-perfect,” “fully tested,” or “all differences fixed” unless the evidence supports that statement.

## Default Task Sequence

For each screenshot recreation task, follow this sequence unless the user explicitly requests a different workflow:

1. Inspect the reference, assets, and existing project.
2. Record the primary viewport and the major visual constraints.
3. Implement the smallest faithful version using the appropriate existing stack.
4. Render the baseline screenshot.
5. Compare in priority order and record concrete mismatches.
6. Fix the highest-impact mismatches.
7. Render and compare again; repeat as needed.
8. Run applicable technical and responsive checks.
9. Review the final diff and report verified results and unresolved gaps.
