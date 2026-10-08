# Portfolio

A React 19 + Vite portfolio with three complete design styles: monochrome frosted glass, soft sculpted clay, and tactile neumorphism. All support light and dark color modes. The Settings button opens an appearance panel with Day / Night, Design Style, and Motion categories on desktop and mobile. Choices are saved immediately; Done, Escape, or a click outside closes the panel.

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
- `src/context/ThemeContext.jsx` manages `designTheme` (`glass` / `clay` / `neumorphism`), `colorMode` (`light` / `dark`), and `effects` (`full` / `reduced`).
- `src/utils/preferences.js` validates and persists settings under `portfolio-appearance`, migrates the old `theme` setting, and applies root data attributes. Storage failure does not prevent theme switching.
- `src/styles/themes/glass.css`, `clay.css`, and `neumorphism.css` define semantic surface, text, border, shadow, radius, and control variables. Clay and Neumorphism also define layout and material variants.
- `src/components/ui.jsx` contains the shared `Surface`, `Button`, `Badge`, `Field`, `SectionHeading`, and `PortfolioImage` components.
- `src/index.css` contains shared component styles and responsive behavior. Tailwind's `dark:` variant follows the same `.dark` class as the selected color mode.

Changing the design preserves contact input, the selected journey tab, and the project page. Components with interaction state stay mounted. The hero adds a profile panel in Clay and Neumorphism modes; the journey, project, about, skills, and contact layouts also adapt.

To introduce another design, add its token stylesheet and layout rules, import that stylesheet in `index.css`, and add an option to the `designTheme` category in `src/config/appearance.js`. The settings UI, provider, and validation recognize it automatically. A `preview` value can select a CSS material thumbnail; previews live in `src/styles/settings.css`. Prefer CSS layout changes on existing content nodes; use a React variant only when the structure actually differs. Keep interaction state above any replaced subtree.

## Rendering and motion

There are no particle canvases, custom cursor loops, animated gradients, or blocking intro screens. Glass uses an Apple-inspired monochrome palette, system typography, static neutral lighting, fine reflective borders, and a silver profile illustration. Fixed backdrop blur is limited to navigation, the front profile pane, project cards, the about panel, and the contact panel (10px desktop, 6px mobile). The rear decorative pane, skill tiles, and timeline cards use gradients without blur. Controls inside surfaces do not add nested blur. Clay and Neumorphism use no backdrop blur. Neumorphism uses a continuous cool-gray material with paired light and dark shadows, raised panels, recessed inputs, and a circular inset portrait. Browsers without backdrop-filter support receive opaque surfaces.

Full motion consists of a brief hero entrance and small interaction transitions. Reduced motion disables animations, transitions, and smooth scrolling. The operating system's reduced-motion preference always takes precedence. Motion settings persist separately from design and color.

## Portfolio data and contact

Edit `src/data/fallbackPortfolio.json` to update the bundled content. It renders immediately while `src/services/apiService.js` fetches live data. Development uses the `/api` proxy in `vite.config.js`; production requests the configured API directly. Requests time out after six seconds and are cancelled on unmount. An unavailable API leaves saved content visible and provides a retry action in the footer.

Failed or missing images render a local, theme-aware initial placeholder without another network request. Skill icons are bundled SVGs, with a generic icon for unrecognized skills.

The contact form opens an email draft using `mailto:`. It does not send email or claim delivery. Form values remain available if the visitor cancels their email app. A delivery backend can be added separately.

## Verification

`npm test` covers appearance defaults, persisted preferences, legacy migration, invalid values, and blocked storage.

The browser integration check uses Node's built-in WebSocket client and a disposable Chrome profile; no browser-test dependency is required. In separate terminals:

```sh
npm run dev -- --host 127.0.0.1 --port 5175

google-chrome --headless --remote-debugging-port=9225 \
  --user-data-dir=/tmp/portfolio-theme-check about:blank

PORTFOLIO_URL=http://127.0.0.1:5175 npm run test:browser
```

Use a separate Chrome profile: the test clears local storage for the tested origin. It mocks the API, checks all six appearance combinations at 320, 390, 768, 1024, and 1440px, checks the settings dialog’s focus cycle, Escape/backdrop dismissal, radio-keyboard selection, state preservation and persistence, and exercises reduced motion, broken images, failed/stalled API requests, and blocked storage. Screenshots are written to `/tmp/portfolio-theme-screenshots`.

For runtime performance comparisons, record scrolling and idle time on the same device and browser. Bundle sizes alone do not establish frame-rate or battery improvements.
