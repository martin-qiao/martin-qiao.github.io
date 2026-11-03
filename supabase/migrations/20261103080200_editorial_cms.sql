-- Editorial CMS tables for the martinqiao.com homepage.
-- Apply with the Supabase SQL editor or `supabase db push`.
-- Seed inserts are idempotent (ON CONFLICT DO NOTHING).
-- Camera chrome (dials, masks, viewfinder stills) stays in public/hasselblad
-- and is not stored here. section_id on lens_frames is the viewfinder role
-- so the existing film reel can keep grouping frames.

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = pg_catalog.now();
  return new;
end;
$$;

revoke all on function public.touch_updated_at() from public, anon, authenticated;

create table if not exists public.about (
  id smallint primary key default 1,
  headline text not null,
  body text not null,
  resume_url text,
  selfie_gallery jsonb not null default '[]'::jsonb,
  status text not null default 'draft',
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint about_singleton check (id = 1),
  constraint about_status check (status in ('draft', 'published')),
  constraint about_gallery_array check (jsonb_typeof(selfie_gallery) = 'array')
);

create table if not exists public.lens_frames (
  id text primary key,
  title text not null,
  caption text not null default '',
  shot_on date,
  thumb_url text,
  full_image_url text,
  section_id text,
  sort_key integer not null default 0,
  published_at timestamptz,
  status text not null default 'draft',
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint lens_frames_status check (status in ('draft', 'published')),
  constraint lens_frames_published_complete check (
    status <> 'published'
    or (
      thumb_url is not null
      and length(btrim(thumb_url)) > 0
      and section_id is not null
      and length(btrim(section_id)) > 0
    )
  )
);

create table if not exists public.notes (
  id text primary key,
  title text not null,
  summary text not null default '',
  body text not null default '',
  source_url text,
  og_image_url text,
  slug text not null,
  published_at timestamptz,
  status text not null default 'draft',
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint notes_status check (status in ('draft', 'published')),
  constraint notes_slug_unique unique (slug)
);

create table if not exists public.fidget (
  id text primary key,
  title text not null,
  summary text not null default '',
  product_url text,
  image_url text,
  sort_key integer not null default 0,
  status text not null default 'draft',
  created_at timestamptz not null default pg_catalog.now(),
  updated_at timestamptz not null default pg_catalog.now(),
  constraint fidget_status check (status in ('draft', 'published'))
);

create index if not exists lens_frames_public_idx
  on public.lens_frames (status, published_at desc nulls last, sort_key);

create index if not exists notes_public_idx
  on public.notes (status, published_at desc nulls last);

create index if not exists fidget_public_idx
  on public.fidget (status, sort_key);

drop trigger if exists about_touch on public.about;
create trigger about_touch
before update on public.about
for each row execute function public.touch_updated_at();

drop trigger if exists lens_frames_touch on public.lens_frames;
create trigger lens_frames_touch
before update on public.lens_frames
for each row execute function public.touch_updated_at();

drop trigger if exists notes_touch on public.notes;
create trigger notes_touch
before update on public.notes
for each row execute function public.touch_updated_at();

drop trigger if exists fidget_touch on public.fidget;
create trigger fidget_touch
before update on public.fidget
for each row execute function public.touch_updated_at();

comment on table public.about is 'Singleton homepage About section.';
comment on column public.about.selfie_gallery is 'JSON array of {blobUrl, caption}.';
comment on column public.lens_frames.section_id is 'Viewfinder role id from src/data/sections.ts.';
comment on column public.lens_frames.shot_on is 'Frame date used to order the film reel (newest first).';

insert into public.about (id, headline, body, resume_url, selfie_gallery, status)
values (
  1,
  'Building, shooting, and writing from Hong Kong.',
  $about$I work at the intersection of banking technology and side projects that scratch a creative itch. Days go to systems and risk; evenings to film photography, short technical notes, and small gadgets that make the desk more interesting. This site is the quiet shelf for that mix.$about$,
  '#',
  '[{"blobUrl":"","caption":"Harbor walk"},{"blobUrl":"","caption":"Studio light"},{"blobUrl":"","caption":"Weekend film"}]'::jsonb,
  'published'
)
on conflict (id) do nothing;

insert into public.lens_frames (
  id, title, caption, shot_on, thumb_url, full_image_url, section_id, sort_key, published_at, status
)
values
  ('developer-1', 'Viewfinder composite', '', '2026-10-26', '/hasselblad/film-reel/twilight-path.jpg', null, 'developer', 1, '2026-10-26T12:00:00Z', 'published'),
  ('developer-2', 'Crank as a button', '', '2026-10-14', '/hasselblad/film-reel/pink-peak.jpg', null, 'developer', 2, '2026-10-14T12:00:00Z', 'published'),
  ('developer-3', 'Green screen key', '', '2026-10-02', '/hasselblad/film-reel/pier.jpg', null, 'developer', 3, '2026-10-02T12:00:00Z', 'published'),
  ('developer-4', 'Even-pace wind', '', '2026-09-20', '/hasselblad/film-reel/red-leaves.jpg', null, 'developer', 4, '2026-09-20T12:00:00Z', 'published'),
  ('developer-5', 'Black curtain', '', '2026-09-08', '/hasselblad/film-reel/lake.jpg', null, 'developer', 5, '2026-09-08T12:00:00Z', 'published'),
  ('developer-6', 'Section seed data', '', '2026-08-27', '/hasselblad/film-reel/twilight-path.jpg', null, 'developer', 6, '2026-08-27T12:00:00Z', 'published'),
  ('developer-7', 'Preview deploys', '', '2026-08-15', '/hasselblad/film-reel/pink-peak.jpg', null, 'developer', 7, '2026-08-15T12:00:00Z', 'published'),
  ('learner-1', 'Notes on masking', '', '2026-09-18', '/hasselblad/film-reel/pink-peak.jpg', null, 'learner', 8, '2026-09-18T12:00:00Z', 'published'),
  ('learner-2', 'Reading the track', '', '2026-09-06', '/hasselblad/film-reel/pier.jpg', null, 'learner', 9, '2026-09-06T12:00:00Z', 'published'),
  ('learner-3', 'Square frame math', '', '2026-08-25', '/hasselblad/film-reel/red-leaves.jpg', null, 'learner', 10, '2026-08-25T12:00:00Z', 'published'),
  ('learner-4', 'Reduced motion', '', '2026-08-13', '/hasselblad/film-reel/lake.jpg', null, 'learner', 11, '2026-08-13T12:00:00Z', 'published'),
  ('learner-5', 'Hit target size', '', '2026-08-01', '/hasselblad/film-reel/twilight-path.jpg', null, 'learner', 12, '2026-08-01T12:00:00Z', 'published'),
  ('learner-6', 'Crossfade curve', '', '2026-07-20', '/hasselblad/film-reel/pink-peak.jpg', null, 'learner', 13, '2026-07-20T12:00:00Z', 'published'),
  ('learner-7', 'First still', '', '2026-07-08', '/hasselblad/film-reel/pier.jpg', null, 'learner', 14, '2026-07-08T12:00:00Z', 'published'),
  ('photographer-1', 'Twilight on the path', '', '2026-10-12', '/hasselblad/film-reel/pier.jpg', null, 'photographer', 15, '2026-10-12T12:00:00Z', 'published'),
  ('photographer-2', 'Alpenglow peak', '', '2026-09-30', '/hasselblad/film-reel/red-leaves.jpg', null, 'photographer', 16, '2026-09-30T12:00:00Z', 'published'),
  ('photographer-3', 'Pier at noon', '', '2026-09-18', '/hasselblad/film-reel/lake.jpg', null, 'photographer', 17, '2026-09-18T12:00:00Z', 'published'),
  ('photographer-4', 'Red maple', '', '2026-09-06', '/hasselblad/film-reel/twilight-path.jpg', null, 'photographer', 18, '2026-09-06T12:00:00Z', 'published'),
  ('photographer-5', 'Lake mirror', '', '2026-08-25', '/hasselblad/film-reel/pink-peak.jpg', null, 'photographer', 19, '2026-08-25T12:00:00Z', 'published'),
  ('photographer-6', 'Waist-level frame', '', '2026-08-13', '/hasselblad/film-reel/pier.jpg', null, 'photographer', 20, '2026-08-13T12:00:00Z', 'published'),
  ('photographer-7', 'Contact sheet', '', '2026-08-01', '/hasselblad/film-reel/red-leaves.jpg', null, 'photographer', 21, '2026-08-01T12:00:00Z', 'published'),
  ('traveler-1', 'Road before sunrise', '', '2026-08-30', '/hasselblad/film-reel/red-leaves.jpg', null, 'traveler', 22, '2026-08-30T12:00:00Z', 'published'),
  ('traveler-2', 'Ridge in pink light', '', '2026-08-18', '/hasselblad/film-reel/lake.jpg', null, 'traveler', 23, '2026-08-18T12:00:00Z', 'published'),
  ('traveler-3', 'Jetty, clear water', '', '2026-08-06', '/hasselblad/film-reel/twilight-path.jpg', null, 'traveler', 24, '2026-08-06T12:00:00Z', 'published'),
  ('traveler-4', 'Leaves overhead', '', '2026-07-25', '/hasselblad/film-reel/pink-peak.jpg', null, 'traveler', 25, '2026-07-25T12:00:00Z', 'published'),
  ('traveler-5', 'Still water', '', '2026-07-13', '/hasselblad/film-reel/pier.jpg', null, 'traveler', 26, '2026-07-13T12:00:00Z', 'published'),
  ('traveler-6', 'Pack the 80mm', '', '2026-07-01', '/hasselblad/film-reel/red-leaves.jpg', null, 'traveler', 27, '2026-07-01T12:00:00Z', 'published'),
  ('traveler-7', 'One roll left', '', '2026-06-19', '/hasselblad/film-reel/lake.jpg', null, 'traveler', 28, '2026-06-19T12:00:00Z', 'published'),
  ('life-recorder-1', 'The long way home', '', '2026-07-04', '/hasselblad/film-reel/lake.jpg', null, 'life-recorder', 29, '2026-07-04T12:00:00Z', 'published'),
  ('life-recorder-2', 'Light on the ridge', '', '2026-06-22', '/hasselblad/film-reel/twilight-path.jpg', null, 'life-recorder', 30, '2026-06-22T12:00:00Z', 'published'),
  ('life-recorder-3', 'Boards over water', '', '2026-06-10', '/hasselblad/film-reel/pink-peak.jpg', null, 'life-recorder', 31, '2026-06-10T12:00:00Z', 'published'),
  ('life-recorder-4', 'October color', '', '2026-05-29', '/hasselblad/film-reel/pier.jpg', null, 'life-recorder', 32, '2026-05-29T12:00:00Z', 'published'),
  ('life-recorder-5', 'Doubled mountains', '', '2026-05-17', '/hasselblad/film-reel/red-leaves.jpg', null, 'life-recorder', 33, '2026-05-17T12:00:00Z', 'published'),
  ('life-recorder-6', 'What the glass held', '', '2026-05-05', '/hasselblad/film-reel/lake.jpg', null, 'life-recorder', 34, '2026-05-05T12:00:00Z', 'published'),
  ('life-recorder-7', 'A quiet exposure', '', '2026-04-23', '/hasselblad/film-reel/twilight-path.jpg', null, 'life-recorder', 35, '2026-04-23T12:00:00Z', 'published'),
  ('reader-1', 'Margin notes', '', '2026-06-11', '/hasselblad/film-reel/twilight-path.jpg', null, 'reader', 36, '2026-06-11T12:00:00Z', 'published'),
  ('reader-2', 'A chapter at dusk', '', '2026-05-30', '/hasselblad/film-reel/pink-peak.jpg', null, 'reader', 37, '2026-05-30T12:00:00Z', 'published'),
  ('reader-3', 'The long pier', '', '2026-05-18', '/hasselblad/film-reel/pier.jpg', null, 'reader', 38, '2026-05-18T12:00:00Z', 'published'),
  ('reader-4', 'Pressed leaves', '', '2026-05-06', '/hasselblad/film-reel/red-leaves.jpg', null, 'reader', 39, '2026-05-06T12:00:00Z', 'published'),
  ('reader-5', 'Unread reflection', '', '2026-04-24', '/hasselblad/film-reel/lake.jpg', null, 'reader', 40, '2026-04-24T12:00:00Z', 'published'),
  ('reader-6', 'Field notebook', '', '2026-04-12', '/hasselblad/film-reel/twilight-path.jpg', null, 'reader', 41, '2026-04-12T12:00:00Z', 'published'),
  ('reader-7', 'Underlined line', '', '2026-03-31', '/hasselblad/film-reel/pink-peak.jpg', null, 'reader', 42, '2026-03-31T12:00:00Z', 'published'),
  ('movie-lover-1', 'Last light, wide', '', '2026-05-02', '/hasselblad/film-reel/pink-peak.jpg', null, 'movie-lover', 43, '2026-05-02T12:00:00Z', 'published'),
  ('movie-lover-2', 'Pink mountain', '', '2026-04-20', '/hasselblad/film-reel/pier.jpg', null, 'movie-lover', 44, '2026-04-20T12:00:00Z', 'published'),
  ('movie-lover-3', 'Walk to the end', '', '2026-04-08', '/hasselblad/film-reel/red-leaves.jpg', null, 'movie-lover', 45, '2026-04-08T12:00:00Z', 'published'),
  ('movie-lover-4', 'Red in the frame', '', '2026-03-27', '/hasselblad/film-reel/lake.jpg', null, 'movie-lover', 46, '2026-03-27T12:00:00Z', 'published'),
  ('movie-lover-5', 'Mirror scene', '', '2026-03-15', '/hasselblad/film-reel/twilight-path.jpg', null, 'movie-lover', 47, '2026-03-15T12:00:00Z', 'published'),
  ('movie-lover-6', 'Reel change', '', '2026-03-03', '/hasselblad/film-reel/pink-peak.jpg', null, 'movie-lover', 48, '2026-03-03T12:00:00Z', 'published'),
  ('movie-lover-7', 'End credits', '', '2026-02-19', '/hasselblad/film-reel/pier.jpg', null, 'movie-lover', 49, '2026-02-19T12:00:00Z', 'published')
on conflict (id) do nothing;

insert into public.notes (id, title, summary, body, slug, published_at, status)
values
  (
    'scroll-linked',
    'Scroll-linked animation without jank',
    'Sticky stages, transform budgets, and staying at 60fps on mid-range phones.',
    'Sticky stages, transform budgets, and staying at 60fps on mid-range phones.',
    'scroll-linked',
    '2026-10-01T00:00:00Z',
    'published'
  ),
  (
    'viewfinder-nav',
    'Why a viewfinder works as navigation',
    'Medium-format metaphor as section selector — and when it should stay a subpage.',
    'Medium-format metaphor as section selector — and when it should stay a subpage.',
    'viewfinder-nav',
    '2026-09-01T00:00:00Z',
    'published'
  ),
  (
    'vercel-ship',
    'Shipping a personal site on Vercel',
    'Preview URLs, squash merges, and a small checklist before production.',
    'Preview URLs, squash merges, and a small checklist before production.',
    'vercel-ship',
    '2026-08-01T00:00:00Z',
    'published'
  )
on conflict (id) do nothing;

insert into public.fidget (id, title, summary, sort_key, status)
values
  ('contax', 'Contax T2 (clone hunt)', 'Pocket point-and-shoot rabbit hole', 1, 'published'),
  ('kinetic', 'Desk kinetic toy', 'Magnetic fidget that actually stays put', 2, 'published'),
  ('film-reel-cli', 'film-reel CLI', 'Tiny Node tool that ranks frames by EXIF date', 3, 'published'),
  ('sticky-demo', 'Sticky stage demo', 'Minimal scrollytelling sandbox', 4, 'published')
on conflict (id) do nothing;

revoke all on table public.about from public, anon, authenticated;
revoke all on table public.lens_frames from public, anon, authenticated;
revoke all on table public.notes from public, anon, authenticated;
revoke all on table public.fidget from public, anon, authenticated;

grant select on table public.about to anon;
grant select on table public.lens_frames to anon;
grant select on table public.notes to anon;
grant select on table public.fidget to anon;

grant select, insert, update, delete on table public.about to service_role;
grant select, insert, update, delete on table public.lens_frames to service_role;
grant select, insert, update, delete on table public.notes to service_role;
grant select, insert, update, delete on table public.fidget to service_role;

alter table public.about enable row level security;
alter table public.lens_frames enable row level security;
alter table public.notes enable row level security;
alter table public.fidget enable row level security;

alter table public.about force row level security;
alter table public.lens_frames force row level security;
alter table public.notes force row level security;
alter table public.fidget force row level security;

drop policy if exists about_published_read on public.about;
create policy about_published_read
on public.about
for select
to anon
using (status = 'published');

drop policy if exists lens_frames_published_read on public.lens_frames;
create policy lens_frames_published_read
on public.lens_frames
for select
to anon
using (status = 'published');

drop policy if exists notes_published_read on public.notes;
create policy notes_published_read
on public.notes
for select
to anon
using (status = 'published');

drop policy if exists fidget_published_read on public.fidget;
create policy fidget_published_read
on public.fidget
for select
to anon
using (status = 'published');
