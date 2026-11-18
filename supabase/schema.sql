-- U.A.R.V.I.S. · Esquema opcional para la función "Amigos"
-- Ejecutar este archivo en Supabase → SQL Editor → New query.
-- La anon key es pública: la seguridad la dan las políticas RLS de abajo.
-- Los datos de bienestar (check-in, energía, ánimo, sueño, diario, notas, calificaciones)
-- NO tienen tabla aquí y nunca se envían desde la app.

-- Permisos base. Quitamos los permisos anchos que Supabase da por defecto y los volvemos a dar
-- columna por columna donde hace falta (por ejemplo, en profiles solo se puede cambiar display_name).
grant usage on schema public to authenticated;

-- ===================== Tablas =====================

-- Perfil público mínimo: nombre visible y código para agregar amigos. Nada de bienestar.
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null check (char_length(display_name) between 1 and 60),
  friend_code text not null unique check (friend_code ~ '^[A-Z]{8}$'),
  created_at timestamptz not null default now()
);
comment on table public.profiles is 'Nombre visible y código de amigo. No contiene datos de bienestar.';
comment on column public.profiles.friend_code is '8 letras mayúsculas, generadas por el cliente; único en toda la tabla.';

create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester uuid not null references public.profiles (id) on delete cascade,
  addressee uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  constraint friendships_distinct check (requester <> addressee),
  constraint friendships_once unique (requester, addressee)
);
comment on table public.friendships is 'Solicitudes y amistades. Solo se escriben mediante RPC.';

-- Fechas que el usuario marca explícitamente como compartidas, por ramo.
-- local_id es el id local de S.events; nunca se envía el ramo completo ni sus notas.
create table if not exists public.shared_events (
  id uuid primary key default gen_random_uuid(),
  owner uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  local_id text not null check (char_length(local_id) between 1 and 80),
  course_name text not null check (char_length(course_name) between 1 and 120),
  title text not null check (char_length(title) between 1 and 200),
  date date not null,
  type text not null check (type in ('evaluacion', 'entrega', 'control', 'otro')),
  updated_at timestamptz not null default now(),
  constraint shared_events_unique unique (owner, local_id)
);
comment on table public.shared_events is 'Solo fechas de los ramos que el usuario marca como compartidos.';

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  host uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  title text not null check (char_length(title) between 1 and 200),
  course_name text not null check (char_length(course_name) between 1 and 120),
  date date not null,
  start_time time not null,
  end_time time not null,
  place text check (place is null or char_length(place) <= 200),
  note text check (note is null or char_length(note) <= 1000),
  created_at timestamptz not null default now(),
  constraint study_sessions_hours check (end_time > start_time)
);
comment on table public.study_sessions is 'Sesiones de estudio: lugar/enlace y nota son visibles para los invitados.';

create table if not exists public.session_invites (
  session_id uuid not null references public.study_sessions (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'invited' check (status in ('invited', 'accepted', 'declined')),
  primary key (session_id, user_id)
);
comment on table public.session_invites is 'Invitaciones. El estado solo se cambia por RPC.';

-- Ahora que las tablas existen, quitamos los permisos anchos que Supabase da por defecto
-- y los volvemos a dar columna por columna más abajo (en profiles solo display_name es editable).
revoke all on public.profiles from anon, authenticated;
revoke all on public.friendships from anon, authenticated;
revoke all on public.shared_events from anon, authenticated;
revoke all on public.study_sessions from anon, authenticated;
revoke all on public.session_invites from anon, authenticated;

-- Índices de las claves foráneas (y de los filtros más usados).
create index if not exists friendships_requester_idx on public.friendships (requester);
create index if not exists friendships_addressee_idx on public.friendships (addressee);
create index if not exists friendships_status_idx on public.friendships (status);
create index if not exists shared_events_owner_idx on public.shared_events (owner);
create index if not exists shared_events_date_idx on public.shared_events (date);
create index if not exists study_sessions_host_idx on public.study_sessions (host);
create index if not exists study_sessions_date_idx on public.study_sessions (date);
create index if not exists session_invites_user_idx on public.session_invites (user_id);

-- updated_at se mantiene solo, sin depender de lo que envíe el cliente.
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin
  new.updated_at = now();
  return new;
end $$;
drop trigger if exists shared_events_touch on public.shared_events;
create trigger shared_events_touch before update on public.shared_events
  for each row execute function public.touch_updated_at();

-- ===================== Row Level Security =====================
alter table public.profiles enable row level security;
alter table public.friendships enable row level security;
alter table public.shared_events enable row level security;
alter table public.study_sessions enable row level security;
alter table public.session_invites enable row level security;

-- Funciones helper SECURITY DEFINER: rompen la recursión entre políticas (leen tablas sin aplicar RLS).
create or replace function public.are_friends(a uuid, b uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if a is null or b is null or a = b then return false; end if;
  return exists (
    select 1 from public.friendships f
    where f.status = 'accepted'
      and ((f.requester = a and f.addressee = b) or (f.requester = b and f.addressee = a))
  );
end $$;
revoke all on function public.are_friends(uuid, uuid) from public;
grant execute on function public.are_friends(uuid, uuid) to authenticated;

-- "Miembro" = anfitrión o invitado (así el anfitrión ve el nombre de sus invitados).
create or replace function public.is_session_member(sid uuid)
returns boolean language plpgsql security definer set search_path = public as $$
begin
  if sid is null or auth.uid() is null then return false; end if;
  return exists (
    select 1 from public.study_sessions s
    where s.id = sid
      and (s.host = auth.uid() or exists (
        select 1 from public.session_invites i
        where i.session_id = s.id and i.user_id = auth.uid()
      ))
  );
end $$;
revoke all on function public.is_session_member(uuid) from public;
grant execute on function public.is_session_member(uuid) to authenticated;

-- profiles: se puede ver el propio perfil, amigos, solicitudes pendientes y compañeros de sesión.
-- Nunca se puede buscar por friend_code: esa búsqueda ocurre solo dentro del RPC.
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles for select to authenticated using (
  id = auth.uid()
  or public.are_friends(id, auth.uid())
  or exists (
    select 1 from public.friendships f
    where f.status = 'pending'
      and ((f.requester = auth.uid() and f.addressee = profiles.id)
        or (f.addressee = auth.uid() and f.requester = profiles.id))
  )
  or exists (
    select 1 from public.study_sessions s
    where (s.host = auth.uid() or exists (
        select 1 from public.session_invites i where i.session_id = s.id and i.user_id = auth.uid()))
      and (s.host = profiles.id or exists (
        select 1 from public.session_invites i2 where i2.session_id = s.id and i2.user_id = profiles.id))
  )
);
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles for insert to authenticated with check (id = auth.uid());
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles for update to authenticated
  using (id = auth.uid()) with check (id = auth.uid());
-- Importante: solo se concede UPDATE de display_name; friend_code/id no se pueden cambiar.
grant select, insert on public.profiles to authenticated;
grant update (display_name) on public.profiles to authenticated;

-- friendships: lectura y borrado para las partes. Sin INSERT/UPDATE directos: van por RPC.
drop policy if exists friendships_select on public.friendships;
create policy friendships_select on public.friendships for select to authenticated
  using (requester = auth.uid() or addressee = auth.uid());
drop policy if exists friendships_delete on public.friendships;
create policy friendships_delete on public.friendships for delete to authenticated
  using (requester = auth.uid() or addressee = auth.uid());
grant select, delete on public.friendships to authenticated;

-- shared_events: lectura para amigos; escritura solo del dueño.
drop policy if exists shared_events_select on public.shared_events;
create policy shared_events_select on public.shared_events for select to authenticated
  using (owner = auth.uid() or public.are_friends(owner, auth.uid()));
drop policy if exists shared_events_insert on public.shared_events;
create policy shared_events_insert on public.shared_events for insert to authenticated
  with check (owner = auth.uid());
drop policy if exists shared_events_update on public.shared_events;
create policy shared_events_update on public.shared_events for update to authenticated
  using (owner = auth.uid()) with check (owner = auth.uid());
drop policy if exists shared_events_delete on public.shared_events;
create policy shared_events_delete on public.shared_events for delete to authenticated
  using (owner = auth.uid());
grant select, insert, update, delete on public.shared_events to authenticated;

-- study_sessions: lectura de miembros; escritura solo del anfitrión.
drop policy if exists study_sessions_select on public.study_sessions;
create policy study_sessions_select on public.study_sessions for select to authenticated
  using (public.is_session_member(id));
drop policy if exists study_sessions_insert on public.study_sessions;
create policy study_sessions_insert on public.study_sessions for insert to authenticated
  with check (host = auth.uid());
drop policy if exists study_sessions_update on public.study_sessions;
create policy study_sessions_update on public.study_sessions for update to authenticated
  using (host = auth.uid()) with check (host = auth.uid());
drop policy if exists study_sessions_delete on public.study_sessions;
create policy study_sessions_delete on public.study_sessions for delete to authenticated
  using (host = auth.uid());
grant select, insert, update, delete on public.study_sessions to authenticated;

-- session_invites: lectura de miembros; el anfitrión invita a amigos; sin UPDATE directo.
drop policy if exists session_invites_select on public.session_invites;
create policy session_invites_select on public.session_invites for select to authenticated
  using (public.is_session_member(session_id));
drop policy if exists session_invites_insert on public.session_invites;
create policy session_invites_insert on public.session_invites for insert to authenticated
  with check (
    exists (select 1 from public.study_sessions s where s.id = session_id and s.host = auth.uid())
    and public.are_friends(auth.uid(), user_id)
  );
drop policy if exists session_invites_delete on public.session_invites;
create policy session_invites_delete on public.session_invites for delete to authenticated
  using (
    user_id = auth.uid()
    or exists (select 1 from public.study_sessions s where s.id = session_id and s.host = auth.uid())
  );
grant select, insert, delete on public.session_invites to authenticated;

-- ===================== RPCs (escrituras sensibles) =====================

-- Busca el código y crea la solicitud. Si la otra persona ya me invitó, la aceptamos.
-- El código no se puede consultar directamente en profiles: esto evita enumerar perfiles.
create or replace function public.send_friend_request(code text)
returns void language plpgsql security definer set search_path = public as $$
declare
  target uuid;
  inverse uuid;
begin
  if code is null or length(trim(code)) <> 8 then
    raise exception 'El código debe tener 8 letras.' using errcode = '22023';
  end if;
  select p.id into target from public.profiles p where p.friend_code = upper(trim(code));
  if target is null then raise exception 'No encontramos ese código de amigo.' using errcode = '22023'; end if;
  if target = auth.uid() then raise exception 'Ese código es tuyo.' using errcode = '22023'; end if;
  if public.are_friends(auth.uid(), target) then return; end if;

  select f.id into inverse from public.friendships f
   where f.requester = target and f.addressee = auth.uid() and f.status = 'pending' limit 1;
  if inverse is not null then
    update public.friendships f set status = 'accepted' where f.id = inverse;
    return;
  end if;

  insert into public.friendships (requester, addressee, status)
  values (auth.uid(), target, 'pending')
  on conflict (requester, addressee) do nothing;
end $$;
revoke all on function public.send_friend_request(text) from public;
grant execute on function public.send_friend_request(text) to authenticated;

-- Solo el destinatario puede responder. Rechazar borra la solicitud.
create or replace function public.respond_friend_request(id uuid, accept boolean)
returns void language plpgsql security definer set search_path = public as $$
declare
  v public.friendships%rowtype;
begin
  select * into v from public.friendships fr
   where fr.id = respond_friend_request.id and fr.addressee = auth.uid() and fr.status = 'pending';
  if not found then raise exception 'No encontramos esa solicitud.' using errcode = '22023'; end if;
  if accept then
    update public.friendships fr set status = 'accepted' where fr.id = v.id;
  else
    delete from public.friendships fr where fr.id = v.id;
  end if;
end $$;
revoke all on function public.respond_friend_request(uuid, boolean) from public;
grant execute on function public.respond_friend_request(uuid, boolean) to authenticated;

create table if not exists public.friendship_tombstones (
  actor uuid not null references auth.users(id) on delete cascade,
  other uuid not null references auth.users(id) on delete cascade,
  at timestamptz not null default now(),
  primary key (actor, other)
);
alter table public.friendship_tombstones enable row level security;
revoke all on table public.friendship_tombstones from public;

create or replace function public.remove_friend(other uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.friendship_tombstones (actor, other, at)
  values (auth.uid(), remove_friend.other, now())
  on conflict (actor, other) do update set at = now();
  delete from public.friendships f
   where f.status = 'accepted'
     and ((f.requester = auth.uid() and f.addressee = remove_friend.other)
       or (f.addressee = auth.uid() and f.requester = remove_friend.other));
end $$;
revoke all on function public.remove_friend(uuid) from public;
grant execute on function public.remove_friend(uuid) to authenticated;

create or replace function public.restore_friend(other uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not exists (select 1 from public.friendship_tombstones t
                  where t.actor = auth.uid() and t.other = restore_friend.other
                    and t.at >= now() - interval '10 seconds') then
    raise exception 'El tiempo para deshacer ya pasó.' using errcode = '22023';
  end if;
  if not public.are_friends(auth.uid(), restore_friend.other) then
    insert into public.friendships (requester, addressee, status)
    values (auth.uid(), restore_friend.other, 'accepted')
    on conflict (requester, addressee) do nothing;
  end if;
  delete from public.friendship_tombstones where actor = auth.uid() and other = restore_friend.other;
end $$;
revoke all on function public.restore_friend(uuid) from public;
grant execute on function public.restore_friend(uuid) to authenticated;

-- Solo el invitado puede responder su propia invitación; no hay UPDATE directo.
create or replace function public.respond_session(sid uuid, status text)
returns void language plpgsql security definer set search_path = public as $$
begin
  if status not in ('accepted', 'declined') then
    raise exception 'Estado de invitación no válido.' using errcode = '22023';
  end if;
  update public.session_invites i
     set status = respond_session.status
   where i.session_id = respond_session.sid and i.user_id = auth.uid();
  if not found then raise exception 'No tienes una invitación para esa sesión.' using errcode = '22023'; end if;
end $$;
revoke all on function public.respond_session(uuid, text) from public;
grant execute on function public.respond_session(uuid, text) to authenticated;

-- Borra el usuario y, por cascada, perfil, amistades, fechas, sesiones e invitaciones.
create or replace function public.delete_my_account()
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.delete_my_account() from public;
grant execute on function public.delete_my_account() to authenticated;
