# Martin personal site

Next.js personal site with a Hasselblad 503CW–inspired homepage composite (Approach A: layered base still + dial wind video + viewfinder section images).

## Homepage

### Assets (`public/hasselblad/`)

| Path | Role |
|------|------|
| `base-v24i-lens-fixed.jpg` | Locked landing base still (black canvas, realistic lens scales). `base.jpg` is the same file so the previous URL still resolves |
| `dial-wind-v24i-lens-fixed.mp4` | Locked idle wind clip (one RHS-clockwise cycle, ~1.25s, even pace, green viewfinder, locked body, lens scales fixed) |
| `vf-mask.svg` | Rest-pose viewfinder glass mask (v24i rect 524,301 234×233). The framing preview does not punch this hole |
| `vf-track.json` | 30-frame / 24fps glass track. Body is locked, so every frame is the same rect |
| `vf-bounds-v24i.json` | Locked glass rect for the v24i still |
| `sections/*.jpg` | Per-section viewfinder photos (`developer`, `learner`, `photographer`, `traveler`, `life-recorder`, `reader`, `movie-lover`, plus `@2x`) |

### Swap section images / edit copy

1. Replace the matching file under `public/hasselblad/sections/` (keep the same filename, or update the path in seed data).
2. Edit labels and overlay body text in `src/data/sections.ts`.

Do not bake section photos into the wind MP4 — keep the layered composite.

### Design spec

See [`docs/superpowers/specs/2026-10-26-hasselblad-homepage-design.md`](docs/superpowers/specs/2026-10-26-hasselblad-homepage-design.md).

## Run

```bash
npm run dev      # local development
npm run build    # production build
npm run start    # serve the production build
```
