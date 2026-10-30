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
