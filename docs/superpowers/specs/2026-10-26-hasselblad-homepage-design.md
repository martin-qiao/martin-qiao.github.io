# Hasselblad Homepage Design Spec

Date: 2026-10-26  
Site: martinqiao.com (personal)  
Repo: https://github.com/martin-qiao/martin-qiao.github.io  
Status: Draft for review — do not implement until approved

## Goal

Homepage is a waist-level Hasselblad 503CW view: the viewfinder glass is the section preview; the winding crank cycles sections; clicking the glass opens the full section in an overlay. Audience: peers, hiring, personal notebook.

## Locked visual direction

- Original generated 503CW landing still (IP-safe), not stock/Google.
- Label typeface: Special Elite (typewriter/stamp).
- Idle dial cue: native generated wind clip **v18** (`tone-previews/homepage-dial-wind-native-v18.mp4`):
  - One full wind only
  - Clockwise as seen from the camera’s right-hand side
  - Knurl + silver/black crank as one rigid piece; fixed crank length
  - Static home pose at start (before hand) and end (after hand exits)
  - Hand finishes to home, then moves out (no sudden pop)
- No engraved rim mark, no Advance Dial chrome, no bottom section-name buttons, no separate floating section card over the camera.

## Interaction approach (locked): A — Layered composite

Do **not** bake section photos into the wind MP4. Composite layers so admin can add sections without regenerating video.

### Layer stack (back → front)

1. Base camera / beach framing (still or non-glass parts of the scene)
2. Viewfinder content layer — section photo + Special Elite title, clipped to the glass polygon
3. Dial / hand wind video (v18) with the viewfinder glass punched out (mask / transparent hole)
4. Invisible hit targets: crank (cycle), glass (open)

### Timing & input

| Action | Behavior |
|--------|----------|
| Idle (~every 3s) | Play one v18 wind, then crossfade VF to next section |
| Click crank | Same advance as idle; reset 3s timer |
| Hover crank | Pointer cursor + slight dial brighten; fat hit target |
| Click glass | Open section overlay; **pause** auto-wind |
| Close overlay | Resume auto-wind on **same** section index (no skip) |

Crank **only** cycles the viewfinder preview. It does **not** open the section.

### Overlay

- Slide/panel over the camera (not full-page navigate, not in-place glass expand).
- Contains **full** section content.
- Dim or soft-blur camera behind.
- Close: X, Escape, or click-outside.
- Auto-wind paused while open.

### Viewfinder chrome (copy)

- Photo + section title in the glass.
- Title: Special Elite, **top** of glass, **left**-aligned, inset from the VF border to avoid overlap.

## Sections data

Ordered list (admin later; hardcode seed rows for first ship):

| Field | Purpose |
|-------|---------|
| `id` | Stable key |
| `label` | e.g. “A photographer” |
| `viewfinderImage` | Image shown in the glass |
| `overlayBody` | Full section content for the panel |

Seed roles under discussion (order TBD): A developer, A writer, A documenter, A photographer, A driver, etc. More added via admin portal later without redesigning the homepage shell.

## Assets

- Base still: `tone-previews/hasselblad-503cw-landing-base-v1.jpg`
- Wind cue: `tone-previews/homepage-dial-wind-native-v18.mp4`
- VF mask derived from measured glass bounds on the still (~prior debug: glass roughly 528,220–758,450 at 1280×720 — re-verify at implement time)

## Responsive & a11y

- Desktop: full camera hero.
- Narrow: scale composite to width; keep crank and glass hit targets large enough to tap.
- `prefers-reduced-motion`: skip wind video; crossfade glass only on timer/click.

## Out of scope (this spec)

- Admin portal UI (only the data shape the homepage expects)
- Shutter-button affordance (deferred)
- Exact section order and overlay content copy
- Implementation / framework choices (follow in implementation plan after approval)

## Success criteria

- Visitor discovers crank is interactive via idle wind (+ hover), without permanent labels.
- Clicking crank cycles VF preview only; clicking glass opens full section overlay.
- New sections can be added by data only (image + label + body), no new wind renders.
- Reduced-motion users still get section cycling without the hand video.

## Open items (non-blocking for shell)

- Final ordered list of seed sections and overlay layouts per role
- Exact VF mask polygon after final hero crop
- Overlay enter/exit motion (direction, duration)
