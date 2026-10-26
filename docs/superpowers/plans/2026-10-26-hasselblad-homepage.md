# Hasselblad Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a Next.js homepage that composites the locked Hasselblad hero (base still + v18 wind video + swappable viewfinder content) with crank cycle, glass overlay, and 3s auto-advance per the approved design spec.

**Architecture:** Greenfield Next.js App Router app in this workspace (repo target: `martin-qiao/martin-qiao.github.io`). Homepage is a layered composite: base still, clipped VF content (photo + Special Elite title), masked v18 dial video, invisible hit targets. Section list is data-driven (`sections.ts` seed now; admin later). Client component owns timer, wind playback, and overlay open/close.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, CSS Modules (or Tailwind if scaffold prefers), `next/font` for Special Elite (Google Fonts), Vercel deploy.

**Spec:** `docs/superpowers/specs/2026-10-26-hasselblad-homepage-design.md`

## Global Constraints

- Idle wind asset locked: `tone-previews/homepage-dial-wind-native-v18.mp4` (one RHS-clockwise cycle).
- Base still: `tone-previews/hasselblad-503cw-landing-base-v1.jpg`.
- Approach A only: layered composite — never bake section photos into the wind MP4.
- Crank click cycles VF only; glass click opens full-section overlay.
- Auto-wind ~every 3s; pause while overlay open; resume same index.
- Title: Special Elite, top-left in glass, inset from border.
- No engraved rim mark, Advance Dial chrome, bottom section chips, or floating section card.
- `prefers-reduced-motion`: skip wind video; crossfade glass only.
- Do not implement admin portal UI in this plan (data shape only).
- Shutter affordance deferred.

---

## File structure (create)

```
martin-personal-site/          # become the Next.js app root (or `app/` sibling — prefer promote workspace root)
  package.json
  next.config.ts
  tsconfig.json
  public/
    fonts/                     # if self-host; else next/font Google
    hasselblad/
      base.jpg                 # from tone-previews still
      dial-wind-v18.mp4
      vf-mask.svg              # or PNG alpha mask of glass hole
  src/
    app/
      layout.tsx
      page.tsx                 # mounts HasselbladHero
      globals.css
    data/
      sections.ts              # seed Section[]
    lib/
      sections.ts              # types + nextIndex helpers
    components/
      hasselblad/
        HasselbladHero.tsx     # composite + state
        ViewfinderLayer.tsx    # photo + title clipped
        DialWindLayer.tsx      # video + mask
        HitTargets.tsx         # crank + glass buttons
        SectionOverlay.tsx     # full section panel
    components/hasselblad/
      hasselblad.module.css
  docs/…                       # already present
  tone-previews/               # design assets (source); copy into public at Task 2
```

---

### Task 1: Scaffold Next.js app

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`
- Test: `npm run build` (smoke)

**Interfaces:**
- Produces: runnable `next dev` / `next build` with empty homepage placeholder

- [ ] **Step 1: Scaffold**

From `/workspace/martin-personal-site`, if no `package.json` yet:

```bash
npx create-next-app@latest . --typescript --eslint --app --src-dir --import-alias "@/*" --turbopack --yes
```

If create-next-app refuses non-empty dir, scaffold into `/tmp/mq-app` and move `package.json`, `src`, configs into workspace without deleting `docs/` or `tone-previews/`.

- [ ] **Step 2: Verify build**

```bash
cd /workspace/martin-personal-site && npm run build
```

Expected: success (default page OK).

- [ ] **Step 3: Commit**

```bash
git init  # if needed
git add package.json package-lock.json next.config.ts tsconfig.json src
git commit -m "chore: scaffold Next.js app for hasselblad homepage"
```

---

### Task 2: Copy locked assets into `public/`

**Files:**
- Create: `public/hasselblad/base.jpg`, `public/hasselblad/dial-wind-v18.mp4`
- Modify: none

**Interfaces:**
- Produces: stable URLs `/hasselblad/base.jpg`, `/hasselblad/dial-wind-v18.mp4`

- [ ] **Step 1: Copy**

```bash
mkdir -p public/hasselblad
cp tone-previews/hasselblad-503cw-landing-base-v1.jpg public/hasselblad/base.jpg
cp tone-previews/homepage-dial-wind-native-v18.mp4 public/hasselblad/dial-wind-v18.mp4
ls -la public/hasselblad/
```

Expected: both files present, mp4 > 500KB.

- [ ] **Step 2: Commit**

```bash
git add public/hasselblad
git commit -m "assets: add locked Hasselblad base still and v18 wind clip"
```

---

### Task 3: Section types + seed data + cycle helper (TDD)

**Files:**
- Create: `src/lib/sections.ts`, `src/data/sections.ts`, `src/lib/sections.test.ts`
- Test: `src/lib/sections.test.ts`

**Interfaces:**
- Produces:
  - `export type Section = { id: string; label: string; viewfinderImage: string; overlayBody: string }`
  - `export function nextSectionIndex(current: number, length: number): number`
  - `export const SECTIONS: Section[]` from `src/data/sections.ts`

- [ ] **Step 1: Write failing tests**

```ts
// src/lib/sections.test.ts
import { nextSectionIndex } from "./sections";

test("advances within bounds", () => {
  expect(nextSectionIndex(0, 5)).toBe(1);
  expect(nextSectionIndex(3, 5)).toBe(4);
});

test("wraps to 0 after last", () => {
  expect(nextSectionIndex(4, 5)).toBe(0);
});

test("length 1 stays at 0", () => {
  expect(nextSectionIndex(0, 1)).toBe(0);
});
```

- [ ] **Step 2: Run tests — expect fail**

```bash
npm install -D vitest @vitejs/plugin-react jsdom
# add "test": "vitest run" to package.json scripts
npm test -- src/lib/sections.test.ts
```

Expected: FAIL (module missing).

- [ ] **Step 3: Implement**

```ts
// src/lib/sections.ts
export type Section = {
  id: string;
  label: string;
  viewfinderImage: string;
  overlayBody: string;
};

export function nextSectionIndex(current: number, length: number): number {
  if (length <= 0) return 0;
  return (current + 1) % length;
}
```

```ts
// src/data/sections.ts
import type { Section } from "@/lib/sections";

export const SECTIONS: Section[] = [
  {
    id: "developer",
    label: "A developer",
    viewfinderImage: "/hasselblad/sections/developer.jpg",
    overlayBody: "Placeholder: developer section body.",
  },
  {
    id: "writer",
    label: "A writer",
    viewfinderImage: "/hasselblad/sections/writer.jpg",
    overlayBody: "Placeholder: writer section body.",
  },
  {
    id: "documenter",
    label: "A documenter",
    viewfinderImage: "/hasselblad/sections/documenter.jpg",
    overlayBody: "Placeholder: documenter section body.",
  },
  {
    id: "photographer",
    label: "A photographer",
    viewfinderImage: "/hasselblad/sections/photographer.jpg",
    overlayBody: "Placeholder: photographer section body.",
  },
  {
    id: "driver",
    label: "A driver",
    viewfinderImage: "/hasselblad/sections/driver.jpg",
    overlayBody: "Placeholder: driver section body.",
  },
];
```

- [ ] **Step 4: Placeholder VF images**

Until real photos exist, copy `public/hasselblad/base.jpg` (or a cropped VF still) to each `public/hasselblad/sections/*.jpg` path so the UI loads without 404s. Replace later.

```bash
mkdir -p public/hasselblad/sections
for s in developer writer documenter photographer driver; do
  cp public/hasselblad/base.jpg "public/hasselblad/sections/$s.jpg"
done
```

- [ ] **Step 5: Run tests — expect pass**

```bash
npm test -- src/lib/sections.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add src/lib/sections.ts src/lib/sections.test.ts src/data/sections.ts public/hasselblad/sections package.json
git commit -m "feat: section types, seed data, and cycle helper"
```

---

### Task 4: Measure VF glass bounds + mask asset

**Files:**
- Create: `src/lib/vfGeometry.ts`, `public/hasselblad/vf-mask.svg` (or `.png`)
- Test: manual overlay check screenshot later

**Interfaces:**
- Produces:
  - `export const VF_BOUNDS = { leftPct: number; topPct: number; widthPct: number; heightPct: number }` as percentages of the 1280×720 hero (re-measure; prior debug ~ left 528/1280, top 220/720, width 230/1280, height 230/720)
  - Mask used by DialWindLayer so glass pixels are transparent

- [ ] **Step 1: Measure**

Open `public/hasselblad/base.jpg` at 1280×720. Record glass inner rect in px; convert to % of width/height. Write:

```ts
// src/lib/vfGeometry.ts
/** Percentages of hero box (0–100). Re-verify against base.jpg. */
export const VF_BOUNDS = {
  leftPct: 41.25,   // replace with measured
  topPct: 30.56,
  widthPct: 17.97,
  heightPct: 31.94,
};
```

- [ ] **Step 2: Mask**

Create `public/hasselblad/vf-mask.svg`: full-frame black rectangle with white (or transparent hole) rectangle matching VF_BOUNDS — choose convention documented in DialWindLayer (e.g. CSS `mask-image` where white = visible video, black = hole). Prefer hole over glass so Layer 2 shows through.

- [ ] **Step 3: Commit**

```bash
git add src/lib/vfGeometry.ts public/hasselblad/vf-mask.svg
git commit -m "feat: viewfinder geometry and dial video mask"
```

---

### Task 5: Presentational layers (Viewfinder + DialWind + HitTargets)

**Files:**
- Create: `src/components/hasselblad/ViewfinderLayer.tsx`, `DialWindLayer.tsx`, `HitTargets.tsx`, `hasselblad.module.css`
- Test: visual via `next dev` (no unit test required)

**Interfaces:**
- Consumes: `Section`, `VF_BOUNDS`
- Produces:
  - `<ViewfinderLayer section={Section} />`
  - `<DialWindLayer videoRef + src="/hasselblad/dial-wind-v18.mp4" reducedMotion={boolean} />`
  - `<HitTargets onCrankClick onGlassClick />`

- [ ] **Step 1: CSS module shell**

`hasselblad.module.css`: `.stage` position relative, aspect-ratio 1280/720, max-width 100%. Absolute children fill stage. `.vf` positioned with `VF_BOUNDS` percentages. `.title` Special Elite, top-left inset (~8% of vf box). `.crankHit` / `.glassHit` absolute, transparent, cursor pointer.

- [ ] **Step 2: ViewfinderLayer**

Renders section `viewfinderImage` as `object-fit: cover` inside `.vf`, plus `<p className={styles.title}>{section.label}</p>`. Crossfade handled by parent (two stacked instances or opacity transition on `section.id` key).

- [ ] **Step 3: DialWindLayer**

`<video src="/hasselblad/dial-wind-v18.mp4" playsInline muted preload="auto" />` with CSS mask so glass is transparent. Expose `ref` to parent. If `reducedMotion`, render nothing (or static last frame optional — prefer nothing).

- [ ] **Step 4: HitTargets**

Two `<button type="button" aria-label="…">`: crank (“Advance section”), glass (“Open section”). No visible chrome.

- [ ] **Step 5: Commit**

```bash
git add src/components/hasselblad
git commit -m "feat: Hasselblad presentational layers and hit targets"
```

---

### Task 6: HasselbladHero state machine (auto-wind + crank)

**Files:**
- Create: `src/components/hasselblad/HasselbladHero.tsx`
- Create: `src/components/hasselblad/usePrefersReducedMotion.ts`
- Test: `src/components/hasselblad/nextSectionIndex` already covered; optional React test later

**Interfaces:**
- Consumes: `SECTIONS`, `nextSectionIndex`, layers from Task 5
- Produces: `<HasselbladHero />` client component

- [ ] **Step 1: Wire page**

```tsx
// src/app/page.tsx
import { HasselbladHero } from "@/components/hasselblad/HasselbladHero";

export default function Home() {
  return <main><HasselbladHero /></main>;
}
```

Load Special Elite in `layout.tsx` via `next/font/google` (`Special_Elite`) and set CSS variable on `<body>`.

- [ ] **Step 2: State**

```ts
const [index, setIndex] = useState(0);
const [overlayOpen, setOverlayOpen] = useState(false);
const videoRef = useRef<HTMLVideoElement>(null);
const reducedMotion = usePrefersReducedMotion();
```

- [ ] **Step 3: `advance()`**

```ts
async function advance() {
  if (!reducedMotion && videoRef.current) {
    videoRef.current.currentTime = 0;
    await videoRef.current.play().catch(() => {});
    await waitForEvent(videoRef.current, "ended");
  }
  setIndex((i) => nextSectionIndex(i, SECTIONS.length));
}
```

- [ ] **Step 4: Timer**

`useEffect`: if `overlayOpen` or reduced path still runs interval without video — every 3000ms call `advance()` unless overlay open. Clear on unmount. Crank click: clear timeout, `advance()`, restart timer.

- [ ] **Step 5: Manual check**

`npm run dev` — confirm idle wind + VF label change; crank click advances; no open on crank.

- [ ] **Step 6: Commit**

```bash
git add src/app src/components/hasselblad
git commit -m "feat: HasselbladHero auto-wind and crank cycle"
```

---

### Task 7: SectionOverlay

**Files:**
- Create: `src/components/hasselblad/SectionOverlay.tsx`
- Modify: `HasselbladHero.tsx`, `hasselblad.module.css`

**Interfaces:**
- Consumes: `section: Section`, `onClose: () => void`
- Produces: focus-trapped panel (basic: Escape + backdrop click)

- [ ] **Step 1: Overlay UI**

Full section: title + `overlayBody`. Backdrop dim/blur. Close button. `role="dialog"` `aria-modal`.

- [ ] **Step 2: Wire glass hit**

Glass → `setOverlayOpen(true)`. While open, timer paused (Task 6). On close, resume same `index`.

- [ ] **Step 3: Manual check**

Open glass → overlay; Escape closes; auto-wind resumes without skipping.

- [ ] **Step 4: Commit**

```bash
git add src/components/hasselblad
git commit -m "feat: section overlay from viewfinder glass click"
```

---

### Task 8: Responsive + reduced-motion polish

**Files:**
- Modify: `hasselblad.module.css`, `HasselbladHero.tsx`, `DialWindLayer.tsx`

- [ ] **Step 1: CSS**

Stage `width: min(100%, 1200px); margin: 0 auto`. Hit targets min 44×44 CSS px on small screens (enlarge crank/glass hit boxes with padding).

- [ ] **Step 2: Reduced motion**

Confirm video not mounted / not played; interval still crossfades sections every 3s.

- [ ] **Step 3: Hover affordance**

Crank hit `:hover` / `:focus-visible` slight brightness on dial region (CSS filter on a dial-outline pseudo or video).

- [ ] **Step 4: Commit**

```bash
git add src/components/hasselblad
git commit -m "feat: responsive hit targets and reduced-motion path"
```

---

### Task 9: Build verify + deploy notes

**Files:**
- Modify: README snippet optional
- Test: `npm run build`

- [ ] **Step 1: Production build**

```bash
npm run build && npm run start
```

Expected: build success; homepage loads assets 200.

- [ ] **Step 2: Document**

Add short “Homepage” section to README: assets paths, how to replace section images, link to design spec.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: homepage asset and section swap notes"
```

---

## Spec coverage checklist

| Spec requirement | Task |
|------------------|------|
| Layered composite A | 5–6 |
| v18 wind + base assets | 2 |
| Crank cycles only | 6 |
| Glass opens overlay | 7 |
| Auto 3s + pause on overlay | 6–7 |
| Special Elite title top-left inset | 5 + layout font |
| Sections data shape | 3 |
| Reduced motion | 6, 8 |
| Responsive hit targets | 8 |
| No admin UI / shutter | out of scope |

## Execution Handoff

Plan complete and saved to `docs/superpowers/plans/2026-10-26-hasselblad-homepage.md`. Two execution options:

**1. Subagent-Driven (recommended)** — fresh subagent per task, review between tasks  
**2. Inline Execution** — execute tasks in this session with checkpoints

Which approach?
