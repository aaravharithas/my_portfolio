# Portfolio — Next.js

Skiper-inspired portfolio built to the supplied spec: Next.js App Router, TypeScript, Tailwind v4, shadcn/ui Command and Dialog, Motion and Lucide icons. Data comes from `https://portfolioapi.pythonanywhere.com/portfolio/aaravharithas/`.

## Run

Use Node.js 20.9 or newer (verified with Node 24).

```sh
npm ci
npm run dev
npm run typecheck
npm run build
npm start
```

Open http://localhost:3000. Google Fonts are downloaded at build time by `next/font` and served locally. The API must be reachable from the Next.js server.

## What's built

Styled to match skiper-ui.com (values measured from the live site; no Skiper assets, fonts or paid code).

- Tokens, fonts (Inter, League Spartan 700, Cinzel, Geist Mono), dark-only shell, hidden scrollbars, 200/300px section spacing.
- Floating 744×54 glass navbar; ⌘K / Ctrl+K / `/` opens an attached command palette (Pages, Links, Download CV, Copy email).
- Hero: #101010 → wavy blue edge → cyan floor built from a gradient plus seven drifting blurred layers (blue blobs, dark pockets, a bright plume), ending in a hard edge; slot-machine letter roll (6–22 copies per letter, server-randomised so it hydrates cleanly); `pip install <name>/backend` pill that copies the email; Download CV.
- Centred word-by-word blur headings on every section (no numbered eyebrows).
- About card with a scroll-linked colour reveal over a grainy monochrome copy.
- Work: Skiper-style bento (lg rows 275/322/322/322, areas `a b b c / d d e c / f f g g / h h g g`). Projects fill g → d → h → f → b → a → e → c; empty slots get playground tiles: Toolbox (drag/inertia icon wall), Stack (mini hover skills), Now (dynamic island), About (hover reveal), Find me (tooltip toolbar), Sticker trail, Current role. Projects beyond 8 flow into extra rows. An optional project `video` plays on hover.
- Experience as a narrow centred link list; rows expand to description and location.
- Skills: dashed dividers, CORE hover-skills (value ≥ 80: thumbnails grow, a huge Anton word swaps to the skill, a cursor circle shows the %), ALSO WORKS WITH row, CV link.
- Contact: three-step "devour" form (email → name → message) posting to `/api/contact` (validation, honeypot, 3/min per-IP limit, Resend).
- Vertical dock (md+) with a shared sliding tooltip and global shortcuts: C contact, L LinkedIn, G GitHub, I Instagram, E copy email, D CV, S copy link, ⌘K menu. A dynamic island under the navbar confirms copies, CV downloads and sent messages.
- Education as pricing-style cards with a cyan glow on the most recent one.
- Footer: scalloped laurel badge with rotating text ring and rotateY profile, scroll-driven side elements (3D hand renders from `public/footer/hand-left.png` / `hand-right.png` once both exist; CSS shapes until then), single credit line.
- Every looping animation (hero smoke, toolbox drift, island pulse, footer badge) pauses while off screen or in a background tab.
- `prefers-reduced-motion`: static name and background, no drift, spin or particle effects; reveals and scroll elements shown in their final state.
- Server fetch with one-hour revalidation, 20s timeout, loading skeleton and retry fallback.

## Contact form setup

Set these on the server (Vercel → Settings → Environment Variables). They never reach the browser.

- `RESEND_API_KEY`: Resend API key.
- `CONTACT_TO_EMAIL`: where messages are delivered.
- `CONTACT_FROM_EMAIL` (optional): a sender on your verified Resend domain. Defaults to `onboarding@resend.dev`, which only delivers to your own Resend account address.

Without the first two, development logs and returns success; production answers 503 "not set up yet".

## Structure

```text
app/
  globals.css  layout.tsx  page.tsx  loading.tsx  error.tsx
  cv/route.ts                 same-origin CV download
  api/contact/route.ts        contact POST: validation, honeypot, rate limit, Resend
components/
  navbar.tsx  hero.tsx  about.tsx  projects.tsx  experience.tsx
  skills.tsx  education.tsx  contact.tsx  footer.tsx
  section-heading.tsx         word-reveal heading
  pause-offscreen.tsx         pauses CSS loops while off screen / tab hidden
  portfolio-image.tsx  motion-provider.tsx
  skiper/                     bento-grid, tooltip-toolbar, vertical-dock, dynamic-island,
                              hover-skills, toolbox-wall, sticker-trail, image-reveal,
                              devour-input, skill-icon (Simple Icons map)
  ui/command.tsx  ui/dialog.tsx
lib/
  portfolio.ts                server fetch (server-only)
  portfolio-data.ts           normalisation, privacy projection
  bento.ts                    bento slot filling
  contact.ts                  contact validation (client + server)
  dates.ts                    date parsing, compact ranges
  navigation.ts               page anchors, safe/bare-domain URL filter
  utils.ts
types/portfolio.ts
tests/
  portfolio-data.test.mjs     unit tests (npm test)
  skiper.test.mjs             bento, contact validation, contact route (npm test)
  portfolio-browser.mjs       Chrome CDP checks (npm run test:browser)
```

The server loader projects only explicitly allowed fields. Birth date, address, postcode and phone are discarded before rendering or client serialization. Email is supplied only to the copy action; it is not visible text or a mailto link. This is a display rule, not a claim that the public API email is secret.

Bare-domain social links are omitted. The API has no profile GitHub field, so the GitHub command uses its first valid project repository. The CV route only retrieves media from the specified API host.

The API currently identifies the owner as Gaurav Sharma, username aaravharithas. The introduction typo `manily` still needs correction in the backend/CMS; this workspace has no backend write access.

## Retained Vite implementation

`src/`, the Vite configuration, assets and the old tests remain intact. Use `npm run dev:legacy`, `npm run build:legacy`, `npm run test:legacy` and `npm run test:browser:legacy` for that app. Its documentation is preserved in [docs/LEGACY_VITE.md](docs/LEGACY_VITE.md).

## Verification

`npm test`, `npm run typecheck`, `npm run lint` and `npm run build` validate the app. The browser check uses system Chrome and Node's built-in WebSocket:

```sh
npm run build && npm start -- --hostname 127.0.0.1 --port 3005
google-chrome --headless --no-first-run --remote-debugging-port=9226 --user-data-dir=/tmp/portfolio-chrome about:blank
npm run test:browser
```

Run the three commands in separate terminals. Checks cover 375, 768 and 1280px overflow, palette alignment, shortcuts, focus restoration, search, anchor navigation, copy success/failure, hidden email text, outside dismissal, reduced motion (marquee, badge, blobs, letter roll), absence of private API fields from the HTML/RSC payload, and runtime exceptions. Screenshots go to `/tmp/portfolio-foundation-screenshots/`.
