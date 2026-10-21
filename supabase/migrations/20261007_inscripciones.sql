-- =====================================================================
-- NovaCore Credit · Inscripciones (intake)
-- Pegar completo en Supabase > SQL Editor y tocar "Run".
-- Se puede ejecutar más de una vez sin duplicar nada.
--
-- Qué crea:
--   1. Tabla "intakes": una fila por cada cliente que se inscribe.
--   2. Clave de cifrado en Vault para el número de Seguro Social.
--   3. Almacenamiento privado "intake-documents" para los documentos.
--   4. Funciones que el formulario puede llamar (y nada más):
--        submit_intake            -> guarda la inscripción, cifra el SSN
--        complete_intake_documents -> confirma que subieron los 3 documentos
--   5. Reglas de seguridad: el formulario puede ENVIAR, pero nadie puede
--      LEER datos desde la página. Solo NovaCore, desde el panel.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- 1. Tabla de inscripciones
-- ---------------------------------------------------------------------
create table if not exists public.intakes (
  id               uuid primary key default gen_random_uuid(),
  created_at       timestamptz not null default now(),
  status           text not null default 'pendiente_documentos'
                   check (status in ('pendiente_documentos', 'pendiente_pago', 'pagado',
                                     'credit_hero_enviado', 'cancelado')),
  first_name       text not null,
  middle_name      text,
  last_name        text not null,
  date_of_birth    date not null,
  phone            text not null,
  email            text not null,
  street           text not null,
  unit             text,
  city             text not null,
  state            text not null,
  zip              text not null,
  ssn_encrypted    bytea not null,
  ssn_last4        text not null,
  goals            text[] not null default '{}',
  rights_read      boolean not null,
  terms_accepted   boolean not null,
  signature        text not null,
  signed_at        timestamptz not null default now(),
  terms_version    text not null default 'pendiente',
  documents        jsonb not null default '{}'::jsonb,
  payment_status   text not null default 'pendiente'
                   check (payment_status in ('pendiente', 'aprobado', 'rechazado')),
  payment_reference text,
  notes            text,
  user_agent       text
);

comment on table public.intakes is 'Inscripciones de clientes de NovaCore Credit (formulario de 3 pasos).';
comment on column public.intakes.ssn_encrypted is 'SSN cifrado con pgcrypto. Para verlo: select public.ver_ssn(''<id>'');';
comment on column public.intakes.documents is 'Rutas en el almacenamiento intake-documents: license, ssnCard, proofAddress.';

create index if not exists intakes_created_at_idx on public.intakes (created_at desc);
create index if not exists intakes_status_idx on public.intakes (status);

alter table public.intakes enable row level security;
-- Sin políticas a propósito: nadie lee ni escribe la tabla desde la página.
revoke all on table public.intakes from anon, authenticated;

-- ---------------------------------------------------------------------
-- 2. Clave de cifrado del SSN (se genera una sola vez, guardada en Vault)
-- ---------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from vault.secrets where name = 'ssn_encryption_key') then
    perform vault.create_secret(
      encode(extensions.gen_random_bytes(32), 'base64'),
      'ssn_encryption_key',
      'Clave para cifrar el número de Seguro Social de las inscripciones'
    );
  end if;
end $$;

-- ---------------------------------------------------------------------
-- 3. Almacenamiento privado para documentos (máx. 10 MB, fotos o PDF)
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'intake-documents', 'intake-documents', false, 10485760,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
)
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ¿Se puede subir este archivo? Solo dentro de la carpeta de una inscripción
-- recién creada (2 horas), con uno de los 3 nombres permitidos.
create or replace function public.can_upload_intake_doc(p_name text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_folder text := split_part(p_name, '/', 1);
  v_file   text := split_part(p_name, '/', 2);
begin
  if v_folder !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then
    return false;
  end if;
  if v_file !~ '^(license|ssnCard|proofAddress)\.(jpg|jpeg|png|webp|heic|heif|pdf)$' then
    return false;
  end if;
  if split_part(p_name, '/', 3) <> '' then
    return false;
  end if;
  return exists (
    select 1 from public.intakes
    where id = v_folder::uuid
      and status = 'pendiente_documentos'
      and created_at > now() - interval '2 hours'
  );
end;
$$;

drop policy if exists "Inscripciones: subir documentos" on storage.objects;
create policy "Inscripciones: subir documentos"
  on storage.objects
  for insert
  to anon, authenticated
  with check (bucket_id = 'intake-documents' and public.can_upload_intake_doc(name));
-- Sin políticas de lectura, edición ni borrado: los documentos solo se ven desde el panel.

-- ---------------------------------------------------------------------
-- 4a. Guardar una inscripción (lo llama el formulario)
-- ---------------------------------------------------------------------
create or replace function public.submit_intake(p jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id  uuid;
  v_key text;
  v_ssn text := regexp_replace(coalesce(p->>'ssn', ''), '[^0-9]', '', 'g');
begin
  if coalesce(trim(p->>'first_name'), '') = '' or coalesce(trim(p->>'last_name'), '') = '' then
    raise exception 'Faltan el nombre o los apellidos';
  end if;
  if length(v_ssn) <> 9 then
    raise exception 'El número de Seguro Social no es válido';
  end if;
  if coalesce(p->>'email', '') !~* '^[^@[:space:]]+@[^@[:space:]]+\.[^@[:space:]]{2,}$' then
    raise exception 'El correo no es válido';
  end if;
  if coalesce(trim(p->>'street'), '') = '' or coalesce(trim(p->>'city'), '') = ''
     or coalesce(p->>'zip', '') !~ '^[0-9]{5}$' or coalesce(p->>'state', '') !~ '^[A-Za-z]{2}$' then
    raise exception 'La dirección está incompleta';
  end if;
  if not coalesce((p->>'rights_read')::boolean, false)
     or not coalesce((p->>'terms_accepted')::boolean, false)
     or coalesce(trim(p->>'signature'), '') = '' then
    raise exception 'Debe aceptar los términos y firmar';
  end if;

  select decrypted_secret into v_key
  from vault.decrypted_secrets
  where name = 'ssn_encryption_key';
  if v_key is null then
    raise exception 'Falta la clave de cifrado';
  end if;

  insert into public.intakes (
    first_name, middle_name, last_name, date_of_birth, phone, email,
    street, unit, city, state, zip,
    ssn_encrypted, ssn_last4, goals,
    rights_read, terms_accepted, signature, terms_version, user_agent
  ) values (
    trim(p->>'first_name'),
    nullif(trim(coalesce(p->>'middle_name', '')), ''),
    trim(p->>'last_name'),
    (p->>'date_of_birth')::date,
    trim(p->>'phone'),
    lower(trim(p->>'email')),
    trim(p->>'street'),
    nullif(trim(coalesce(p->>'unit', '')), ''),
    trim(p->>'city'),
    upper(trim(p->>'state')),
    trim(p->>'zip'),
    extensions.pgp_sym_encrypt(v_ssn, v_key),
    right(v_ssn, 4),
    coalesce(array(select jsonb_array_elements_text(coalesce(p->'goals', '[]'::jsonb))), '{}'),
    true,
    true,
    trim(p->>'signature'),
    coalesce(nullif(p->>'terms_version', ''), 'pendiente'),
    left(coalesce(p->>'user_agent', ''), 300)
  )
  returning id into v_id;

  return v_id;
end;
$$;

-- ---------------------------------------------------------------------
-- 4b. Confirmar que subieron los 3 documentos (lo llama el formulario)
-- ---------------------------------------------------------------------
create or replace function public.complete_intake_documents(p_id uuid)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_docs jsonb := '{}'::jsonb;
  v_slot text;
  v_name text;
begin
  if not exists (
    select 1 from public.intakes
    where id = p_id
      and status = 'pendiente_documentos'
      and created_at > now() - interval '2 hours'
  ) then
    raise exception 'La inscripción no es válida';
  end if;

  foreach v_slot in array array['license', 'ssnCard', 'proofAddress'] loop
    v_name := null;
    select o.name into v_name
    from storage.objects o
    where o.bucket_id = 'intake-documents'
      and o.name like p_id::text || '/' || v_slot || '.%'
    order by o.created_at desc
    limit 1;
    if v_name is null then
      raise exception 'Falta el documento %', v_slot;
    end if;
    v_docs := v_docs || jsonb_build_object(v_slot, v_name);
  end loop;

  update public.intakes
  set documents = v_docs, status = 'pendiente_pago'
  where id = p_id;

  return 'ok';
end;
$$;

-- ---------------------------------------------------------------------
-- 4c. Ver el SSN de un cliente (solo desde el SQL Editor del panel)
--     Uso: select public.ver_ssn('<id de la inscripción>');
-- ---------------------------------------------------------------------
create or replace function public.ver_ssn(p_id uuid)
returns text
language sql
security definer
set search_path = ''
as $$
  select extensions.pgp_sym_decrypt(
    i.ssn_encrypted,
    (select decrypted_secret from vault.decrypted_secrets where name = 'ssn_encryption_key')
  )
  from public.intakes i
  where i.id = p_id;
$$;

-- ---------------------------------------------------------------------
-- 5. Permisos: la página solo puede llamar a las 2 funciones del formulario
-- ---------------------------------------------------------------------
revoke execute on function public.submit_intake(jsonb) from public;
revoke execute on function public.complete_intake_documents(uuid) from public;
revoke execute on function public.can_upload_intake_doc(text) from public;
revoke execute on function public.ver_ssn(uuid) from public, anon, authenticated;

grant execute on function public.submit_intake(jsonb) to anon, authenticated;
grant execute on function public.complete_intake_documents(uuid) to anon, authenticated;
grant execute on function public.can_upload_intake_doc(text) to anon, authenticated;
