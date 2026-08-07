create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  correo text not null,
  nombre text not null default 'Estudiante',
  carrera text not null default 'Sin especificar',
  rol text not null default 'estudiante' check (rol in ('admin', 'rector', 'docente', 'estudiante')),
  activo boolean not null default true,
  creado_en timestamptz not null default now()
);

alter table public.perfiles add column if not exists usuario text;
alter table public.perfiles add column if not exists ultimo_acceso timestamptz;
alter table public.perfiles drop constraint if exists perfiles_rol_check;
alter table public.perfiles add constraint perfiles_rol_check check (rol in ('admin', 'rector', 'docente', 'estudiante'));
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

-- ================================================================
-- ETAPA 2: EVALUACIONES, TAREAS, ASISTENCIA POR MATERIA Y LOGROS.
-- Ejecuta este bloque completo en Supabase > SQL Editor.
-- ================================================================

create or replace function public.docente_de_materia(p_ciclo text, p_materia text)
returns boolean language sql stable security definer set search_path = public as $$
  select public.es_administrador() or exists (
    select 1 from public.materias_docentes
    where docente_id = auth.uid() and ciclo = p_ciclo and materia = p_materia
  );
$$;
grant execute on function public.docente_de_materia(text, text) to authenticated;

drop policy if exists "Docente publica recursos asignados" on public.recursos_personalizados;
create policy "Docente publica recursos asignados" on public.recursos_personalizados for insert to authenticated with check (
  creado_por=auth.uid() and public.docente_de_materia(ciclo,materia)
);

-- Asistencia: ahora una persona puede tener asistencia en varias materias el mismo día.
alter table public.asistencia add column if not exists ciclo text;
alter table public.asistencia add column if not exists materia text;
alter table public.asistencia add column if not exists docente_id uuid references auth.users(id) on delete set null;
alter table public.asistencia drop constraint if exists asistencia_estudiante_id_fecha_key;
update public.asistencia set materia='General' where materia is null;
alter table public.asistencia alter column materia set default 'General';
alter table public.asistencia alter column materia set not null;
create unique index if not exists asistencia_estudiante_fecha_materia_unica on public.asistencia(estudiante_id, fecha, materia);
drop policy if exists "Docentes gestionan asistencia" on public.asistencia;
drop policy if exists "Estudiante ve su asistencia" on public.asistencia;
drop policy if exists "Equipo gestiona asistencia asignada" on public.asistencia;
create policy "Estudiante ve su asistencia" on public.asistencia for select to authenticated using (estudiante_id = auth.uid());
create policy "Equipo gestiona asistencia asignada" on public.asistencia for all to authenticated
using (public.docente_de_materia(ciclo, materia))
with check (public.docente_de_materia(ciclo, materia));

create table if not exists public.tareas_academicas (
  id bigint generated always as identity primary key,
  ciclo text not null,
  materia text not null,
  titulo text not null check (char_length(trim(titulo)) >= 3),
  instrucciones text not null,
  fecha_limite timestamptz,
  enlace_referencia text,
  activo boolean not null default true,
  creado_por uuid references auth.users(id) on delete set null,
  creado_en timestamptz not null default now()
);
alter table public.tareas_academicas enable row level security;
drop policy if exists "Usuarios ven tareas activas" on public.tareas_academicas;
drop policy if exists "Equipo crea tareas asignadas" on public.tareas_academicas;
drop policy if exists "Equipo actualiza tareas asignadas" on public.tareas_academicas;
create policy "Usuarios ven tareas activas" on public.tareas_academicas for select to authenticated using (activo or public.es_administrador() or public.docente_de_materia(ciclo,materia));
create policy "Equipo crea tareas asignadas" on public.tareas_academicas for insert to authenticated with check (public.docente_de_materia(ciclo,materia));
create policy "Equipo actualiza tareas asignadas" on public.tareas_academicas for update to authenticated using (public.docente_de_materia(ciclo,materia)) with check (public.docente_de_materia(ciclo,materia));

create table if not exists public.entregas_tareas (
  id bigint generated always as identity primary key,
  tarea_id bigint not null references public.tareas_academicas(id) on delete cascade,
  estudiante_id uuid not null references auth.users(id) on delete cascade,
  enlace_archivo text,
  comentario_estudiante text,
  comentario_docente text,
  estado text not null default 'entregado' check (estado in ('entregado','revisado','requiere_correccion')),
  calificacion numeric(5,2) check (calificacion between 0 and 20),
  entregado_en timestamptz not null default now(),
  revisado_en timestamptz,
  unique(tarea_id, estudiante_id)
);
alter table public.entregas_tareas enable row level security;
drop policy if exists "Estudiante ve sus entregas" on public.entregas_tareas;
drop policy if exists "Estudiante crea su entrega" on public.entregas_tareas;
drop policy if exists "Estudiante edita entrega pendiente" on public.entregas_tareas;
drop policy if exists "Docente revisa entregas asignadas" on public.entregas_tareas;
create policy "Estudiante ve sus entregas" on public.entregas_tareas for select to authenticated using (estudiante_id = auth.uid());
create policy "Estudiante crea su entrega" on public.entregas_tareas for insert to authenticated with check (estudiante_id = auth.uid());
create policy "Estudiante edita entrega pendiente" on public.entregas_tareas for update to authenticated using (estudiante_id = auth.uid() and estado = 'entregado') with check (estudiante_id = auth.uid());
create policy "Docente revisa entregas asignadas" on public.entregas_tareas for all to authenticated using (exists (select 1 from public.tareas_academicas t where t.id=tarea_id and public.docente_de_materia(t.ciclo,t.materia))) with check (exists (select 1 from public.tareas_academicas t where t.id=tarea_id and public.docente_de_materia(t.ciclo,t.materia)));

-- Crea este bucket para que los estudiantes puedan adjuntar sus tareas.
insert into storage.buckets(id,name,public) values ('entregas-tareas','entregas-tareas',false) on conflict (id) do nothing;
drop policy if exists "Estudiantes suben tareas" on storage.objects;
create policy "Estudiantes suben tareas" on storage.objects for insert to authenticated with check (bucket_id='entregas-tareas' and (storage.foldername(name))[1]=auth.uid()::text);
drop policy if exists "Estudiantes leen tareas propias" on storage.objects;
create policy "Estudiantes leen tareas propias" on storage.objects for select to authenticated using (bucket_id='entregas-tareas' and ((storage.foldername(name))[1]=auth.uid()::text or public.puede_gestionar_asistencia()));

create table if not exists public.evaluaciones (
  id bigint generated always as identity primary key,
  ciclo text not null,
  materia text not null,
  titulo text not null,
  instrucciones text,
  activo boolean not null default true,
  creado_por uuid references auth.users(id) on delete set null,
  creado_en timestamptz not null default now()
);
create table if not exists public.preguntas_evaluacion (
  id bigint generated always as identity primary key,
  evaluacion_id bigint not null references public.evaluaciones(id) on delete cascade,
  enunciado text not null,
  opciones jsonb not null default '[]'::jsonb,
  respuesta_correcta integer not null default 0,
  puntos numeric(5,2) not null default 1 check (puntos > 0),
  orden integer not null default 1
);
create table if not exists public.intentos_evaluacion (
  id bigint generated always as identity primary key,
  evaluacion_id bigint not null references public.evaluaciones(id) on delete cascade,
  estudiante_id uuid not null references auth.users(id) on delete cascade,
  respuestas jsonb not null default '{}'::jsonb,
  puntaje numeric(6,2) not null default 0,
  puntaje_maximo numeric(6,2) not null default 0,
  enviado_en timestamptz not null default now(),
  unique(evaluacion_id, estudiante_id)
);
alter table public.evaluaciones enable row level security;
alter table public.preguntas_evaluacion enable row level security;
alter table public.intentos_evaluacion enable row level security;
drop policy if exists "Usuarios ven evaluaciones activas" on public.evaluaciones;
drop policy if exists "Equipo gestiona evaluaciones" on public.evaluaciones;
drop policy if exists "Equipo ve preguntas" on public.preguntas_evaluacion;
drop policy if exists "Equipo gestiona preguntas" on public.preguntas_evaluacion;
drop policy if exists "Estudiante ve sus intentos" on public.intentos_evaluacion;
drop policy if exists "Estudiante registra intento" on public.intentos_evaluacion;
drop policy if exists "Equipo ve intentos asignados" on public.intentos_evaluacion;
create policy "Usuarios ven evaluaciones activas" on public.evaluaciones for select to authenticated using (activo or public.docente_de_materia(ciclo,materia));
create policy "Equipo gestiona evaluaciones" on public.evaluaciones for all to authenticated using (public.docente_de_materia(ciclo,materia)) with check (public.docente_de_materia(ciclo,materia));
create policy "Equipo ve preguntas" on public.preguntas_evaluacion for select to authenticated using (exists(select 1 from public.evaluaciones e where e.id=evaluacion_id and public.docente_de_materia(e.ciclo,e.materia)));
create policy "Equipo gestiona preguntas" on public.preguntas_evaluacion for all to authenticated using (exists(select 1 from public.evaluaciones e where e.id=evaluacion_id and public.docente_de_materia(e.ciclo,e.materia))) with check (exists(select 1 from public.evaluaciones e where e.id=evaluacion_id and public.docente_de_materia(e.ciclo,e.materia)));
create policy "Estudiante ve sus intentos" on public.intentos_evaluacion for select to authenticated using (estudiante_id=auth.uid());
create policy "Estudiante registra intento" on public.intentos_evaluacion for insert to authenticated with check (estudiante_id=auth.uid());
create policy "Equipo ve intentos asignados" on public.intentos_evaluacion for select to authenticated using (exists(select 1 from public.evaluaciones e where e.id=evaluacion_id and public.docente_de_materia(e.ciclo,e.materia)));
create or replace function public.preguntas_para_evaluacion(evaluacion_busqueda bigint)
returns table(id bigint, enunciado text, opciones jsonb, puntos numeric, orden integer)
language sql security definer set search_path=public as $$
  select p.id,p.enunciado,p.opciones,p.puntos,p.orden
  from public.preguntas_evaluacion p join public.evaluaciones e on e.id=p.evaluacion_id
  where p.evaluacion_id=evaluacion_busqueda and e.activo
  order by p.orden,p.id;
$$;
grant execute on function public.preguntas_para_evaluacion(bigint) to authenticated;
create or replace function public.enviar_evaluacion(evaluacion_busqueda bigint, respuestas_enviadas jsonb)
returns table(puntaje numeric, puntaje_maximo numeric)
language plpgsql security definer set search_path=public as $$
declare total numeric := 0; maximo numeric := 0; pregunta record;
begin
  if not exists(select 1 from public.evaluaciones where id=evaluacion_busqueda and activo) then raise exception 'Evaluación no disponible'; end if;
  for pregunta in select * from public.preguntas_evaluacion where evaluacion_id=evaluacion_busqueda loop
    maximo := maximo + pregunta.puntos;
    if coalesce((respuestas_enviadas ->> pregunta.id::text)::integer,-1) = pregunta.respuesta_correcta then total := total + pregunta.puntos; end if;
  end loop;
  insert into public.intentos_evaluacion(evaluacion_id,estudiante_id,respuestas,puntaje,puntaje_maximo)
  values(evaluacion_busqueda,auth.uid(),respuestas_enviadas,total,maximo);
  return query select total,maximo;
end;
$$;
grant execute on function public.enviar_evaluacion(bigint,jsonb) to authenticated;

-- Avisos para todos, por rol o por ciclo.
alter table public.avisos add column if not exists audiencia text not null default 'todos' check (audiencia in ('todos','estudiantes','docentes','administradores'));
alter table public.avisos add column if not exists ciclo text;
alter table public.avisos add column if not exists publicar_desde timestamptz not null default now();
alter table public.avisos add column if not exists publicar_hasta timestamptz;
drop policy if exists "Usuarios autenticados ven avisos activos" on public.avisos;
drop policy if exists "Usuarios ven avisos dirigidos" on public.avisos;
create policy "Usuarios ven avisos dirigidos" on public.avisos for select to authenticated using (activo and (audiencia='todos' or audiencia=(select case rol when 'admin' then 'administradores' when 'docente' then 'docentes' else 'estudiantes' end from public.perfiles where id=auth.uid())));

-- ================================================================
-- ETAPA 3: CICLOS PERSONALES, RÚBRICAS E HISTORIAL.
-- Solo el administrador asigna el ciclo y puede desactivar cuentas.
-- ================================================================
alter table public.perfiles add column if not exists ciclo_actual text not null default 'Ciclo V';
update public.perfiles set ciclo_actual='Ciclo V' where ciclo_actual is null;

create or replace function public.usuario_pertenece_a_ciclo(p_ciclo text)
returns boolean language sql stable security definer set search_path=public as $$
  select public.es_administrador() or public.docente_de_materia(p_ciclo, '') or exists (
    select 1 from public.perfiles where id=auth.uid() and rol='estudiante' and ciclo_actual=p_ciclo
  );
$$;
grant execute on function public.usuario_pertenece_a_ciclo(text) to authenticated;

-- Las actividades ya no se muestran a estudiantes de otros ciclos.
drop policy if exists "Usuarios ven tareas activas" on public.tareas_academicas;
drop policy if exists "Usuarios ven tareas de su ciclo" on public.tareas_academicas;
create policy "Usuarios ven tareas de su ciclo" on public.tareas_academicas for select to authenticated using (
  (activo and public.usuario_pertenece_a_ciclo(ciclo)) or public.docente_de_materia(ciclo,materia)
);
drop policy if exists "Usuarios ven evaluaciones activas" on public.evaluaciones;
drop policy if exists "Usuarios ven evaluaciones de su ciclo" on public.evaluaciones;
create policy "Usuarios ven evaluaciones de su ciclo" on public.evaluaciones for select to authenticated using (
  (activo and public.usuario_pertenece_a_ciclo(ciclo)) or public.docente_de_materia(ciclo,materia)
);

-- Rúbricas publicadas junto a cada tarea.
create table if not exists public.rubricas_tarea (
  id bigint generated always as identity primary key,
  tarea_id bigint not null references public.tareas_academicas(id) on delete cascade,
  criterio text not null check (char_length(trim(criterio)) >= 2),
  puntaje_maximo numeric(5,2) not null default 20 check (puntaje_maximo > 0),
  orden integer not null default 1
);
alter table public.rubricas_tarea enable row level security;
drop policy if exists "Usuarios ven rubricas de tareas visibles" on public.rubricas_tarea;
create policy "Usuarios ven rubricas de tareas visibles" on public.rubricas_tarea for select to authenticated using (
  exists(select 1 from public.tareas_academicas t where t.id=tarea_id and ((t.activo and public.usuario_pertenece_a_ciclo(t.ciclo)) or public.docente_de_materia(t.ciclo,t.materia)))
);
drop policy if exists "Equipo gestiona rubricas asignadas" on public.rubricas_tarea;
create policy "Equipo gestiona rubricas asignadas" on public.rubricas_tarea for all to authenticated using (
  exists(select 1 from public.tareas_academicas t where t.id=tarea_id and public.docente_de_materia(t.ciclo,t.materia))
) with check (
  exists(select 1 from public.tareas_academicas t where t.id=tarea_id and public.docente_de_materia(t.ciclo,t.materia))
);

-- Avisos dirigidos también pueden limitarse a un ciclo concreto.
drop policy if exists "Usuarios ven avisos dirigidos" on public.avisos;
create policy "Usuarios ven avisos dirigidos" on public.avisos for select to authenticated using (
  activo and publicar_desde <= now() and (publicar_hasta is null or publicar_hasta > now()) and (ciclo is null or public.usuario_pertenece_a_ciclo(ciclo)) and
  (audiencia='todos' or audiencia=(select case rol when 'admin' then 'administradores' when 'docente' then 'docentes' else 'estudiantes' end from public.perfiles where id=auth.uid()))
);

-- Actualización segura del perfil propio: no permite cambiar rol, ciclo ni estado de cuenta.
create or replace function public.actualizar_mi_perfil(nuevo_nombre text, nueva_carrera text)
returns void language plpgsql security definer set search_path=public as $$
begin
  if auth.uid() is null then raise exception 'Debes iniciar sesión'; end if;
  if char_length(trim(coalesce(nuevo_nombre,''))) < 3 then raise exception 'Ingresa un nombre válido'; end if;
  if char_length(trim(coalesce(nueva_carrera,''))) < 2 then raise exception 'Ingresa una carrera válida'; end if;
  update public.perfiles set nombre=trim(nuevo_nombre), carrera=trim(nueva_carrera) where id=auth.uid() and activo=true;
end;
$$;
grant execute on function public.actualizar_mi_perfil(text,text) to authenticated;



-- Las funciones no permiten abrir ni enviar evaluaciones de otro ciclo.
create or replace function public.preguntas_para_evaluacion(evaluacion_busqueda bigint)
returns table(id bigint, enunciado text, opciones jsonb, puntos numeric, orden integer)
language sql security definer set search_path=public as $$
  select p.id,p.enunciado,p.opciones,p.puntos,p.orden
  from public.preguntas_evaluacion p join public.evaluaciones e on e.id=p.evaluacion_id
  where p.evaluacion_id=evaluacion_busqueda and e.activo and public.usuario_pertenece_a_ciclo(e.ciclo)
  order by p.orden,p.id;
$$;

-- Una entrega solo puede corresponder a una tarea disponible en el ciclo del estudiante.
drop policy if exists "Estudiante crea su entrega" on public.entregas_tareas;
create policy "Estudiante crea su entrega" on public.entregas_tareas for insert to authenticated with check (
  estudiante_id=auth.uid() and exists(
    select 1 from public.tareas_academicas t where t.id=tarea_id and t.activo and public.usuario_pertenece_a_ciclo(t.ciclo)
  )
);
create or replace function public.enviar_evaluacion(evaluacion_busqueda bigint, respuestas_enviadas jsonb)
returns table(puntaje numeric, puntaje_maximo numeric)
language plpgsql security definer set search_path=public as $$
declare total numeric := 0; maximo numeric := 0; pregunta record;
begin
  if not exists(select 1 from public.evaluaciones where id=evaluacion_busqueda and activo and public.usuario_pertenece_a_ciclo(ciclo)) then raise exception 'Evaluación no disponible para tu ciclo'; end if;
  for pregunta in select * from public.preguntas_evaluacion where evaluacion_id=evaluacion_busqueda loop
    maximo := maximo + pregunta.puntos;
    if coalesce((respuestas_enviadas ->> pregunta.id::text)::integer,-1) = pregunta.respuesta_correcta then total := total + pregunta.puntos; end if;
  end loop;
  insert into public.intentos_evaluacion(evaluacion_id,estudiante_id,respuestas,puntaje,puntaje_maximo)
  values(evaluacion_busqueda,auth.uid(),respuestas_enviadas,total,maximo);
  return query select total,maximo;
end;
$$;

-- La desactivación solo está permitida por la política de administrador existente.
-- No concedas acceso a administracion.html ni cambies roles a cuentas docentes.

-- ETAPA 4: comunicación interna y solicitudes institucionales.
create table if not exists public.mensajes_internos (
 id bigint generated always as identity primary key, titulo text not null, mensaje text not null,
 audiencia text not null default 'estudiantes' check(audiencia in ('todos','estudiantes')),
 ciclo text, activo boolean not null default true, creado_por uuid references auth.users(id), creado_en timestamptz not null default now()
);
alter table public.mensajes_internos enable row level security;
drop policy if exists "Usuarios ven mensajes dirigidos" on public.mensajes_internos;
drop policy if exists "Equipo publica mensajes" on public.mensajes_internos;
drop policy if exists "Administrador gestiona mensajes" on public.mensajes_internos;
create policy "Usuarios ven mensajes dirigidos" on public.mensajes_internos for select to authenticated using (activo and (audiencia='todos' or (select rol from public.perfiles where id=auth.uid())='estudiante') and (ciclo is null or public.usuario_pertenece_a_ciclo(ciclo)));
create policy "Equipo publica mensajes" on public.mensajes_internos for insert to authenticated with check (public.puede_gestionar_asistencia() and creado_por=auth.uid());
create policy "Administrador gestiona mensajes" on public.mensajes_internos for all to authenticated using(public.es_administrador()) with check(public.es_administrador());

create table if not exists public.solicitudes_institucionales (
 id bigint generated always as identity primary key, usuario_id uuid not null references auth.users(id) on delete cascade,
 tipo text not null, detalle text not null, estado text not null default 'Pendiente' check(estado in ('Pendiente','En proceso','Atendida')),
 respuesta text, creado_en timestamptz not null default now(), atendido_en timestamptz
);
alter table public.solicitudes_institucionales enable row level security;
drop policy if exists "Usuario gestiona sus solicitudes" on public.solicitudes_institucionales;
drop policy if exists "Administrador atiende solicitudes" on public.solicitudes_institucionales;
create policy "Usuario gestiona sus solicitudes" on public.solicitudes_institucionales for all to authenticated using(usuario_id=auth.uid()) with check(usuario_id=auth.uid());
create policy "Administrador atiende solicitudes" on public.solicitudes_institucionales for all to authenticated using(public.es_administrador()) with check(public.es_administrador());

-- Etapa 6: rectorado, observaciones privadas y auditoría.
create or replace function public.puede_ver_rectorado()
returns boolean language sql stable security definer set search_path = public
as $$ select exists (select 1 from public.perfiles where id = auth.uid() and rol in ('admin','rector') and activo = true); $$;
grant execute on function public.puede_ver_rectorado() to authenticated;

create table if not exists public.observaciones_estudiantes (
  id bigint generated always as identity primary key,
  estudiante_id uuid not null references auth.users(id) on delete cascade,
  materia text,
  contenido text not null check (char_length(trim(contenido)) >= 5),
  creado_por uuid not null references auth.users(id) on delete cascade,
  creado_en timestamptz not null default now()
);
alter table public.observaciones_estudiantes enable row level security;
drop policy if exists "Equipo ve observaciones privadas" on public.observaciones_estudiantes;
create policy "Equipo ve observaciones privadas" on public.observaciones_estudiantes for select to authenticated using (creado_por = auth.uid() or public.es_administrador());
drop policy if exists "Equipo crea observaciones privadas" on public.observaciones_estudiantes;
create policy "Equipo crea observaciones privadas" on public.observaciones_estudiantes for insert to authenticated with check (creado_por = auth.uid() and public.puede_gestionar_asistencia());
drop policy if exists "Administrador gestiona observaciones" on public.observaciones_estudiantes;
create policy "Administrador gestiona observaciones" on public.observaciones_estudiantes for all to authenticated using (public.es_administrador()) with check (public.es_administrador());

create table if not exists public.auditoria_acciones (
  id bigint generated always as identity primary key,
  actor_id uuid references auth.users(id) on delete set null,
  tabla text not null,
  accion text not null,
  creado_en timestamptz not null default now()
);
alter table public.auditoria_acciones enable row level security;
drop policy if exists "Administrador ve auditoria" on public.auditoria_acciones;
create policy "Administrador ve auditoria" on public.auditoria_acciones for select to authenticated using (public.es_administrador());

create or replace function public.registrar_auditoria()
returns trigger language plpgsql security definer set search_path = public
as $$ begin
  if auth.uid() is not null then insert into public.auditoria_acciones(actor_id,tabla,accion) values(auth.uid(),TG_TABLE_NAME,TG_OP); end if;
  if TG_OP = 'DELETE' then return OLD; end if;
  return NEW;
end; $$;
drop trigger if exists auditar_asistencia on public.asistencia;
create trigger auditar_asistencia after insert or update or delete on public.asistencia for each row execute procedure public.registrar_auditoria();
drop trigger if exists auditar_avisos on public.avisos;
create trigger auditar_avisos after insert or update or delete on public.avisos for each row execute procedure public.registrar_auditoria();
drop trigger if exists auditar_recursos on public.recursos_personalizados;
create trigger auditar_recursos after insert or update or delete on public.recursos_personalizados for each row execute procedure public.registrar_auditoria();
drop trigger if exists auditar_tareas on public.tareas_academicas;
create trigger auditar_tareas after insert or update or delete on public.tareas_academicas for each row execute procedure public.registrar_auditoria();
drop trigger if exists auditar_perfiles on public.perfiles;
create trigger auditar_perfiles after update on public.perfiles for each row execute procedure public.registrar_auditoria();

create or replace function public.resumen_rectorado()
returns jsonb language plpgsql security definer set search_path = public
as $$ begin
  if not public.puede_ver_rectorado() then raise exception 'Sin permiso para consultar rectorado'; end if;
  return jsonb_build_object(
    'estudiantes_activos',(select count(*) from public.perfiles where rol='estudiante' and activo),
    'docentes_activos',(select count(*) from public.perfiles where rol='docente' and activo),
    'asistencia_mensual',coalesce((select round(100.0 * count(*) filter(where presente) / nullif(count(*),0)) from public.asistencia where fecha >= date_trunc('month',current_date)::date),0),
    'actividades_pendientes',(select count(*) from public.tareas_academicas where activo and fecha_limite >= current_date),
    'comunicados_activos',(select count(*) from public.avisos where activo)
  );
end; $$;
grant execute on function public.resumen_rectorado() to authenticated;

-- El administrador debe poder consultar todos los avisos, incluso los ocultos o dirigidos a otro grupo.
drop policy if exists "Usuarios ven avisos dirigidos" on public.avisos;
create policy "Usuarios ven avisos dirigidos" on public.avisos for select to authenticated using (
  public.es_administrador() or (
    activo and (ciclo is null or public.usuario_pertenece_a_ciclo(ciclo)) and
    (audiencia='todos' or audiencia=(select case rol when 'docente' then 'docentes' else 'estudiantes' end from public.perfiles where id=auth.uid()))
  )
);

-- Administración y el autor deben poder revisar y retirar comunicados publicados.
drop policy if exists "Usuarios ven mensajes dirigidos" on public.mensajes_internos;
create policy "Usuarios ven mensajes dirigidos" on public.mensajes_internos for select to authenticated using (
  public.es_administrador() or creado_por = auth.uid() or (
    activo and (ciclo is null or public.usuario_pertenece_a_ciclo(ciclo)) and
    (audiencia = 'todos' or (audiencia = 'estudiantes' and (select rol from public.perfiles where id=auth.uid()) = 'estudiante'))
  )
);
drop policy if exists "Autor gestiona sus mensajes" on public.mensajes_internos;
create policy "Autor gestiona sus mensajes" on public.mensajes_internos for update to authenticated using (creado_por = auth.uid()) with check (creado_por = auth.uid());
