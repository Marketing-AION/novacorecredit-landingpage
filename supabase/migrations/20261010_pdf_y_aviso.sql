-- =====================================================================
-- NovaCore Credit · PDF de cada inscripción y aviso a GoHighLevel
-- Pegar completo en Supabase > SQL Editor y tocar "Run".
-- Se puede ejecutar más de una vez sin duplicar nada.
--
-- Qué hace:
--   1. Agrega a "intakes": el idioma del cliente, dónde quedó su PDF, la
--      clave de su enlace de descarga y cuándo se avisó a NovaCore.
--   2. Crea el almacenamiento privado "intake-pdfs" para los PDF completos.
--   3. submit_intake ahora guarda el idioma (español o inglés).
--   4. Permite que la función del servidor (inscripciones) lea el número de
--      Seguro Social para armar el PDF de NovaCore.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Columnas nuevas
-- ---------------------------------------------------------------------
alter table public.intakes add column if not exists idioma text not null default 'es';
alter table public.intakes drop constraint if exists intakes_idioma_check;
alter table public.intakes add constraint intakes_idioma_check check (idioma in ('es', 'en'));

alter table public.intakes add column if not exists pdf_path text;
alter table public.intakes add column if not exists pdf_token text;
alter table public.intakes add column if not exists notified_at timestamptz;

comment on column public.intakes.idioma is 'Idioma en que el cliente llenó el formulario (es / en).';
comment on column public.intakes.pdf_path is 'PDF completo de la inscripción en el almacenamiento intake-pdfs.';
comment on column public.intakes.pdf_token is 'Clave del enlace de descarga del PDF que recibe NovaCore.';
comment on column public.intakes.notified_at is 'Cuándo se envió el aviso a GoHighLevel (null = todavía no).';

-- ---------------------------------------------------------------------
-- 2. Almacenamiento privado para los PDF completos (máx. 50 MB)
--    Sin políticas: solo la función del servidor y el panel pueden usarlo.
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('intake-pdfs', 'intake-pdfs', false, 52428800, array['application/pdf'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- ---------------------------------------------------------------------
-- 3. Guardar una inscripción (misma función de antes + idioma)
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
    rights_read, terms_accepted, signature, terms_version, user_agent, idioma
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
    left(coalesce(p->>'user_agent', ''), 300),
    case when p->>'idioma' = 'en' then 'en' else 'es' end
  )
  returning id into v_id;

  return v_id;
end;
$$;

revoke execute on function public.submit_intake(jsonb) from public;
grant execute on function public.submit_intake(jsonb) to anon, authenticated;

-- ---------------------------------------------------------------------
-- 4. La función del servidor puede leer el SSN (nunca la página)
-- ---------------------------------------------------------------------
grant execute on function public.ver_ssn(uuid) to service_role;
-- La función también lee la inscripción y marca cuándo se avisó.
grant select, update on table public.intakes to service_role;
