create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  correo text not null,
  nombre text not null default 'Estudiante',
  carrera text not null default 'Sin especificar',
  rol text not null default 'estudiante' check (rol in ('admin', 'estudiante')),
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

alter table public.perfiles add column if not exists usuario text;
update public.perfiles set usuario = lower(split_part(correo, '@', 1)) where usuario is null;
alter table public.perfiles alter column usuario set not null;
create unique index if not exists perfiles_usuario_unico on public.perfiles (lower(usuario));

alter table public.perfiles enable row level security;

create or replace function public.crear_perfil_usuario()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.perfiles (id, correo, usuario, nombre, carrera)
  values (new.id, new.email, lower(coalesce(new.raw_user_meta_data->>'usuario', split_part(new.email, '@', 1))), coalesce(new.raw_user_meta_data->>'nombre', 'Estudiante'), coalesce(new.raw_user_meta_data->>'carrera', 'Sin especificar'));
  return new;
end;
$$;

drop trigger if exists al_crear_usuario on auth.users;
create trigger al_crear_usuario after insert on auth.users for each row execute procedure public.crear_perfil_usuario();

create or replace function public.es_administrador()
returns boolean
language sql
stable
security definer set search_path = public
as $$ select exists (select 1 from public.perfiles where id = auth.uid() and rol = 'admin'); $$;

grant execute on function public.es_administrador() to authenticated;

drop policy if exists "El usuario ve su perfil" on public.perfiles;
create policy "El usuario ve su perfil" on public.perfiles for select to authenticated using (id = auth.uid());
drop policy if exists "El usuario actualiza su perfil" on public.perfiles;
create policy "El usuario actualiza su perfil" on public.perfiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and rol = 'estudiante' and activo = true);
drop policy if exists "Administrador gestiona perfiles" on public.perfiles;
create policy "Administrador gestiona perfiles" on public.perfiles for all to authenticated using (public.es_administrador()) with check (public.es_administrador());

-- Después de crear tu primera cuenta, reemplaza tu-correo@ejemplo.com por tu correo y ejecuta esta línea:
-- update public.perfiles set rol = 'admin' where correo = 'tu-correo@ejemplo.com';

-- Recursos publicados desde el panel Administración.
create table if not exists public.recursos_personalizados (
  id bigint generated always as identity primary key,
  titulo text not null check (char_length(trim(titulo)) >= 3),
  enlace text not null check (enlace ~ '^https://drive\.google\.com/'),
  categoria text not null default 'General',
  ciclo text,
  tipo text not null default 'documento',
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id) on delete set null
);

alter table public.recursos_personalizados enable row level security;
drop policy if exists "Usuarios autenticados ven recursos" on public.recursos_personalizados;
create policy "Usuarios autenticados ven recursos" on public.recursos_personalizados
for select to authenticated using (true);
drop policy if exists "Administrador gestiona recursos" on public.recursos_personalizados;
create policy "Administrador gestiona recursos" on public.recursos_personalizados
for all to authenticated using (public.es_administrador()) with check (public.es_administrador());
