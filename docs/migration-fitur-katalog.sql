-- Jalankan satu kali di Supabase SQL Editor setelah mencadangkan database.
-- Perluasan skema US-15 sampai US-50. Tabel produk yang ada tetap dipakai.
create or replace function public.is_admin()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$
  select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin';
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
  if request_limit < 1 or window_seconds < 1 or window_seconds > 86400
    or bucket_key !~ '^[0-9a-f]{64}$' then
    return false;
  end if;
  insert into public.rate_limit_bucket (bucket_key, window_started_at, hits)
  values (bucket_key, now(), 1)
  on conflict (bucket_key) do update set
    hits = case when public.rate_limit_bucket.window_started_at < now() - make_interval(secs => window_seconds)
      then 1 else public.rate_limit_bucket.hits + 1 end,
    window_started_at = case when public.rate_limit_bucket.window_started_at < now() - make_interval(secs => window_seconds)
      then now() else public.rate_limit_bucket.window_started_at end
  returning hits into current_hits;
  if random() < 0.01 then
    delete from public.rate_limit_bucket
    where window_started_at < now() - interval '1 day';
  end if;
  return current_hits <= request_limit;
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

insert into public.kategori (nama, slug)
select distinct p.kategori,
  trim(both '-' from regexp_replace(lower(p.kategori), '[^a-z0-9]+', '-', 'g'))
from public.produk p
where nullif(trim(p.kategori), '') is not null
on conflict (nama) do nothing;

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
