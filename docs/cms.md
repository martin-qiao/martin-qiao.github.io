# Editorial CMS

Password-protected `/admin` edits the four homepage sections. Published rows are read on the server from Supabase. Image uploads go to Vercel Blob. If Supabase is not configured, or a published query fails or comes back empty, the homepage keeps the TypeScript mocks in `src/data/`.

Hasselblad dial, base, masks, and viewfinder stills stay in `public/hasselblad/`. They are not CMS content. Lens frames do include a `section_id` (the viewfinder role: `developer`, `learner`, `photographer`, `traveler`, `life-recorder`, `reader`, `movie-lover`) so the existing film reel can keep grouping photos.

`/admin` is not linked from the public nav.

## Environment

Copy `.env.example` to `.env.local`. Do not commit real values.

| Variable | Where |
| --- | --- |
| `SUPABASE_URL` | Server. Project URL. |
| `SUPABASE_ANON_KEY` | Server. Publishable/anon key. Used only to read **published** rows. Not a `NEXT_PUBLIC_` variable. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only. Admin reads and writes. Bypasses RLS. Never expose it to the browser. |
| `BLOB_READ_WRITE_TOKEN` | Server. Vercel Blob read-write token. |
| `ADMIN_PASSWORD` | Server. Shared password for `/admin/login`. |
| `ADMIN_SESSION_SECRET` | Optional. Signs the httpOnly session cookie. When omitted, the password is used as the signing secret, so changing the password signs everyone out. |

Set the same variables on the Vercel project for Production and Preview. The homepage cache is tagged `home-content` and refreshes when you save in admin.

## Apply the database migration

Migration file: `supabase/migrations/20261103080200_editorial_cms.sql`.

It creates `about`, `lens_frames`, `notes`, and `fidget`, enables row level security, lets the `anon` role `SELECT` published rows only, and seeds the current mock copy as published. Seed inserts use `ON CONFLICT DO NOTHING`, so running it again does not duplicate rows.

**Supabase SQL editor**

1. Open the project → SQL → New query.
2. Paste the migration file and run it.
3. Confirm RLS is on and that the anon key cannot read a row after you set `status` back to `draft`.

**Supabase CLI**

```bash
supabase link --project-ref <project-ref>
supabase db push
```

The service role key is under Project Settings → API. The anon key is the publishable key on the same page. Create a public Blob store in the Vercel project and copy `BLOB_READ_WRITE_TOKEN`.

## Admin

1. Open `/admin/login` and enter `ADMIN_PASSWORD`.
2. About is a single form (headline, markdown, résumé URL, selfies).
3. Lens, Notes, and Fidget are lists. Open a row to edit, or create one. Draft stays off the homepage. Published replaces that section once the list is non-empty.
4. Image fields accept a phone camera or gallery photo. Lens thumbs are center-cropped to a square in the browser when it can decode the file, then uploaded by `POST /api/admin/upload`.
5. On Notes, **New from link** (`POST /api/admin/notes/from-link`, or the form on the list) fetches a public page and saves a **draft**. It does not publish. Private hosts, loopback, link-local, and credentialed URLs are rejected. The fetch times out and does not follow redirects onto a private address.

Delete asks for confirmation.

## Homepage behavior

- **About:** published headline, markdown body, and résumé link. Selfie tiles replace the colored placeholders only after a photo URL is saved.
- **Lens:** published frames feed the film reel (`thumb_url`, title, date, section). An empty published set keeps `src/data/filmReel.ts`.
- **Notes:** published cards on the homepage (title, summary, month). There is no `/notes/[slug]` page in this version.
- **Fidget:** published tiles. A product URL links the title. An image shows when set.

Chapter eyebrows for Lens, Notes, and Fidget stay in `src/data/home.ts`.
