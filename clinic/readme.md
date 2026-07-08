# The Balance Gangnam Clinic — Luxury Digital Experience Specification

> 병원 홈페이지 설계안. 이 문서는 구현의 단일 기준(Single Source of Truth)이다.
> Start page: `clinic/index.html`

---

## 1. Brand Philosophy

**"Balance is not a treatment. It is a state we return you to."**

The Balance Gangnam Clinic is not a hospital that happens to look premium — it is a sanctuary that happens to practice medicine. The brand stands at the intersection of:

- **Medical precision** — quiet confidence, never boastful
- **Wellness** — the body as an instrument to be tuned, not a machine to be fixed
- **Music & Art** — emotional recovery through curated sensory experience (the 3F private wellness space, opening with **Music Night**)
- **Membership intimacy** — a private lounge, not a waiting room

The digital experience must behave like the Aman Resort lobby: you arrive, the noise stops, and someone quietly knows your name. Every pixel earns trust through restraint. Nothing shouts. Nothing sells. The visitor should *feel* balanced before reading a single word about treatment.

**Brand voice:** first-person plural, short declarative sentences, generous silence between them. Never "Best clinic in Gangnam." Instead: "Your body remembers what balance feels like. We help it return."

---

## 2. UX Strategy

1. **Emotion before information.** The first full viewport contains zero navigation pressure — one line of poetry, one living visual, one invitation to scroll.
2. **One continuous scroll narrative** (single page for v1). The homepage IS the brand film. Sections unfold like chapters, not menu destinations.
3. **Slow is a feature.** Deliberate pacing via smooth scroll (Lenis), long ease curves, staggered reveals. The site teaches the visitor to breathe slower.
4. **Progressive intimacy.** Landing → Emotion → Story → Music → Wellness → Programs → Membership → Reservation. Each step earns the right to the next. Reservation is the *last* thing offered, never the first.
5. **Reduction as luxury.** Max 4 nav items. No dropdowns. No banners. No popups. No prices on the homepage.

---

## 3. Information Architecture

```
The Balance  (single-page v1, anchor-based)
│
├── #hero        — Landing (emotional threshold)
├── #philosophy  — Story / brand manifesto
├── #music       — Music Night (3F private wellness space)
├── #wellness    — Body · Mind · Balance triptych
├── #programs    — Curated programs (3 cards max)
├── #membership  — Private membership invitation
└── #reserve     — Reservation (quiet form / contact)

Global Nav (fixed, minimal):  Story · Music Night · Membership · Reserve
Footer: address, hours, tel, instagram, © — one quiet line each
```

Future expansion converts anchors into standalone pages (see §19).

---

## 4. Homepage Flow & Section Hierarchy

| # | Section | Height | Purpose | Emotional beat |
|---|---------|--------|---------|----------------|
| 1 | Hero | 100vh | Threshold. WebGL living gradient + one line | Stillness |
| 2 | Philosophy | ~150vh | Manifesto in 3 lines, revealed by scroll | Trust |
| 3 | Music Night | ~200vh | The 3F event. Audio-reactive visual, date, invitation | Wonder |
| 4 | Wellness Triptych | ~150vh | Body / Mind / Balance — three panels | Calm |
| 5 | Programs | ~100vh | 3 curated cards (Balance Care · Recovery · Tuning) | Curiosity |
| 6 | Membership | 100vh | Dark, intimate. "By introduction and invitation." | Desire |
| 7 | Reserve | ~80vh | Minimal form: name, contact, preferred time, note | Resolution |
| 8 | Footer | auto | Quiet close | Completion |

---

## 5. User Journey

```
Landing → Emotion → Story → Music → Wellness → Programs → Membership → Reservation
```

- **0–5s (Landing/Emotion):** WebGL gradient breathes at ~6 breaths/min. Headline fades in word-by-word. No CTA yet — only a hairline scroll cue.
- **5–30s (Story):** Scroll-driven manifesto. Lines pin and dissolve. Visitor learns *why*, not *what*.
- **30–60s (Music/Wellness):** Music Night section is the emotional peak — largest visual investment. Wellness triptych decompresses afterward.
- **60–90s (Programs/Membership):** Information density rises slightly, tone stays hushed. Membership is aspiration, not upsell.
- **90s+ (Reservation):** The form appears as an earned conclusion. Submitting feels like accepting an invitation.

---

## 6. Wireframe (text)

```
┌──────────────────────────────────────┐
│ [The Balance]        Story Music Membership Reserve │  ← fixed, blends into hero
│                                      │
│         (WebGL breathing field)      │
│                                      │
│        "몸과 마음이 제자리로."          │
│         The Balance — Gangnam        │
│                  ·                   │
│               scroll ↓ (hairline)    │
├──────────────────────────────────────┤
│   PHILOSOPHY                         │
│   large serif line 1  (pin/fade)     │
│   large serif line 2                 │
│   large serif line 3                 │
├──────────────────────────────────────┤
│   MUSIC NIGHT — 3F                   │
│   full-bleed dark panel              │
│   audio-reactive particle/wave WebGL │
│   date · one paragraph · [RSVP →]    │
├──────────────────────────────────────┤
│  BODY        |   MIND    |  BALANCE  │  ← 3 columns desktop / stacked mobile
│  image+line  | image+line| image+line│
├──────────────────────────────────────┤
│   PROGRAMS  (3 wide cards, hover lift)│
│   Balance Care · Recovery · Tuning   │
├──────────────────────────────────────┤
│   MEMBERSHIP (near-black, centered)  │
│   "By introduction and invitation."  │
│   [Request an introduction]          │
├──────────────────────────────────────┤
│   RESERVE — 2-col: quiet copy | form │
├──────────────────────────────────────┤
│   footer: addr · hours · tel · IG    │
└──────────────────────────────────────┘
```

---

## 7. Motion Concept

- **Global:** Lenis smooth scroll, `lerp ≈ 0.08`. GSAP + ScrollTrigger for all reveals.
- **Signature easing:** `cubic-bezier(0.22, 1, 0.36, 1)` (expo-out family). Durations 0.9–1.6s. Nothing snaps.
- **Reveals:** text rises 24px + fades, stagger 80ms per line. Images scale 1.06 → 1.0 behind a clip.
- **Hero:** gradient field oscillates on a ~10s breathing cycle; parallax of headline at 0.3× scroll speed.
- **Music Night:** particles/waveform drift; amplitude eases up as section enters viewport.
- **Nav:** transparent over hero → frosted glass (backdrop-blur) after 100vh.
- **Rule:** motion communicates breath and gravity — never bounce, never spin, never flash.

---

## 8. Typography

- **Display / headlines:** serif — `"Cormorant Garamond", "Nanum Myeongjo", serif`. Light 300, tight leading (1.15), generous letter-spacing on small caps labels (0.2em).
- **Body / UI:** sans — `"Inter", "Pretendard", "Noto Sans KR", sans-serif`. Weight 300–400, line-height 1.8, max line length 34em.
- **Scale (fluid, clamp-based):** display `clamp(2.4rem, 6vw, 5.5rem)`; section label `0.75rem` uppercase tracked; body `clamp(1rem, 1.1vw, 1.125rem)`.
- Korean and English set together: Korean carries meaning, English carries texture.

---

## 9. Color System

| Token | Hex | Role |
|-------|-----|------|
| `--ivory` | `#F5F1EA` | Primary background (warm gallery white) |
| `--stone` | `#E4DDD3` | Secondary surface |
| `--ink` | `#1C1A17` | Primary text / dark sections |
| `--umber` | `#6B5D4F` | Muted secondary text |
| `--gold` | `#B08D57` | Single accent — hairlines, hover, focus ring |
| `--night` | `#0E0D0B` | Music Night & Membership backgrounds |
| `--sage` | `#8A9182` | Rare tertiary (wellness hints) |

Rules: one accent only (gold), used at hairline scale. Large fields are ivory or night. No pure white, no pure black, no saturated color anywhere.

---

## 10. Icon Style

Almost none. Where unavoidable (scroll cue, close, external link): 1px stroke, geometric, currentColor, 24px grid, no fills, no rounded cartoon corners. Prefer typographic marks (·, →, ↓) over icons.

---

## 11. Photography Direction

- Natural window light, warm shadows, film-like grain. Interiors: wood, linen, stone, brass.
- People: hands, posture, backs of heads — never stock smiles, never white coats front-and-center.
- Music: close-ups of instruments (cello strings, piano keys) in low warm light.
- Aspect discipline: full-bleed 16:9 for chapters, 3:4 for triptych.
- v1 placeholder rule: use CSS gradient/texture placeholders with correct aspect ratios — no stock photos.

---

## 12. Illustration Direction

Single-weight hairline line drawings (0.75–1px), ink on ivory: a tuning fork, a horizon line, concentric ripples. Used as section dividers at most. Never decorative clutter; think museum wayfinding.

---

## 13. Interaction Ideas

- Magnetic hover on the two primary buttons (subtle, ≤8px pull).
- Program cards: on hover, image scales 1.04, hairline gold underline draws left→right.
- Cursor: default; no custom cursor gimmicks (quiet > clever).
- Music Night: optional muted ambient toggle (user-initiated only, never autoplay).
- Form fields: borderless with a 1px bottom hairline that turns gold on focus.

---

## 14. Mobile-First Strategy

- Design at 390px first. Triptych stacks vertically with full-bleed images. Nav collapses to wordmark + single "Menu" text button opening a full-screen quiet overlay (4 links, serif, staggered fade).
- Tap targets ≥ 44px. Fluid type via clamp. Hero WebGL falls back to CSS animated gradient below a capability/performance threshold.
- Scroll effects simplified on mobile: fades only, no pinning, to protect 60fps.

---

## 15. Three.js Opportunities

1. **Hero breathing field** (primary, v1): full-screen plane + fragment shader — slow-moving warm gradient noise (ivory/stone/gold), ~6 cycles/min. DPR capped at 1.5, pause when tab hidden, destroy on `prefers-reduced-motion`.
2. **Music Night particle waveform** (secondary, v1 if budget allows): ~2,000 points drifting in a sine field, gold on near-black. Static CSS gradient fallback.
3. Future: 3F space walkthrough, membership card materiality. **Not in v1.**

Both scenes share one renderer strategy: lazy-init on approach (IntersectionObserver), dispose when far off-screen.

---

## 16. AI-Generated Visual Strategy

- v1 ships with abstract WebGL/CSS visuals only (no fake photos of a real clinic — trust risk).
- Phase 2: AI-generated *abstract* textures (brushed stone, silk, light-through-linen) as section backgrounds; art direction prompt bible kept in this repo. Real photography replaces placeholders when the 3F shoot happens. AI never generates people or medical imagery.

---

## 17. Accessibility

- Semantic landmarks (`header/main/section/footer`), one `h1`, ordered headings.
- `prefers-reduced-motion`: kill Lenis smoothing, GSAP reveals become instant opacity, WebGL replaced with static gradient.
- Contrast: body text pairs meet WCAG AA (ink on ivory ≈ 12:1; on night use `#EDE8E0`).
- Full keyboard path: skip-link, visible gold focus ring, form labels always present (no placeholder-as-label), `aria-label` on nav toggle, ESC closes overlay.
- WebGL canvases `aria-hidden="true"`; all meaning exists in HTML text.

---

## 18. SEO & Performance (implementation notes)

- Single HTML file with semantic content readable without JS (progressive enhancement).
- `<title>`, meta description, Open Graph, `lang="ko"`, JSON-LD `MedicalClinic` schema.
- Libraries via CDN with `defer`; Three.js loaded lazily only when WebGL will run. Fonts: Google Fonts with `display=swap`, preconnect. Lazy-load all below-fold media. Target: LCP < 2.5s on 4G.

---

## 19. Future Expansion Strategy

- Anchors graduate to pages: `/story`, `/music-night` (event archive), `/programs/:slug`, `/membership` (gated), `/journal` (editorial — the clinic as publisher of balance culture).
- Membership portal: login, private event RSVP, personal wellness record.
- Multilingual: KO primary → EN → JA/ZH for medical tourism.
- Component architecture in v1 (BEM-ish sections, CSS custom properties, JS modules per section) exists precisely so this growth needs no rewrite.

---

## 20. Final Design Philosophy

**The website is the first treatment.**

If a visitor leaves the page breathing slower than when they arrived, the design has succeeded — before a single appointment is booked. Restraint is the brand. Silence is the layout. Balance is the interaction model. Everything else is implementation detail.

---

## v2 — First Impression Overhaul (2026-07-08)

> v1 review verdict: the hero reads as a flat beige page, not a luxury threshold. The gradient is invisible, the Korean display type falls back to a generic serif, everything is center-aligned mid-tone with no tension, and there is no opening moment. v2 rebuilds the first impression around a **"dusk gallery"** concept while keeping the v1 structure, sections, and philosophy intact.

### V2-A. Opening Sequence (the curtain)
- First visit only (`sessionStorage` flag): ~1.6s near-black (`--night`) full-screen veil. Wordmark "The Balance" fades in letter-spaced; a 1px gold hairline draws horizontally beneath it; then the veil slides up (expo-out, 1.0s) revealing the hero.
- Revisits and `prefers-reduced-motion`: skip entirely, no flash.
- Total budget ≤ 2.0s; content behind is already rendered (no layout jank on reveal).

### V2-B. Hero — "Dusk Gallery" (biggest change)
- **Background goes dark.** WebGL shader on `--night` (#0E0D0B): a slow-drifting warm light bloom (umber → gold, like last daylight through a gallery window) moving across the field on a ~14s cycle. Clearly *visible* motion at a glance — if a screenshot looks like a flat color, it has failed. CSS animated-gradient fallback in the same palette.
- **Composition is asymmetric, editorial.** Headline left-aligned on desktop (centered on mobile):
  - KR display: **Noto Serif KR** weight 200–300, `clamp(3rem, 7.5vw, 7rem)`, ivory `#EDE8E0`, tight leading. Lines: "몸과 마음이," / "제자리로."
  - Per-line clip-mask rise reveal (overflow-hidden line wrappers, translateY 110% → 0, stagger 120ms), starting right after the curtain lifts.
  - Beneath: Cormorant Garamond *italic* — "A private wellness sanctuary — Gangnam" in umber-gold.
- **Gallery placard corners** (fills the emptiness with quiet detail): bottom-left `EST. 2026 — GANGNAM`, bottom-right `3F PRIVATE WELLNESS`, 10–11px tracked uppercase, `--umber` tone. Nav (top) renders ivory over the dark hero.
- Scroll cue: vertical 1px gold hairline, center-bottom, height pulsing 24→48px.

### V2-C. Typography Upgrade (sitewide)
- **KR display: Noto Serif KR** (Google Fonts, weights 200/300/400) — replaces the system-serif fallback everywhere Korean display text appears. EN texture stays Cormorant Garamond (add Italic). Body stays Pretendard/Noto Sans KR.
- Display scale up one notch across sections. Every section header gets an **index number** (`01`–`07`) in ghosted Cormorant italic (large, ~20% opacity) beside/behind the section label, e.g. `01 — PHILOSOPHY`.

### V2-D. The Light Arc (section color narrative)
Night (hero) → dawn → day → night → day: hero dark, philosophy transitions from dark into ivory via a long gradient band ("dawn"), wellness/programs ivory, Music Night & membership dark (unchanged), reserve warm ivory. Use ScrollTrigger `body`/section background-color tweens so section boundaries feel continuous, not hard cuts.

### V2-E. Texture & Detail
- **Global film grain**: fixed full-screen SVG `feTurbulence` noise (data-URI, ~3–4% opacity, `pointer-events:none`), sitewide. This alone kills the "flat" feeling.
- Hairline rules with a small gold tick between sections; consistent placard-style section labels.
- Program cards: duotone gradient "artwork" placeholders with grain, ghost index numerals, hover = image scale 1.04 + gold underline draw (keep v1 behavior, richer surfaces).

### V2-F. Motion Upgrades
- Clip-mask line reveals replace plain fade-up for all display headlines (body copy keeps fade-up).
- 1px gold **scroll progress hairline** fixed at the very top.
- Nav link hover: hairline draws left→right (replace default underline/opacity).
- Keep all v1 timing/easing rules (§7); nothing bounces.

### V2-G. Performance Guard
- During v1 verification, screenshot capture at 1440×900 hung — audit the render loops: remove `preserveDrawingBuffer: true` unless strictly needed, keep DPR ≤ 1.5, confirm both scenes pause via IntersectionObserver + `visibilitychange`, and ensure rAF loops stop when paused (no work per frame while hidden). The dark hero shader must stay cheap: one full-screen quad, no extra passes.
- Grain overlay must be a static tiled texture (no per-frame JS).

### V2 acceptance test
A cold-load screenshot of the first viewport must look like a luxury brand film still — dark, textured, asymmetric, with elegant serif Korean type — and *unmistakably different* from a default template. If it could pass for a bootstrap page, iterate.

---

## v3 — "The Invitation" Brand Alignment (2026-07-08)

> Source of truth: the actual promotional materials in `clinic/samples/` (Music Night invitation, envelope invitation with TB wax seal, Grand Opening poster, membership posters). The real brand language is **champagne ivory + gold foil + classical serif + script accents + jewel-tone membership cards** — warm and invitation-like, NOT the v2 dark dusk-gallery. v3 re-skins the site to match the brand while keeping v2's craft (opening sequence concept, film grain, clip-mask reveals, index numbers, scroll-driven color arc, performance guards). Where v2 conflicts with v3, **v3 wins**.

### V3-A. Canonical brand facts (use exactly — no fabricated content)
- Name: **더밸런스강남의원 / The Balance Gangnam Clinic** · monogram **TB** (wax-seal style)
- Taglines: "Quiet Precision, Deep Balance." · "A Place where your body finds its balance" · "Balance Better, Live Better."
- Address: 서울특별시 강남구 역삼동 819-2 F3 (3F) · Tel (reservation only): **02-6677-6022** · Instagram: @the.balance.gangnam
- Directions: 지하철 2호선 강남역 12번 출구 도보 2분 / 11번 출구 도보 2분 · 주차: 역삼 문화공원 공용주차장 도보 1분
- **Music Night** (개원 기념, the inaugural event): 2025년 7월 14일 (화) 오후 5시 · 3F · Program: 축하 인사 · 소개 · 특별 공연 · 다과 · Hosts: 유미자 교수 (뮤직 테라피 원장) & 나광문 대표원장. Frame as the signature series that began with the opening night — do not invent future dates.
- **Private Membership** (3층 확장 기념 프라이빗 웰니스 멤버쉽): three tiers — 1억 / 5천만 / 1천만 KRW (poster colors: forest green / deep purple / burgundy). Concierge care: 1:1 프라이빗 컨설팅 · 유연한 스케줄 관리 · 프라이빗 시술룸 · 평생 케어 관리. 발급일로부터 2년 · 본인 직계가족 사용 가능 · Reservation only.
- Wellness programs (names only on homepage, **no prices** outside membership tiers): 광양자 관리 · 메디컬 아로마 테라피 · 브레인 바디 디톡스 · 고압산소치료 · MCT 자가혈 줄기세포 · SVF 자가지방 줄기세포+MCT

### V3-B. Visual language (re-skin)
- **Palette:** bg champagne `#F6F1E7` / parchment `#EFE6D8` · text ink-brown `#3A3128` · gold foil gradient `#B08D57 → #D4B978` (hairlines, ornaments) · envelope taupe `#8B7D6E` · dark sections warm brown-black `#171310` (never pure black) with champagne text `#EFE6D8` · jewel accents: forest `#1E3A2A`, aubergine `#3B2A4A`, bordeaux `#4A2430` (membership cards only). Update `tokens.css` accordingly.
- **Typography:** EN display Cormorant Garamond (keep) · KR display Noto Serif KR (keep) · body Pretendard (keep) · **add a script accent font** (Google Fonts "Pinyon Script" or "Great Vibes") used ONLY for short English flourishes like "A Night of Music".
- **Motifs from the materials:** TB wax-seal monogram (inline SVG circle-seal), double hairline dividers with a center ✦ ornament, thin gold corner flourishes on key panels (like the invitation card border), subtle paper grain (keep v2 grain), music-note hints only in Music Night.

### V3-C. Opening sequence — "The Envelope" (replaces v2 curtain)
Taupe textured envelope back fills the screen with the TB wax seal at center ("PRIVATE INVITATION" tracked above it). The seal lifts/fades, the flap opens (CSS 3D rotateX), the envelope slides down revealing the hero — receiving the invitation. ≤ 2.2s total, DOM/CSS transforms only, sessionStorage skip on revisit, reduced-motion skips entirely.

### V3-D. Hero — "Private Invitation" (back to light)
Champagne paper background with the WebGL warm gold light drift re-tuned to the light palette (visible, soft, like foil catching light; CSS fallback same palette). Composition: tracked eyebrow `PRIVATE INVITATION`, gold hairline+✦, KR headline "몸과 마음이, 제자리로." (Noto Serif KR, clip-mask line reveals), script line "A Night of Music — The Balance", placard corners: `THE BALANCE GANGNAM — 역삼동 819-2 F3` / `3F PRIVATE WELLNESS`. Nav ink-brown over champagne; keep frosted after 100vh.

### V3-E. Section content & skin updates
1. **Philosophy** — keep manifesto; close with "Quiet Precision, Deep Balance."
2. **Music Night** — warm brown-black panel, champagne-gold particles (retune colors), real event facts (V3-A): date/time/3F, program list, hosts credit. RSVP button becomes `tel:02-6677-6022` link. Keep ambient toggle.
3. **Wellness triptych** — keep Body/Mind/Balance; subline "신체의 본래 균형을 되찾는 곳".
4. **Programs** — replace invented programs with the six real program names (V3-A), duotone champagne/gold card surfaces, no prices.
5. **Membership** — three jewel-tone tier cards (forest/aubergine/bordeaux) with gold TB monogram embossing feel (inset shadow + gold text), tier price shown quietly (1억 / 5천만 / 1천만 KRW), shared notes: concierge care 4 items, 2년 유효 · 직계가족 사용 가능, "RESERVATION ONLY · 02-6677-6022".
6. **Reserve** — keep the quiet form; add real contact block: tel (click-to-call), address, directions, parking, Instagram.
7. **Footer** — "Quiet Precision, Deep Balance — The Balance Gangnam Clinic." + © 더밸런스강남의원 + @the.balance.gangnam.
8. Remove v1/v2 fabricated facts everywhere (EST. 2026, monthly-Thursday schedule, invented program names).

### V3-F. Keep from v2 (unchanged)
Film grain overlay · clip-mask headline reveals · gold scroll-progress hairline · ghosted index numbers 01–07 · scroll-driven background tweens (now champagne ↔ brown-black) · all V2-G performance guards.

### V3 acceptance test
Cold-load first viewport must read as a piece of the same brand system as `clinic/samples/` — champagne + gold foil + classical serif + script accent — and every fact on the page must trace to V3-A. Compare side-by-side with the invitation images before calling it done.

---

## Implementation Requirements (for the frontend engineer)

- HTML5 / CSS / vanilla JavaScript — **no framework, no build step**
- Three.js (CDN, lazy), GSAP + ScrollTrigger (CDN), Lenis (CDN)
- Entry point: `clinic/index.html`; assets under `clinic/css/`, `clinic/js/`
- Component architecture: one JS module per section concern (scroll, hero-gl, music-gl, nav, form)
- Responsive & mobile-first; WebGL optimized (DPR cap, lazy init, dispose, visibility pause)
- Progressive enhancement, accessibility (§17), SEO (§18), fast + lazy loading
- Follow this specification exactly. Do not redesign.
