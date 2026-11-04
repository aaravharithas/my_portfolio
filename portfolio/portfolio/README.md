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
- Hero: skiper-ui.com's looping background video (`public/hero/loopbg.mp4`, poster `loopbg-poster.jpg`), fading and rising in after the name roll, paused off screen and with reduced motion. Slot-machine letter roll (6–22 copies per letter, server-randomised so it hydrates cleanly); `pip install <name>/backend` pill that copies the email; Download CV. The video, like the footer hands, is Skiper UI's asset: replace it if you don't have their permission.
- Centred word-by-word blur headings on every section (no numbered eyebrows).
- About card with a scroll-linked colour reveal over a grainy monochrome copy.
- Work: projects only, in Skiper's card grid, mixing big squares, tall and wide rectangles and small squares without gaps for any count (`lib/bento.ts`). Two-row blocks hold four projects (2×2, 1×2, 1×1, 1×1) or three (2×2, 2×1, 2×1), with the big tile alternating sides. Two projects show a big square beside a tall tile; one shows a big square. Details (metadata, description, tech) show on hover/focus, or always on touch screens. An optional project `video` plays on hover.
- Playzone: the interactive toys, kept out of the Work grid. A drag/inertia icon wall, a big sticker-trail canvas (mouse, or a finger dragged sideways) and a hover colour reveal.
- Experience as a narrow centred link list; rows expand to description and location.
- Skills: every skill in the hover row (thumbnails grow and the huge Anton word swaps to the skill in its brand colour, while a cursor circle shows the %). A REACH ME row follows: LinkedIn, Phone and Email, each showing its value on hover/focus and opening the link, dialler or mail app.
- Contact: three-step "devour" form (email → name → message) posting to `/api/contact` (validation, honeypot, 3/min per-IP limit, Resend).
- Vertical dock (md+) with a shared sliding tooltip and global shortcuts: C contact, L LinkedIn, G GitHub, I Instagram, E copy email, D CV, S copy link, ⌘K menu. A dynamic island under the navbar confirms copies, CV downloads and sent messages.
- Education as pricing-style cards with a cyan glow on the most recent one.
- Footer: static scalloped laurel badge with your photo; like skiper-ui.com it flips in when it comes into view and spins once on hover, with no continuous motion. Two hands (`public/footer/hand-left.png`, `hand-right.png`) tip, scale and fade in from the sides, matching skiper-ui.com's footer. The hand images are Skiper UI's own renders: replace those two files with your own if you don't have their permission. Single credit line.
- Every looping animation (hero video, toolbox drift, island pulse) pauses while off screen or in a background tab.
- CV downloads in two places: the hero's `pip install <name>/resume` pill and the navbar icon, plus ⌘K and the `D` shortcut.
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

The server loader projects only explicitly allowed fields. Birth date, address and postcode are discarded before rendering or client serialization. By the owner's choice, phone and email are public: they appear in the Skills REACH ME row as tel:/mailto: links. This is a display rule, not a claim that the public API email is secret.

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
