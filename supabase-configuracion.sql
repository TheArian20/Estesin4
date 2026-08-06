create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  correo text not null,
  nombre text not null default 'Estudiante',
  carrera text not null default 'Sin especificar',
  rol text not null default 'estudiante' check (rol in ('admin', 'docente', 'estudiante')),
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

alter table public.perfiles add column if not exists usuario text;
alter table public.perfiles add column if not exists ultimo_acceso timestamptz;
alter table public.perfiles drop constraint if exists perfiles_rol_check;
alter table public.perfiles add constraint perfiles_rol_check check (rol in ('admin', 'docente', 'estudiante'));
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

create or replace function public.puede_gestionar_asistencia()
returns boolean
language sql
stable
security definer set search_path = public
as $$ select exists (select 1 from public.perfiles where id = auth.uid() and rol in ('admin', 'docente') and activo = true); $$;

grant execute on function public.puede_gestionar_asistencia() to authenticated;

drop policy if exists "El usuario ve su perfil" on public.perfiles;
create policy "El usuario ve su perfil" on public.perfiles for select to authenticated using (id = auth.uid());
drop policy if exists "El usuario actualiza su perfil" on public.perfiles;
create policy "El usuario actualiza su perfil" on public.perfiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid() and rol in ('estudiante', 'docente') and activo = true);
drop policy if exists "Administrador gestiona perfiles" on public.perfiles;
create policy "Administrador gestiona perfiles" on public.perfiles for all to authenticated using (public.es_administrador()) with check (public.es_administrador());
drop policy if exists "Docente consulta estudiantes" on public.perfiles;
create policy "Docente consulta estudiantes" on public.perfiles for select to authenticated using (public.puede_gestionar_asistencia());

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

alter table public.recursos_personalizados add column if not exists materia text;

-- Eventos del calendario publicados por Administración.
create table if not exists public.eventos_calendario (
  id bigint generated always as identity primary key,
  fecha date not null,
  hora text not null,
  materia text not null check (char_length(trim(materia)) >= 3),
  detalle text,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id) on delete set null
);

alter table public.eventos_calendario enable row level security;
drop policy if exists "Usuarios ven eventos activos" on public.eventos_calendario;
create policy "Usuarios ven eventos activos" on public.eventos_calendario
for select to authenticated using (activo = true or public.es_administrador());
drop policy if exists "Administrador gestiona eventos" on public.eventos_calendario;
create policy "Administrador gestiona eventos" on public.eventos_calendario
for all to authenticated using (public.es_administrador()) with check (public.es_administrador());

-- Avisos visibles para todos los estudiantes desde el inicio.
create table if not exists public.avisos (
  id bigint generated always as identity primary key,
  titulo text not null check (char_length(trim(titulo)) >= 3),
  mensaje text not null check (char_length(trim(mensaje)) >= 3),
  destacado boolean not null default false,
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  creado_por uuid references auth.users(id) on delete set null
);

alter table public.avisos enable row level security;
drop policy if exists "Usuarios autenticados ven avisos activos" on public.avisos;
create policy "Usuarios autenticados ven avisos activos" on public.avisos
for select to authenticated using (activo = true or public.es_administrador());
drop policy if exists "Administrador gestiona avisos" on public.avisos;
create policy "Administrador gestiona avisos" on public.avisos
for all to authenticated using (public.es_administrador()) with check (public.es_administrador());

-- Registro automático de recursos abiertos por cada estudiante.
create table if not exists public.progreso_lectura (
  usuario_id uuid not null references auth.users(id) on delete cascade,
  recurso_id text not null,
  recurso_nombre text not null,
  ciclo text,
  leido_en timestamptz not null default now(),
  primary key (usuario_id, recurso_id)
);
alter table public.progreso_lectura enable row level security;
drop policy if exists "Usuario gestiona su progreso" on public.progreso_lectura;
create policy "Usuario gestiona su progreso" on public.progreso_lectura
for all to authenticated using (usuario_id = auth.uid()) with check (usuario_id = auth.uid());
drop policy if exists "Equipo académico consulta actividad" on public.progreso_lectura;
create policy "Equipo académico consulta actividad" on public.progreso_lectura
for select to authenticated using (public.puede_gestionar_asistencia());

create table if not exists public.asistencia (
  id bigint generated always as identity primary key,
  estudiante_id uuid not null references auth.users(id) on delete cascade,
  fecha date not null,
  presente boolean not null default true,
  nota text,
  registrado_en timestamptz not null default now(),
  unique (estudiante_id, fecha)
);
alter table public.asistencia enable row level security;
drop policy if exists "Estudiante ve su asistencia" on public.asistencia;
drop policy if exists "Administrador gestiona asistencia" on public.asistencia;
drop policy if exists "Docentes gestionan asistencia" on public.asistencia;
create policy "Docentes gestionan asistencia" on public.asistencia
for all to authenticated using (public.puede_gestionar_asistencia()) with check (public.puede_gestionar_asistencia());

-- Progreso por materia: solo el administrador puede validar una materia como completada.
create table if not exists public.progreso_materias (
  usuario_id uuid not null references auth.users(id) on delete cascade,
  ciclo text not null,
  materia text not null,
  completado boolean not null default false,
  actualizado_en timestamptz not null default now(),
  primary key (usuario_id, ciclo, materia)
);
alter table public.progreso_materias enable row level security;
drop policy if exists "Estudiante gestiona su progreso por materia" on public.progreso_materias;
drop policy if exists "Administrador gestiona progreso por materia" on public.progreso_materias;
create policy "Administrador gestiona progreso por materia" on public.progreso_materias
for all to authenticated using (public.es_administrador()) with check (public.es_administrador());

-- Asignación de materias a docentes. Se completa desde Administración cuando se creen sus cuentas.
create table if not exists public.materias_docentes (
  id bigint generated always as identity primary key,
  docente_id uuid not null references auth.users(id) on delete cascade,
  ciclo text not null,
  materia text not null,
  creado_en timestamptz not null default now(),
  unique(docente_id, ciclo, materia)
);
alter table public.materias_docentes enable row level security;
drop policy if exists "Docente ve sus materias" on public.materias_docentes;
create policy "Docente ve sus materias" on public.materias_docentes
for select to authenticated using (docente_id = auth.uid() or public.es_administrador());
drop policy if exists "Administrador gestiona materias docentes" on public.materias_docentes;
create policy "Administrador gestiona materias docentes" on public.materias_docentes
for all to authenticated using (public.es_administrador()) with check (public.es_administrador());
