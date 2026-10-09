# Portfolio

A React 19 + Vite portfolio with three complete design styles: monochrome frosted glass, soft sculpted clay, and tactile neumorphism. All support light and dark color modes. The Settings button opens an appearance panel with Day / Night and Design Style categories on desktop and mobile. Choices are saved immediately; Done, Escape, or a click outside closes the panel. The header and Done button remain visible while the compact option list scrolls on short screens.

## Development

Use Node.js 22.12+ (or a newer supported LTS release).

```sh
npm ci
npm run dev
npm run build
npm run preview
npm run lint
npm test
```

Vite prints the local URL. The production site is generated in `dist/`. This project uses Vite; the old Next.js configuration has been removed. The legacy tracked `out/` directory is not used by the app or lint checks.

## Appearance architecture

Clay is the default for visitors without a valid saved design preference. Previously saved choices are preserved.

- `src/config/appearance.js` is the shared catalog for settings categories and options. The panel, provider, and stored-preference validation all use it.
- `src/context/ThemeContext.jsx` manages `designTheme` (`glass` / `clay` / `neumorphism`), `colorMode` (`light` / `dark`).
- `src/utils/preferences.js` validates and persists settings under `portfolio-appearance`, migrates the old `theme` setting, and applies root data attributes. Storage failure does not prevent theme switching.
- `src/styles/themes/glass.css`, `clay.css`, and `neumorphism.css` define semantic surface, text, border, shadow, radius, and control variables. Clay and Neumorphism also define layout and material variants.
- `src/components/ui.jsx` contains the shared `Surface`, `Button`, `Badge`, `Field`, `SectionHeading`, and `PortfolioImage` components.
- `src/index.css` contains shared component styles and responsive behavior. Tailwind's `dark:` variant follows the same `.dark` class as the selected color mode.

Changing the design preserves contact input, the selected journey tab, and the project page. Components with interaction state stay mounted. The hero adds a profile panel in Clay and Neumorphism modes; the journey, project, about, skills, and contact layouts also adapt.

To introduce another design, add its token stylesheet and layout rules, import that stylesheet in `index.css`, and add an option to the `designTheme` category in `src/config/appearance.js`. The settings UI, provider, and validation recognize it automatically. A `preview` value can select a CSS material thumbnail; previews live in `src/styles/settings.css`. Prefer CSS layout changes on existing content nodes; use a React variant only when the structure actually differs. Keep interaction state above any replaced subtree.

## Rendering and motion

There are no particle canvases, custom cursor loops, animated gradients, or blocking intro screens. Glass uses an Apple-inspired monochrome palette, system typography, static neutral lighting, fine reflective borders, and a silver profile illustration. Fixed backdrop blur is limited to navigation, the front profile pane, project cards, the about panel, and the contact panel (10px desktop, 6px mobile). The rear decorative pane, skill tiles, and timeline cards use gradients without blur. Controls inside surfaces do not add nested blur. Clay and Neumorphism use no backdrop blur. Neumorphism uses a continuous cool-gray material with paired light and dark shadows, raised panels, recessed inputs, and a circular inset portrait. Browsers without backdrop-filter support receive opaque surfaces.

Motion follows the device's reduced-motion preference automatically; there is no Motion setting. Buttons use a brief press-and-release transition, anchor navigation scrolls smoothly, and sections reveal once per mount with an IntersectionObserver and a short Web Animation. Content is never hidden while waiting for JavaScript. Reduced motion cancels active reveals and disables transitions, animation, and smooth scrolling. Native page, Settings, and textarea scrollbars use theme colors, retain platform sizing, and use system colors in forced-color mode. Saved Surrealism choices migrate to Clay; legacy Motion choices are ignored.

## Portfolio data and contact

Edit `src/data/fallbackPortfolio.json` to update the bundled content. The provider first reads a validated local snapshot for the configured API endpoint, falling back to the bundled content when none is available. It refreshes from the API in the background on each mount and on Retry. A successful response replaces the displayed data and is cached with a schema version and fetch timestamp. Requests time out after six seconds and are cancelled on unmount. An unavailable or invalid API response keeps the last available content visible and offers Retry in the footer. Storage failure does not prevent rendering or live updates.

`src/utils/portfolioData.js` validates both live and cached data. A nonempty name is required, malformed collections reject the response, and invalid entries are omitted. Optional missing fields become empty rather than inheriting unrelated bundled values. URLs must be absolute HTTP(S) URLs; network-homepage social placeholders are omitted. Cache keys include the endpoint so different portfolio usernames do not share content. Snapshots remain available during outages regardless of age; they are revalidated on the next visit rather than silently treated as fresh.

Copy `.env.example` to `.env.local` to override `VITE_PORTFOLIO_USERNAME` or `VITE_PORTFOLIO_API_BASE_URL`. Restart Vite after editing these values; production requires rebuilding. They are public settings, not secrets. With no base override, development uses the `/api` proxy in `vite.config.js` and production requests PythonAnywhere directly.

Project images default to `contain` to avoid cutting off screenshot text. Optional API fields `imageFit: "cover"`, `imageWidth`, `imageHeight`, and `imageAlt` support photography and custom aspect ratios. Project pagination is available above and below the cards; the lower controls return to the section's start. Mobile profile cards use compact portraits instead of repeating a large photo and job title.

Backend follow-up (not implemented in this frontend repository): add stable IDs, ISO dates, `updatedAt`, skill categories, project ordering/featured flags, and explicit `Cache-Control` plus `ETag` or `Last-Modified` headers. Correct the live introduction's spelling in the CMS/API; editing bundled text does not change the live response. Keep a single portfolio request while the payload remains small.

Failed or missing images render a local, theme-aware initial placeholder without another network request. Skill icons are bundled SVGs, with a generic icon for unrecognized skills.

The contact form opens an email draft using `mailto:`. It does not send email or claim delivery. Form values remain available if the visitor cancels their email app. A delivery backend can be added separately.

## Verification

`npm test` covers appearance preferences, nested API validation, safe URLs, cache isolation/versioning, malformed snapshots, and blocked storage.

The browser integration check uses Node's built-in WebSocket client and a disposable Chrome profile; no browser-test dependency is required. In separate terminals:

```sh
npm run dev -- --host 127.0.0.1 --port 5175

google-chrome --headless --remote-debugging-port=9225 \
  --user-data-dir=/tmp/portfolio-theme-check about:blank

PORTFOLIO_URL=http://127.0.0.1:5175 npm run test:browser
```

Use a separate Chrome profile: the test clears local storage for the tested origin. It mocks the API, checks all six appearance combinations at 320, 390, 768, 1024, and 1440px, checks fixed dialog controls at 320×568, cached content during API failure and invalid responses, the settings dialog’s focus cycle, Escape/backdrop dismissal, radio-keyboard selection, state preservation and persistence, and exercises reduced motion, broken images, failed/stalled API requests, and blocked storage. Screenshots are written to `/tmp/portfolio-theme-screenshots`.

For runtime performance comparisons, record scrolling and idle time on the same device and browser. Bundle sizes alone do not establish frame-rate or battery improvements.
