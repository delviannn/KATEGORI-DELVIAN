-- Jalankan satu kali di Supabase SQL Editor setelah mencadangkan database.
-- Perluasan skema US-15 sampai US-50. Tabel produk yang ada tetap dipakai.
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from auth.users u
    where u.id = auth.uid()
      and coalesce(u.raw_app_meta_data ->> 'role', '') = 'admin'
      and (u.banned_until is null or u.banned_until <= now())
  );
$$;
revoke all on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

alter table public.produk
  add column if not exists stok integer not null default 0 check (stok >= 0),
  add column if not exists aktif boolean not null default true,
  add column if not exists urutan integer not null default 0,
  add column if not exists harga_coret integer check (harga_coret is null or harga_coret >= harga),
  add column if not exists foto_lainnya text[] not null default '{}',
  add column if not exists varian jsonb not null default '[]',
  add column if not exists dilihat integer not null default 0,
  add column if not exists diperbarui_at timestamptz not null default now();

create table if not exists public.kategori (
  id bigint generated always as identity primary key,
  nama text not null unique,
  slug text not null unique,
  urutan integer not null default 0,
  created_at timestamptz not null default now()
);
create table if not exists public.pengaturan_toko (
  id boolean primary key default true check (id), nama text not null,
  tagline text not null default '', nomor_whatsapp text not null,
  alamat text not null default '', jam_buka text not null default '',
  banner_judul text, banner_deskripsi text, banner_foto text,
  diperbarui_at timestamptz not null default now()
);
create table if not exists public.ulasan (
  id bigint generated always as identity primary key,
  produk_id bigint not null references public.produk(id) on delete cascade,
  nama text not null check (char_length(nama) between 2 and 80),
  rating smallint not null check (rating between 1 and 5),
  isi text not null check (char_length(isi) between 5 and 1200),
  status text not null default 'menunggu' check (status in ('menunggu','disetujui','ditolak')),
  created_at timestamptz not null default now()
);
create table if not exists public.klik_whatsapp (
  id bigint generated always as identity primary key,
  produk_id bigint references public.produk(id) on delete set null,
  jumlah integer not null default 1 check (jumlah between 1 and 1000),
  created_at timestamptz not null default now()
);
create table if not exists public.log_admin (
  id bigint generated always as identity primary key,
  admin_id uuid not null, aksi text not null, entitas text not null,
  entitas_id text, created_at timestamptz not null default now()
);
create table if not exists public.rate_limit_bucket (
  bucket_key text primary key,
  window_started_at timestamptz not null default now(),
  hits integer not null default 0
);
alter table public.rate_limit_bucket enable row level security;

create or replace function public.rate_limit_consume(bucket_key text, request_limit integer, window_seconds integer)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare current_hits integer;
begin
  if $2 < 1 or $3 < 1 or $3 > 86400
    or $1 !~ '^[0-9a-f]{64}$' then
    return false;
  end if;
  insert into public.rate_limit_bucket (bucket_key, window_started_at, hits)
  values ($1, now(), 1)
  on conflict on constraint rate_limit_bucket_pkey do update set
    hits = case when public.rate_limit_bucket.window_started_at < now() - make_interval(secs => $3)
      then 1 else public.rate_limit_bucket.hits + 1 end,
    window_started_at = case when public.rate_limit_bucket.window_started_at < now() - make_interval(secs => $3)
      then now() else public.rate_limit_bucket.window_started_at end
  returning hits into current_hits;
  if random() < 0.01 then
    delete from public.rate_limit_bucket
    where window_started_at < now() - interval '1 day';
  end if;
  return current_hits <= $2;
end;
$$;
revoke all on function public.rate_limit_consume(text, integer, integer) from public, anon, authenticated;
grant execute on function public.rate_limit_consume(text, integer, integer) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg','image/png','image/webp'])
on conflict (id) do update set public = true, file_size_limit = 5242880,
  allowed_mime_types = array['image/jpeg','image/png','image/webp'];
drop policy if exists product_images_admin_upload on storage.objects;
create policy product_images_admin_upload on storage.objects for insert to authenticated
with check (bucket_id = 'product-images' and public.is_admin());
drop policy if exists product_images_admin_update on storage.objects;
create policy product_images_admin_update on storage.objects for delete to authenticated
using (bucket_id = 'product-images' and public.is_admin());
create index if not exists produk_kategori_idx on public.produk(kategori);
create index if not exists produk_aktif_urutan_idx on public.produk(aktif, urutan, id);
create index if not exists ulasan_produk_status_idx on public.ulasan(produk_id, status);
create index if not exists klik_whatsapp_produk_created_idx on public.klik_whatsapp(produk_id, created_at desc);
create index if not exists log_admin_created_idx on public.log_admin(created_at desc);

create or replace function public.kategori_produk_aktif()
returns table(kategori text)
language sql
stable
security invoker
set search_path = ''
as $$
  select distinct p.kategori
  from public.produk p
  where p.aktif and nullif(trim(p.kategori), '') is not null
  order by p.kategori;
$$;
revoke all on function public.kategori_produk_aktif() from public, anon, authenticated;
grant execute on function public.kategori_produk_aktif() to service_role;

create or replace function public.admin_ringkasan_produk()
returns table(total bigint, aktif bigint, stok_habis bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select count(*)::bigint,
    count(*) filter (where p.aktif)::bigint,
    count(*) filter (where p.stok = 0)::bigint
  from public.produk p;
$$;
revoke all on function public.admin_ringkasan_produk() from public, anon;
grant execute on function public.admin_ringkasan_produk() to authenticated, service_role;

create or replace function public.admin_produk_populer()
returns table(produk_id bigint, jumlah_klik bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select k.produk_id, count(*)::bigint
  from public.klik_whatsapp k
  where k.produk_id is not null
  group by k.produk_id
  order by count(*) desc, k.produk_id asc
  limit 5;
$$;
revoke all on function public.admin_produk_populer() from public, anon;
grant execute on function public.admin_produk_populer() to authenticated, service_role;

insert into public.kategori (nama, slug)
select distinct p.kategori,
  trim(both '-' from regexp_replace(lower(p.kategori), '[^a-z0-9]+', '-', 'g'))
from public.produk p
where nullif(trim(p.kategori), '') is not null
on conflict (nama) do nothing;

create or replace function public.sinkronkan_kategori_produk()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  category_name text;
  category_slug text;
begin
  category_name := nullif(trim(new.kategori), '');
  if category_name is not null then
    category_slug := trim(both '-' from regexp_replace(lower(category_name), '[^a-z0-9]+', '-', 'g'));
    if category_slug = '' then category_slug := 'kategori'; end if;
    category_slug := category_slug || '-' || left(md5(lower(category_name)), 8);
    insert into public.kategori (nama, slug)
    values (category_name, category_slug)
    on conflict (nama) do update set slug = excluded.slug;
  end if;
  return new;
end;
$$;
revoke all on function public.sinkronkan_kategori_produk() from public, anon, authenticated;
drop trigger if exists sinkron_kategori_produk on public.produk;
create trigger sinkron_kategori_produk
  after insert or update of kategori on public.produk
  for each row execute function public.sinkronkan_kategori_produk();

alter table public.kategori enable row level security;
alter table public.pengaturan_toko enable row level security;
alter table public.ulasan enable row level security;
alter table public.klik_whatsapp enable row level security;
alter table public.log_admin enable row level security;

drop policy if exists kategori_baca_admin on public.kategori;
create policy kategori_baca_admin on public.kategori for select to authenticated using (public.is_admin());
drop policy if exists kategori_kelola_admin on public.kategori;
create policy kategori_kelola_admin on public.kategori for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists toko_baca_admin on public.pengaturan_toko;
create policy toko_baca_admin on public.pengaturan_toko for select to authenticated using (public.is_admin());
drop policy if exists toko_ubah_admin on public.pengaturan_toko;
create policy toko_ubah_admin on public.pengaturan_toko for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists ulasan_baca_publik on public.ulasan;
create policy ulasan_baca_publik on public.ulasan for select to anon, authenticated using (status = 'disetujui');
drop policy if exists ulasan_kelola_admin on public.ulasan;
create policy ulasan_kelola_admin on public.ulasan for all to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists klik_baca_admin on public.klik_whatsapp;
create policy klik_baca_admin on public.klik_whatsapp for select to authenticated using (public.is_admin());
drop policy if exists log_baca_admin on public.log_admin;
create policy log_baca_admin on public.log_admin for select to authenticated using (public.is_admin());

drop policy if exists admin_baca_produk on public.produk;
create policy admin_baca_produk on public.produk for select to authenticated using (public.is_admin());
drop policy if exists admin_tambah_produk on public.produk;
create policy admin_tambah_produk on public.produk for insert to authenticated with check (public.is_admin());
drop policy if exists admin_ubah_produk on public.produk;
create policy admin_ubah_produk on public.produk for update to authenticated using (public.is_admin()) with check (public.is_admin());
drop policy if exists admin_hapus_produk on public.produk;
create policy admin_hapus_produk on public.produk for delete to authenticated using (public.is_admin());

-- Penulisan analytics dan ulasan publik dilakukan hanya melalui server route,
-- menggunakan secret key yang tidak pernah dikirim ke browser.
