# Securitate & Hardening — GNG PureCare

Acest document sumarizează măsurile de securitate aplicate în repository și pașii recomandați în dashboard-urile externe (Cloudflare & Formspree) pentru un nivel maxim de protecție împotriva atacurilor comune (XSS, Clickjacking, MIME-sniffing, spam de formulare și abuz).

---

## 1. Măsuri implementate în cod (Repository)

### A. Anteturi de securitate HTTP (`public/_headers`)
La nivel de Cloudflare Pages sunt trimise automat anteturile:
- **`Content-Security-Policy (CSP)`**:
  - Restricționează sursele de scripturi exclusiv la origin-ul propriu (`'self'`).
  - Permite fonturi securizate din Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`).
  - Restricționează acțiunea formularului exclusiv la Formspree (`form-action 'self' https://formspree.io`).
  - Interzice încapsularea în frame-uri (`frame-ancestors 'none'`) și tagurile `<object>` / flash (`object-src 'none'`).
  - Forțează HTTPS prin `upgrade-insecure-requests`.
- **`Strict-Transport-Security (HSTS)`**: `max-age=31536000; includeSubDomains; preload` (impune conexiune HTTPS rigidă pe 1 an).
- **`X-Frame-Options: DENY`**: Protecție împotriva atacurilor de tip Clickjacking.
- **`X-Content-Type-Options: nosniff`**: Previne MIME-type sniffing pe toate fișierele și resursele.
- **`Referrer-Policy: strict-origin-when-cross-origin`**: Protejează datele din URL la navigarea către servicii terțe.
- **`Permissions-Policy`**: Dezactivează accesul browserului la API-uri senzitive neutilizate (`camera=()`, `microphone=()`, `geolocation=()`, `payment=()`, `usb=()`, etc.).
- **`Cross-Origin-Opener-Policy & Cross-Origin-Resource-Policy`**: Izolare împotriva scurgerilor de context cross-origin (`same-origin`).

### B. Meta tag-uri de securitate (`src/layouts/Layout.astro`)
- Adăugate directive de rezervă la nivel de HTML: `<meta name="referrer" content="strict-origin-when-cross-origin" />` și `<meta http-equiv="X-Content-Type-Options" content="nosniff" />`.

### C. Hardening Formular de Contact (`src/components/ContactForm.astro`)
1. **Validare strictă a telefonului românesc**:
   - Verificare automată regex pe formatul `07xxxxxxxx`, `+407xxxxxxxx` sau `00407xxxxxxxx`.
   - Curățare spații și caractere de delimitare.
   - Afișare feedback vizual de eroare specific pe câmp, fără a reîncărca pagina.
2. **Anti-Spam Temporal (Time-Trap)**:
   - Formularul măsoară timpul de la randare până la submit (`data-start-time`). Boții care completează instantaneu (< 2 secunde) sunt blocați.
3. **Client Rate-Limiting & Anti-Flood**:
   - Previne trimiterile multiple consecutive (cooldown de 45 secunde salvat în `sessionStorage`) pentru a evita consumarea cotei Formspree și spam-ul de lead-uri.
4. **Honeypot consolidat**:
   - Câmpul invizibil `_gotcha` verificat atât în script cât și de către Formspree.

### D. Noindex & Confidențialitate (`/multumim`)
- Pagina de mulțumire conține `<meta name="robots" content="noindex, nofollow" />`.
- `public/robots.txt` interzice explicit crawlerele pe `/multumim/` și `/multumim`.

### E. Auditul dependențelor
- Rulat `npm audit fix` pentru remedierea vulnerabilităților non-breaking (reduse de la 17 la 8). Restul de 8 vulnerabilități țin de module interne Vite/Astro care necesită upgrade major (Astro v7) și vor fi actualizate la următorul ciclu major.

---

## 2. Configurări recomandate în Dashboard-ul Cloudflare

Pentru a completa securitatea la nivel de rețea/edge:
1. **Bot Fight Mode**:
   - În Cloudflare Dashboard -> **Security** -> **Bots** -> Activează **Bot Fight Mode** (blochează traficul de boți cunoscuți și scrapers malițioși înainte să atingă site-ul).
2. **WAF & Security Level**:
   - În Cloudflare Dashboard -> **Security** -> **Settings** -> Setează Security Level la **Medium** (standard recomandat).
3. **Always Use HTTPS & Minimum TLS**:
   - În Cloudflare Dashboard -> **SSL/TLS** -> **Edge Certificates**:
     - Activează **Always Use HTTPS**.
     - Activează **Automatic HTTPS Rewrites**.
     - Setează **Minimum TLS Version** la **TLS 1.2** sau **TLS 1.3**.
4. **Cloudflare Turnstile (Opțional, pentru volum mare de spam)**:
   - Dacă pe viitor se observă spam masiv prin Formspree, se poate activa un widget Turnstile gratuit în Cloudflare.
   - În Formspree -> Form Settings -> Se poate activa integrarea nativă cu cheia secretă Cloudflare Turnstile.

---

## 3. Configurări recomandate în Formspree Dashboard

1. **Restricție pe domeniu (Domain Restriction)**:
   - În Formspree -> Formular `mrejdjjk` -> **Settings** -> **Allowed Domains**:
   - Setează exclusiv `https://gngpurecare.ro` și `https://gng-purecare-astro.pages.dev`. Aceasta previne trimiterea de spam din afara site-ului direct pe endpoint-ul tău.
2. **Protecție reCAPTCHA / Turnstile nativă în Formspree**:
   - În tabul **Settings**, activează bifa de verificare spam automată dacă este disponibilă în planul tău.
