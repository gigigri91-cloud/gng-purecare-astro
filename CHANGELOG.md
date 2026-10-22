# Changelog

## [2026-07-06] - Testimonials fără stele fabricate

- **Problemă:** Cardurile de testimonial afișau `★★★★★` hardcodat, fără sursă verificabilă — risc de încredere pentru vizitatori.
- **Fix aplicat:** Eliminate stelele; înlocuite cu badge discret „Client GNG PureCare”. Păstrate citatul, numele și locația. Fără `aggregateRating` în schema.
- **Fișiere modificate:** `src/components/Testimonials.astro`, `CHANGELOG.md`

## [2026-07-06] - Mobile header phone quick-call

- **Problemă:** Pe mobil, numărul de telefon era accesibil doar în meniul hamburger, ceea ce reducea accesul rapid la apel pe ecran mic.
- **Fix aplicat:** Adăugat buton telefon vizibil în bara de header mobil (`aria-label="Sună la GNG PureCare"`), cu touch target 44x44px, link din `business.ts` și focus-visible ring consistent.
- **Fișiere modificate:** `src/components/Header.astro`, `CHANGELOG.md`

## [2026-07-06] - KPI stats progressive enhancement

- **Problemă:** Secțiunea „GNG PureCare în cifre” afișa `0+`, `0%`, `0`, `0h` în HTML până la animația JS; IntersectionObserver pe span-uri inline era nesigur; KPI-uri duplicate în `Stats.astro` și `despre.astro`; `Stats.astro` fără `astro:page-load`.
- **Fix aplicat:** Valori finale randate la build în HTML; animația count-up ca progressive enhancement (reset la 0 doar când JS + IO pornește); observer pe `.stats-grid` / `.about-trust__grid` cu `rootMargin: '0px 0px -10% 0px'`; sursă unică `src/data/stats.ts`; listener `astro:page-load` pe homepage.
- **Fișiere modificate:** `src/data/stats.ts` (nou), `src/components/Stats.astro`, `src/pages/despre.astro`, `CHANGELOG.md`

## [2026-07-06] - Schema markup LocalBusiness

- **Problemă:** JSON-LD `LocalBusiness` era implementat local în `SchemaOrg.astro` și inclus în `Layout.astro`, dar nu era comis pe `main` — producția (gngpurecare.ro) nu expunea structured data pentru Google.
- **Fix aplicat:** Componentă `SchemaOrg.astro` cu date din `src/data/business.ts`; randare în `<head>` via `<SchemaOrg page={schemaPage} />` în layout-ul global. Fără `aggregateRating` / `Review` (lipsesc recenzii verificabile).
- **Fișiere modificate:** `src/components/SchemaOrg.astro` (nou), `src/layouts/Layout.astro`, `CHANGELOG.md`
