# Martin personal site

Next.js personal site with a Hasselblad 503CW–inspired homepage composite (Approach A: layered base still + dial wind video + viewfinder section images).

## Homepage

### Assets (`public/hasselblad/`)

| Path | Role |
|------|------|
| `base.jpg` | Landing base still |
| `dial-wind-v18.mp4` | Locked idle wind clip (one RHS-clockwise cycle) |
| `vf-mask.svg` | Viewfinder glass mask |
| `sections/*.jpg` | Per-section viewfinder photos (`developer`, `writer`, `documenter`, `photographer`, `driver`) |

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
