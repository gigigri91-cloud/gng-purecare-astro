# Analiză completă — GNG PureCare (Astro)

**Data analizei:** 6 iulie 2026  
**Repo:** `astro-site`  
**Producție:** https://gngpurecare.ro  
**Ultimul commit analizat:** `8b056f8` (+ modificări locale necomise)

> Această analiză este read-only. Nu descrie implementări viitoare, doar starea curentă a codului și riscurile identificate.

---

## 1. STRUCTURA PROIECTULUI

### Framework și versiuni

| Tehnologie | Versiune (instalată) | Rol |
|------------|----------------------|-----|
| **Astro** | `5.18.1` | Framework principal, SSG + adapter Cloudflare |
| **@astrojs/cloudflare** | `12.6.13` | Deploy pe Cloudflare Workers; assets statice din `dist/` |
| **@astrojs/sitemap** | `3.7.2` | Generare `sitemap-index.xml` la build |
| **Tailwind CSS** | `4.3.0` | Utilitare + design tokens via `@theme` |
| **@tailwindcss/vite** | `4.3.0` | Integrare Vite în `astro.config.mjs` |
| **Wrangler** | `4.92.0` (dev) | CLI deploy/preview Cloudflare |

**Config:** `astro.config.mjs` — `site: 'https://gngpurecare.ro'`, adapter Cloudflare, fără `imageService: "compile"` explicit (build-ul optimizează totuși imaginile `<Image>` la prerender).

### Structura folderelor

```
astro-site/
├── public/              # Assets statice (favicons, logo-uri, imagini servicii, robots.txt)
├── src/
│   ├── assets/images/   # Imagini procesate de Astro (before/after, unsplash despre)
│   ├── components/      # 12 componente Astro reutilizabile
│   ├── data/            # business.ts (contact), social.ts (rețele sociale)
│   ├── layouts/         # Layout.astro (shell global)
│   ├── pages/           # 6 rute: /, /despre, /servicii, /contact, /confidentialitate, /multumim
│   └── styles/          # global.css (Tailwind + tokens CSS)
├── dist/                # Output build (HTML + _astro/ + _worker.js)
├── astro.config.mjs
├── package.json
└── wrangler.jsonc
```

### Componente principale

| Componentă | Fișier | Utilizare |
|------------|--------|-----------|
| Layout shell | `src/layouts/Layout.astro` | Meta SEO, Header, Footer, WhatsApp FAB |
| Header | `src/components/Header.astro` | Nav fixă, morph pill desktop, meniu mobil |
| Hero | `src/components/Hero.astro` | Homepage hero full-width |
| ServiceCards | `src/components/ServiceCards.astro` | 4 carduri servicii pe homepage |
| Stats | `src/components/Stats.astro` | Bandă KPI „GNG PureCare în cifre” |
| Testimonials | `src/components/Testimonials.astro` | 3 recenzii |
| BeforeAfter | `src/components/BeforeAfter.astro` | Slider înainte/după |
| ContactForm | `src/components/ContactForm.astro` | Formular Formspree |
| FaqAccordion | `src/components/FaqAccordion.astro` | FAQ accesibil |
| SchemaOrg | `src/components/SchemaOrg.astro` | JSON-LD LocalBusiness (**local, necomis**) |
| Icon | `src/components/Icon.astro` | Set SVG inline Lucide-style |

### Librării externe — scop

- **Formspree** (URL extern în `ContactForm.astro`) — procesare formulare contact
- **Google Fonts** (Inter, Poppins) — tipografie, încărcate din CDN în `Layout.astro`
- **Cloudinary** (`pplx-res.cloudinary.com`) — imagini hero + carduri servicii homepage (externe, neoptimizate de Astro)
- **OpenStreetMap embed** — hartă generică București pe `/contact` (dacă e prezentă în pagină)

### Stare Git vs. workspace local

**Comis pe `main`:** `index.astro`, `despre.astro`, `Stats.astro`, `business.ts`  
**Modificat local, necomis:** `Layout.astro`, `Header.astro`, `Footer.astro`, `Hero.astro`, `contact.astro`, `servicii.astro`, `social.ts`, `SchemaOrg.astro` (nou)

Producția live poate diferi de workspace-ul local pentru schema markup și centralizarea telefonului.

---

## 2. BUG-URI ȘI PROBLEME TEHNICE

### 2.1 Bandă statistici „GNG PureCare în cifre” — afișează `0+`, `0%`, `0`, `0h`

**Fișiere:** `src/components/Stats.astro` (homepage), `src/pages/despre.astro` (secțiunea `#about-statistici`, linii ~30–35, ~703–747)

**Ce se întâmplă**

1. **Placeholder intenționat în HTML** — valorile inițiale sunt hardcodate la `0`:

```17:18:src/components/Stats.astro
            <span class="stats-count" data-count={stat.count}>0</span>
            {stat.suffix && <span class="stats-suffix">{stat.suffix}</span>}
```

   Sufixele (`+`, `%`, `h`) sunt afișate imediat → utilizatorul vede `0+`, `0%`, `0`, `0h` **până rulează JavaScript-ul**.

2. **Animația depinde de IntersectionObserver** — scriptul din `Stats.astro` (linii 98–126) pornește count-up doar când elementele cu `[data-count]` intră în viewport (`threshold: 0.35`). Dacă observer-ul nu se declanșează, valorile rămân `0`.

3. **Observer pe elemente mici (inline `<span>`)** — se observă span-urile `.stats-count`, nu secțiunea `#statistici`. Pe unele viewport-uri / browsere, intersectarea span-urilor inline poate fi mai puțin fiabilă decât observarea întregii secțiuni.

4. **Lipsă re-inițializare la navigare** — `despre.astro` ascultă `astro:page-load` (linia 746); **`Stats.astro` nu**. La navigare client-side (dacă e activată în viitor), stats nu se reinițializează.

5. **Fără fallback fără JS** — nu există `<noscript>` sau valori finale în HTML. Cu JavaScript dezactivat sau blocat, KPI-urile rămân permanent la zero.

6. **Datele există** — KPI-urile sunt definite corect în cod (`100+`, `99%`, `4 ani`, `24h`); problema nu e lipsa datelor, ci **strategia de randare + animație**.

| Severitate | Recomandare scurtă |
|------------|-------------------|
| **Important** | Randează valorile finale în HTML (SSR) și folosește JS doar pentru animație opțională; sau setează textul final imediat dacă IO nu pornește în 1–2s |
| **Important** | Observă `#statistici` / `.stats-grid`, nu span-urile inline; adaugă `rootMargin: '0px 0px -10% 0px'` |
| **Minor** | Adaugă `document.addEventListener('astro:page-load', initStats)` ca pe `/despre` |
| **Minor** | Extrage KPI-urile într-un singur `src/data/stats.ts` (duplicat între `Stats.astro` și `despre.astro`) |

---

### 2.2 Formular de contact

**Fișier:** `src/components/ContactForm.astro`

| Aspect | Stare |
|--------|--------|
| **Destinație** | `POST https://formspree.io/f/mrejdjjk` (linia 3) |
| **Redirect succes** | `_next` → `/multumim/` (linia 15) |
| **Validare** | HTML5: `required` pe nume, telefon, email; `type="email"` pe email |
| **Validare telefon** | Fără `pattern` / format RO — orice string trece dacă e nevid |
| **Honeypot spam** | `_gotcha` ascuns (linii 16–18) |
| **Mesaj** | Opțional (textarea fără `required`) |
| **Erori UI** | Fără handling client-side pentru eșec Formspree; utilizatorul vede răspunsul Formspree |
| **GDPR** | Menționat în `confidentialitate.astro` (Formspree ca procesator) |

| Severitate | Recomandare |
|------------|-------------|
| **Minor** | Adaugă `pattern` sau validare JS pentru telefon RO (`07xxxxxxxx`) |
| **Minor** | Testează periodic endpoint-ul Formspree (limită plan gratuit, spam) |
| **Important** | Confirmă că `/multumim/` e accesibil după submit (funcționează în build static) |

---

### 2.3 Alte probleme tehnice în cod

| Problemă | Locație | Severitate | Recomandare |
|----------|---------|------------|-------------|
| **Navigare: dublu `aria-current="page"`** pe homepage | `Header.astro` linii 13–14: atât „Acasă” (`/`) cât și „Contact” (`/#contact`) sunt `is-active` pe `/` | **Important** | Doar un link activ; Contact nu ar trebui `aria-current` când ești pe homepage |
| **Schema LocalBusiness necomisă pe producție** | `SchemaOrg.astro` untracked; `Layout.astro` modificat local | **Important** | Commit + deploy pentru schema markup |
| **KPI duplicate** | `Stats.astro` + `despre.astro` `TRUST_STATS` | **Minor** | Un singur fișier sursă de date |
| **WhatsApp FAB: `onmouseover`/`onmouseout` inline** | `Layout.astro` linii 69–70 | **Minor** | Înlocuiește cu CSS `:hover` (accesibilitate, CSP) |
| **Cloudflare + Sharp warning** | Build: „Cloudflare does not support sharp at runtime” | **Minor** | Setează `imageService: "compile"` în `astro.config.mjs` pentru claritate |
| **Serviciu homepage nealiniat** | `ServiceCards.astro` are 4 servicii (inclusiv „după eveniment”); `/servicii` are 3 secțiuni detaliate | **Minor** | Aliniază oferta sau elimină serviciul din homepage |
| **Fără `console.*` / TODO în `src/`** | — | — | Cod curat la acest nivel |

---

## 3. CONȚINUT ȘI DATE

### 3.1 Testimoniale / recenzii

**Fișier:** `src/components/Testimonials.astro` (linii 2–21)

| # | Nume afișat | Oraș | Inițială avatar | Anonim? |
|---|-------------|------|-----------------|---------|
| 1 | Andreea M. | București, Sector 1 | A | Pseudonim (inițială + nume scurt) |
| 2 | Mihai L. | București | M | Pseudonim |
| 3 | Ioana P. | București | I | Pseudonim |

- Toate au **5 stele** hardcodate (`★★★★★`, linia 32) fără sursă verificabilă (Google, Facebook).
- **Nu sunt complet anonime**, dar **nici identități verificabile** (doar prenume + inițială familie).
- Schema **nu include** `aggregateRating` / `Review` — deci nu există inconsistență JSON-LD, dar există risc de încredere dacă stelele par „fabricate”.

| Severitate | Recomandare |
|------------|-------------|
| **Important** | Folosește recenzii reale cu sursă (Google Business) sau elimină stelele dacă nu sunt verificabile |
| **Minor** | Adaugă „Client verificat” doar dacă e adevărat |

---

### 3.2 Prețuri

**Prezent în cod:**

| Locație | Conținut |
|---------|----------|
| `src/pages/servicii.astro` linii 34–37 | Pachete **Basic** `de la 250 lei`, **Standard** `de la 400 lei`, **Premium** `de la 650 lei` |
| `src/pages/servicii.astro` linia 134 | Notă: „orientative pentru un apartament de 2 camere” |
| `src/components/SchemaOrg.astro` linia 58 | `priceRange: "$$"` (simbolic, nu RON) |
| Homepage | **Fără prețuri** — doar CTA „Solicită ofertă” |

| Severitate | Recomandare |
|------------|-------------|
| **Minor** | Menține disclaimer-ul „orientativ”; actualizează prețurile când se schimbă tarifele reale |
| **Minor** | Aliniază `priceRange` schema cu realitatea (sau adaugă `Offer` cu preț în schema) |

---

### 3.3 Adresă și zonă de servicii

| Sursă | Detaliu |
|-------|---------|
| `src/data/business.ts` | `streetAddress: "București"`, `postalCode: "032351"`, fără stradă |
| `src/pages/contact.astro` | „București, România” (generic) |
| Copy site | „București și împrejurimi” (FAQ, servicii, footer) |
| `SchemaOrg.astro` | `areaServed`: București + **Sectoarele 1–6** (detaliat în schema) |
| Testimonial 1 | Menționează „Sector 1” |

**Concluzie:** Zona e **parțial detaliată** (sectoare în schema + un testimonial), dar **adresa fizică e generică** (fără stradă/număr — normal pentru firmă de curățenie mobilă).

| Severitate | Recomandare |
|------------|-------------|
| **Minor** | Dacă există sediu/bază, completează `streetAddress`; altfel păstrează „service area business” în Google Business |
| **Minor** | Menționează sectoarele și în copy-ul vizibil (footer/contact), nu doar în schema |

---

## 4. SEO ȘI PERFORMANȚĂ

### 4.1 Meta tags per pagină

| Pagină | Title | Description | Canonical |
|--------|-------|-------------|-----------|
| `/` | Curățenie Profesională București \| GNG PureCare | Da | Auto din `Layout.astro` |
| `/despre` | Despre GNG PureCare — Curățenie București | Da | Da |
| `/servicii` | Servicii Curățenie București \| GNG PureCare | Da (menționează Basic/Standard/Premium) | Da |
| `/contact` | Contact GNG PureCare \| … | Da | Da |
| `/confidentialitate` | Politică de confidențialitate \| … | Da | Da |
| `/multumim` | Mesaj trimis \| … | Da | `noindex` **lipsă** — pagină thank-you indexabilă |

**Layout global** (`Layout.astro`): `og:*`, `twitter:*`, `theme-color`, `google-site-verification`, favicons multiple, `lang="ro"`.

| Severitate | Recomandare |
|------------|-------------|
| **Minor** | Adaugă `<meta name="robots" content="noindex, follow">` pe `/multumim` |
| **Minor** | `schemaPage` pe `/servicii` și `/contact` există local — deploy pentru consistență |

---

### 4.2 Schema markup / structured data

| Tip | Stare | Fișier |
|-----|-------|--------|
| **LocalBusiness** | Implementat în `SchemaOrg.astro`, inclus în `Layout.astro` (**local, necomis pe `main` la ultimul push**) | `src/components/SchemaOrg.astro` |
| **FAQPage** | Pe homepage, generat din array `FAQ` | `src/pages/index.astro` (script după `FaqAccordion`) |
| **Review / aggregateRating** | Absent | — |

**Pe commit `8b056f8` (producție):** doar FAQPage pe homepage; **fără** LocalBusiness în layout.

| Severitate | Recomandare |
|------------|-------------|
| **Important** | Commit + deploy `SchemaOrg.astro` + `Layout.astro` |
| **Minor** | Validează la [validator.schema.org](https://validator.schema.org/) după deploy |
| **Important** | Nu adăuga `aggregateRating` fără recenzii reale verificabile |

---

### 4.3 Servicii: pagini separate vs. secțiuni

| Tip | Unde |
|-----|------|
| **Pagină dedicată** | `/servicii` — 3 servicii detaliate (apartamente, birouri, renovare) + prețuri + FAQ |
| **Secțiuni homepage** | `ServiceCards.astro` — 4 carduri (include „după eveniment”, absent din `/servicii`) |
| **Anchor contact** | Carduri homepage → `#contact`; servicii → `/#contact` |

Nu există rute separate `/servicii/apartamente` etc. — totul e o singură pagină cu ancore (`id="apartamente"` etc.).

---

### 4.4 Imagini

| Imagine | Optimizare | `alt` | Lazy |
|---------|------------|-------|------|
| `/despre` — `josue-michel`, `feey` | Astro `<Image>` → WebP (~30KB, ~31KB) | Da, descriptive | Hero eager + fetchpriority; proces lazy |
| `BeforeAfter` — before/after | Astro assets, optimizate la build | Da | after eager, before lazy |
| `ServiceCards` — Cloudinary | **Externe, JPG full**, fără `<Image>` | Da (linia 43–47) | `loading="lazy"` |
| `Hero` — background CSS Cloudinary | Fără optimizare Astro | `aria-label` pe container, nu pe `<img>` | CSS background |
| `servicii.astro` — `/images/service-*.jpg` | Static din `public/`, neoptimizate | `alt={s.h2}` (titlu lung) | lazy |
| Logo header/footer | PNG din `public/` | `alt=""` + `aria-hidden` (decorativ) | eager/lazy |

| Severitate | Recomandare |
|------------|-------------|
| **Important** | Migrează imaginile Cloudinary și `public/images/service-*` la `src/assets` + `<Image>` |
| **Minor** | Hero: `fetchpriority="high"` pe LCP sau imagine `<Image>` în loc de CSS background |
| **Minor** | Scurtează `alt` pe servicii la descrieri naturale, nu titluri H2 întregi |

---

## 5. RESPONSIVE ȘI ACCESIBILITATE

### 5.1 Header și telefon pe mobil

**Fișier:** `src/components/Header.astro`

| Comportament | Desktop | Mobil (`max-width: 767px`) |
|--------------|---------|----------------------------|
| Header poziție | `position: fixed` (linia 101) | Fixed, full-width, 64px înălțime |
| Telefon în bară | Vizibil în `.header-actions` (linia 58–61) | **Ascuns** (`display: none !important`, linii 503–507) |
| Telefon accesibil | Da | Doar în **meniul hamburger** (`.mobile-nav-phone`, linia 87–90) |
| CTA „Solicită ofertă” | Vizibil | În meniul mobil |
| Sticky | Da, mereu fix top | Da |

**Concluzie:** Header-ul **este sticky pe mobil**, dar **numărul de telefon nu e vizibil în bară** — utilizatorul trebuie să deschidă meniul sau să folosească WhatsApp FAB / linkuri din conținut.

| Severitate | Recomandare |
|------------|-------------|
| **Important** | Afișează icon telefon în header mobil (fără text) sau păstrează WhatsApp FAB vizibil |
| **Minor** | Telefonul din `index.astro` (sub cei 3 pași) ajută conversia — verifică vizibilitate pe mobil |

---

### 5.2 Contrast și butoane

**Tokens** (`src/styles/global.css`):

- Primary: `#008080` pe alb / text alb pe primary — **contrast bun** pentru CTA-uri
- Muted text: `#4b5563` pe alb — ~AA pentru body mic
- Butoane principale: `min-height` ~44–48px (`h-11`/`h-12`, `btn-cta` în header)

| Element | Observație | Severitate |
|---------|------------|------------|
| CTA primary | `font-semibold`, `text-base`, înălțime ≥44px | OK |
| `.phone-cta` homepage | `font-weight: 600`, culoare primary | OK |
| Focus states | `focus-visible:ring-2` pe inputs și butoane formular | OK |
| Skip link | Implementat corect (`global.css` linii 38–68) | OK |
| FAQ accordion | `aria-expanded`, `aria-controls`, keyboard | OK |
| `prefers-reduced-motion` | Header, FAQ, carduri, stats (parțial) | OK |
| WhatsApp FAB | Fără focus ring explicit în inline styles | **Minor** |

---

## Rezumat prioritizat

| Prioritate | Item |
|------------|------|
| **Critic** | — (niciun blocker total de funcționalitate identificat) |
| **Important** | KPI stats rămân la `0` fără JS / IO; schema LocalBusiness necomisă; telefon ascuns pe header mobil; recenzii cu 5★ fără sursă |
| **Minor** | KPI duplicate, imagini externe neoptimizate, `/multumim` indexabil, validare telefon formular, aliniere servicii homepage vs. `/servicii` |

---

## Comenzi utile pentru reverificare

```bash
grep -r "data-count" src/components/Stats.astro src/pages/despre.astro
grep -r "formspree" src/
grep -r "de la .* lei" src/
npm run build
```

---

*Document generat automat din analiza codului sursă. Pentru validare vizuală, rulează `npm run dev` și testează pe mobil + [PageSpeed Insights](https://pagespeed.web.dev/).*
