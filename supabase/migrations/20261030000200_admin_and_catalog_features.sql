alter table public.produk
  add column if not exists kategori_id bigint,
  add column if not exists urutan integer not null default 0;

do $$ begin
  alter table public.produk add constraint produk_kategori_id_fkey
    foreign key (kategori_id) references public.kategori(id) on delete restrict;
exception when duplicate_object then null;
end $$;

create index if not exists produk_kategori_id_idx on public.produk(kategori_id);
create index if not exists ulasan_created_status_idx on public.ulasan(status, created_at desc);

alter table public.pengaturan_toko
  add column if not exists promo_aktif boolean not null default false,
  add column if not exists promo_tautan text,
  add column if not exists diperbarui_at timestamptz not null default now();

create or replace function public.sinkronkan_kategori_produk()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare category_name text; category_slug text; category_id bigint;
begin
  category_name := nullif(trim(new.kategori), '');
  if category_name is null then
    new.kategori_id := null;
    return new;
  end if;
  category_slug := trim(both '-' from regexp_replace(lower(category_name), '[^a-z0-9]+', '-', 'g'));
  if category_slug = '' then category_slug := 'kategori'; end if;
  category_slug := category_slug || '-' || left(md5(lower(category_name)), 8);
  insert into public.kategori (nama, slug)
  values (category_name, category_slug)
  on conflict (nama) do update set slug = excluded.slug
  returning id into category_id;
  new.kategori_id := category_id;
  return new;
end;
$$;

drop trigger if exists sinkron_kategori_produk on public.produk;
create trigger sinkron_kategori_produk
  before insert or update of kategori on public.produk
  for each row execute function public.sinkronkan_kategori_produk();

update public.produk p set kategori_id = k.id
from public.kategori k where trim(p.kategori) = k.nama and p.kategori_id is distinct from k.id;

create or replace function public.admin_ubah_kategori(category_id bigint, new_name text)
returns void language plpgsql security invoker set search_path = ''
as $$
declare old_name text; clean_name text; new_slug text;
begin
  if not public.is_admin() then raise exception 'forbidden'; end if;
  clean_name := nullif(trim(new_name), '');
  if clean_name is null or char_length(clean_name) > 60 then raise exception 'invalid_category'; end if;
  select k.nama into old_name from public.kategori k where k.id = $1 for update;
  if old_name is null then raise exception 'category_not_found'; end if;
  new_slug := trim(both '-' from regexp_replace(lower(clean_name), '[^a-z0-9]+', '-', 'g'));
  if new_slug = '' then new_slug := 'kategori'; end if;
  new_slug := new_slug || '-' || left(md5(lower(clean_name)), 8);
  insert into public.kategori (nama, slug) values (clean_name, new_slug)
    on conflict (nama) do update set slug = excluded.slug;
  update public.produk set kategori = clean_name where kategori_id = $1;
  delete from public.kategori where id = $1 and nama <> clean_name;
end;
$$;
revoke all on function public.admin_ubah_kategori(bigint, text) from public, anon;
grant execute on function public.admin_ubah_kategori(bigint, text) to authenticated;

create or replace function public.admin_produk_populer()
returns table(produk_id bigint, jumlah_klik bigint)
language sql stable security invoker set search_path = ''
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

