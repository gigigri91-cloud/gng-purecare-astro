# GNG PureCare — versiune Astro

Site-ul GNG PureCare convertit în [Astro](https://astro.build) cu Tailwind CSS v4.
Generează HTML 100% static — perfect pentru hosting pe Cloudflare Pages, Netlify, Vercel sau GitHub Pages.

## Instalare

```bash
cd astro-site
npm install
```

## Dezvoltare

```bash
npm run dev
# deschide http://localhost:4321
```

## Build pentru producție

```bash
npm run build
# rezultatul este în ./dist (HTML static + assets)
```

## Deploy

### Cloudflare Pages
1. Push pe GitHub
2. Cloudflare Dashboard → Workers & Pages → Create → Connect to Git
3. Build command: `npm run build` · Output directory: `dist`

### Netlify / Vercel
Detectare automată a Astro — doar conectează repo-ul.

### GitHub Pages
Push directorul `dist/` pe branch-ul `gh-pages` sau folosește GitHub Actions.

## Structură

```
astro-site/
├── public/images/        # Toate imaginile site-ului
├── src/
│   ├── components/       # Header, Footer, ContactForm, Icon
│   ├── layouts/Layout.astro
│   ├── pages/            # index, servicii, despre, contact, confidentialitate
│   └── styles/global.css # Tailwind v4 + design tokens
├── astro.config.mjs
└── package.json
```

## Diferențe față de versiunea TanStack Start

- **Static** — fără server, fără SSR. Tot HTML pre-renderat la build.
- **Formularul** trimite direct la Formspree (`mrejdjjk`) — nu necesită backend.
- **Slider before/after** înlocuit cu două imagini alăturate (eliminat JS interactiv).
- **Iconițe** Lucide inline ca SVG (fără dependență externă).
- **Accordion FAQ** folosește `<details>` nativ (fără JavaScript).
