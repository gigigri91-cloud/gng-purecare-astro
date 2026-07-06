# Changelog

## [2026-07-06] - Schema markup LocalBusiness

- **Problemă:** JSON-LD `LocalBusiness` era implementat local în `SchemaOrg.astro` și inclus în `Layout.astro`, dar nu era comis pe `main` — producția (gngpurecare.ro) nu expunea structured data pentru Google.
- **Fix aplicat:** Componentă `SchemaOrg.astro` cu date din `src/data/business.ts`; randare în `<head>` via `<SchemaOrg page={schemaPage} />` în layout-ul global. Fără `aggregateRating` / `Review` (lipsesc recenzii verificabile).
- **Fișiere modificate:** `src/components/SchemaOrg.astro` (nou), `src/layouts/Layout.astro`, `CHANGELOG.md`
