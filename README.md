# Martin personal site

Next.js personal site with a Hasselblad 503CW–inspired homepage composite (Approach A: layered base still + dial wind video + viewfinder section images).

## Homepage

### Assets (`public/hasselblad/`)

| Path | Role |
|------|------|
| `base-v23.jpg` | Locked landing base still (black curtains). `base.jpg` is the same file so the previous URL still resolves |
| `dial-wind-v23-black-curtains.mp4` | Locked idle wind clip (one RHS-clockwise cycle, green viewfinder) |
| `dial-wind-v18.mp4` | Previous wind clip, kept so the old URL still resolves |
| `vf-mask.svg` | Rest-pose viewfinder glass mask (v23 rect 524,300 234×233) |
| `vf-track.json` | 73-frame / 24fps glass track. The thumb and mask hole follow it during wind |
| `vf-bounds-v23.json` | Locked glass rect for the v23 still |
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
