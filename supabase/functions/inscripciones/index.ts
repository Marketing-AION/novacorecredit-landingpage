/**
 * NovaCore Credit · Función "inscripciones" (Supabase Edge Function)
 *
 * POST { prospecto } Lo llama el formulario al terminar el primer paso (nombre, correo,
 *                    teléfono). Avisa al workflow de prospectos de GHL para escribirle
 *                    si no termina la inscripción.
 * POST { id }        Lo llama el formulario al terminar. Arma el PDF completo de
 *                    la inscripción (todos los datos, el SSN completo y las fotos
 *                    de los documentos), lo guarda en "intake-pdfs" y avisa a
 *                    GoHighLevel con el enlace al PDF. Cada inscripción se avisa
 *                    una sola vez.
 * GET ?id=…&t=…      Enlace permanente para abrir ese PDF (el que recibe NovaCore
 *                    por correo). Con &doc=license|ssnCard|proofAddress abre el
 *                    documento original.
 *
 * Configuración en Supabase:
 *   - Al crearla, desactivar "Verify JWT" (el formulario la llama sin sesión).
 *   - Edge Functions > Secrets: GHL_WEBHOOK_URL = URL del "Inbound Webhook" del
 *     workflow de GoHighLevel.
 *   - GHL_PROSPECTOS_WEBHOOK_URL = URL del "Inbound Webhook" del workflow de entrada de
 *     prospectos (inscripción a medias).
 *   - Opcional, para guardar el enlace al PDF como nota en el contacto de GHL:
 *     GHL_TOKENv2 = token de una Private Integration de la subcuenta de NovaCore
 *     (permisos: View Contacts y Edit Contacts).
 *
 * Reenviar un aviso que falló: volver a llamar POST { "id": "<id>", "esperar": true }.
 * Si ya se había enviado, primero: update public.intakes set notified_at = null where id = '<id>';
 */
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";
import {
  PDFDocument,
  PDFString,
  StandardFonts,
  rgb,
  type PDFEmbeddedPage,
  type PDFFont,
  type PDFImage,
  type PDFPage,
} from "npm:pdf-lib@1.17.1";

declare const EdgeRuntime: { waitUntil(promise: Promise<unknown>): void } | undefined;

const DOCS_BUCKET = "intake-documents";
const PDF_BUCKET = "intake-pdfs";
const GHL_API = "https://services.leadconnectorhq.com";
const GHL_VERSION = "2021-07-28";
/** Nombre de la función en la URL. Se toma de cada llamada por si en Supabase quedó con otro nombre. */
let functionName = "inscripciones";
/** NovaCore está en San Antonio, TX: las horas van en hora del Centro. */
const TZ = "America/Chicago";

const DOC_KEYS = ["license", "ssnCard", "proofAddress"] as const;
type DocKey = (typeof DOC_KEYS)[number];

const DOC_TITLES: Record<DocKey, string> = {
  license: "Licencia de conducir",
  ssnCard: "Tarjeta del Seguro Social",
  proofAddress: "Comprobante de domicilio",
};

const GOALS: Record<string, string> = {
  casa: "Comprar casa",
  auto: "Financiar auto",
  renta: "Rentar",
  tarjetas: "Tarjetas de crédito",
  financiamiento: "Financiamiento",
  negocio: "Su negocio",
  condiciones: "Mejores condiciones",
};

const STATUS: Record<string, string> = {
  pendiente_documentos: "Pendiente de documentos",
  pendiente_pago: "Documentos recibidos, pendiente de pago",
  pagado: "Pagado",
  credit_hero_enviado: "Credit Hero enviado",
  cancelado: "Cancelado",
};

export type Intake = {
  id: string;
  created_at: string;
  status: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  date_of_birth: string;
  phone: string;
  email: string;
  street: string;
  unit: string | null;
  city: string;
  state: string;
  zip: string;
  goals: string[] | null;
  rights_read: boolean;
  terms_accepted: boolean;
  signature: string;
  signed_at: string;
  terms_version: string;
  documents: Partial<Record<DocKey, string>> | null;
  user_agent: string | null;
  idioma: string | null;
  pdf_path: string | null;
  pdf_token: string | null;
  notified_at: string | null;
};

export type LoadedDoc = { key: DocKey; path: string; bytes: Uint8Array | null };

/* ----------------------------------------------------------------------------
 * Servidor
 * ------------------------------------------------------------------------- */

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

const env = (name: string) => Deno.env.get(name) ?? "";

/** Clave de servicio: la nueva "secret key" (sb_secret_…) o la clásica service_role. */
function serviceKey() {
  try {
    const keys = JSON.parse(env("SUPABASE_SECRET_KEYS") || "{}") as Record<string, string>;
    const key = keys["default"] ?? Object.values(keys)[0];
    if (key) return key;
  } catch {
    /* formato desconocido: se usa la clásica */
  }
  return env("SUPABASE_SERVICE_ROLE_KEY");
}

let client: SupabaseClient | null = null;
function db() {
  client ??= createClient(env("SUPABASE_URL"), serviceKey(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return client;
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });

const plain = (body: string, status: number) =>
  new Response(body, { status, headers: { ...CORS, "Content-Type": "text/plain; charset=utf-8" } });

const isUuid = (v: unknown): v is string =>
  typeof v === "string" &&
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);

export async function handler(req: Request): Promise<Response> {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  const parts = new URL(req.url).pathname.split("/").filter(Boolean);
  const name = parts[0] === "functions" ? parts[2] : parts[0];
  if (name) functionName = name;
  try {
    if (req.method === "GET") return await download(new URL(req.url));
    if (req.method === "POST") return await notify(req);
    return json({ error: "Método no permitido" }, 405);
  } catch (e) {
    console.error("inscripciones:", e);
    return json({ error: "Error interno", detalle: errorText(e) }, 500);
  }
}

/** POST: arma el PDF y avisa a GoHighLevel (en segundo plano). */
async function notify(req: Request) {
  const body = (await req.json().catch(() => null)) as {
    id?: unknown;
    esperar?: unknown;
    probarNota?: unknown;
    t?: unknown;
    prospecto?: unknown;
  } | null;
  if (body?.prospecto) return await prospect(body.prospecto);
  const id = body?.id;
  if (!isUuid(id)) return json({ error: "id inválido" }, 400);
  if (body?.probarNota === true) return await testNote(id, body.t);

  // Se aparta la inscripción para que dos llamadas no envíen el aviso dos veces.
  // Solo inscripciones con los documentos completos.
  const { data, error } = await db()
    .from("intakes")
    .update({ notified_at: new Date().toISOString() })
    .eq("id", id)
    .is("notified_at", null)
    .not("status", "in", "(pendiente_documentos,cancelado)")
    .select("*")
    .maybeSingle();
  if (error) throw error;
  if (!data) return json({ ok: true, skipped: true });

  const job = deliver(data as Intake).then(
    (nota) => ({ ok: true, nota }),
    async (e: unknown) => {
      console.error("inscripciones: no se pudo avisar", id, e);
      // Queda pendiente para poder reenviarlo.
      await db().from("intakes").update({ notified_at: null }).eq("id", id);
      return { ok: false, detalle: errorText(e) };
    },
  );
  // { "esperar": true } espera el resultado (para revisar o reenviar a mano).
  if (body?.esperar !== true && typeof EdgeRuntime !== "undefined") {
    EdgeRuntime.waitUntil(job);
    return json({ ok: true, queued: true }, 202);
  }
  const result = await job;
  return json(result, result.ok ? 200 : 502);
}

/** Prospecto: alguien terminó el primer paso del formulario. Se avisa al workflow de GHL. */
async function prospect(input: unknown) {
  const hook = env("GHL_PROSPECTOS_WEBHOOK_URL");
  if (!hook) return json({ ok: false, detalle: "Falta el secreto GHL_PROSPECTOS_WEBHOOK_URL" });
  const p = (input ?? {}) as Record<string, unknown>;
  const text = (key: string, max: number) =>
    typeof p[key] === "string" ? (p[key] as string).trim().slice(0, max) : "";
  const nombre = text("nombre", 80);
  const apellido = text("apellido", 80);
  const email = text("email", 120).toLowerCase();
  const telefono = text("telefono", 30);
  if (!nombre || !apellido || !/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/.test(email)) {
    return json({ error: "datos inválidos" }, 400);
  }
  const res = await fetch(hook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nombre,
      apellido,
      nombre_completo: `${nombre} ${apellido}`,
      email,
      telefono: toE164(telefono),
      idioma: p["idioma"] === "en" ? "Inglés" : "Español",
      fuente: "inscripcion_a_medias",
      fecha: formatDateTime(new Date().toISOString()),
    }),
    signal: AbortSignal.timeout(15_000),
  });
  return json({ ok: res.ok }, res.ok ? 200 : 502);
}

/**
 * Prueba solo la nota en GHL de una inscripción ya enviada, sin volver a mandar el aviso.
 * Pide la misma clave del enlace del PDF: POST { "id", "t", "probarNota": true }.
 */
async function testNote(id: string, token: unknown) {
  if (typeof token !== "string" || token.length < 32) return json({ error: "clave inválida" }, 404);
  const { data } = await db().from("intakes").select("*").eq("id", id).maybeSingle();
  const intake = data as Intake | null;
  if (!intake?.pdf_token || !intake.pdf_path || !sameText(intake.pdf_token, token)) {
    return json({ error: "clave inválida" }, 404);
  }
  if (!ghlToken()) return json({ ok: false, detalle: "Falta el secreto GHL_TOKENv2" });
  try {
    const contactId = await noteInGhl(intake, linkFor(intake.id, intake.pdf_token));
    return json({ ok: true, contactId });
  } catch (e) {
    return json({ ok: false, detalle: errorText(e) });
  }
}

/** Arma (o reutiliza) el PDF, deja la nota en GHL y envía el aviso. Devuelve cómo fue la nota. */
async function deliver(intake: Intake): Promise<string> {
  const sb = db();
  const token = intake.pdf_token ?? randomToken();
  let pdfPath = intake.pdf_path;

  if (!pdfPath) {
    const { data: ssn, error } = await sb.rpc("ver_ssn", { p_id: intake.id });
    if (error) throw error;
    const docs = await Promise.all(
      DOC_KEYS.map(async (key): Promise<LoadedDoc> => {
        const path = intake.documents?.[key] ?? "";
        if (!path) return { key, path, bytes: null };
        const file = await sb.storage.from(DOCS_BUCKET).download(path);
        return {
          key,
          path,
          bytes: file.data ? new Uint8Array(await file.data.arrayBuffer()) : null,
        };
      }),
    );
    const pdf = await buildNovaCorePdf(intake, String(ssn ?? ""), docs, (doc) =>
      linkFor(intake.id, token, doc),
    );
    pdfPath = `${intake.id}/inscripcion-${slug(intake)}.pdf`;
    const up = await sb.storage
      .from(PDF_BUCKET)
      .upload(pdfPath, pdf, { contentType: "application/pdf", upsert: true });
    if (up.error) throw up.error;
    const saved = await sb
      .from("intakes")
      .update({ pdf_path: pdfPath, pdf_token: token })
      .eq("id", intake.id);
    if (saved.error) throw saved.error;
  }

  const pdfUrl = linkFor(intake.id, token);

  // Primero la nota en el contacto (si hay token de GHL). Si falla, el aviso sale igual.
  let nota = "sin GHL_TOKENv2";
  if (ghlToken()) {
    try {
      await noteInGhl(intake, pdfUrl);
      nota = "ok";
    } catch (e) {
      console.error("inscripciones: no se pudo crear la nota en GHL", intake.id, e);
      nota = `error: ${errorText(e)}`;
    }
  }

  await sendToGhl(intake, pdfUrl);
  await sb.from("intakes").update({ notified_at: new Date().toISOString() }).eq("id", intake.id);
  return nota;
}

/* ----------------------------------------------------------------------------
 * Nota con el enlace al PDF en el contacto de GHL (API de HighLevel)
 * ------------------------------------------------------------------------- */

/** ID de la subcuenta de GHL: va dentro de la URL del webhook (/hooks/<id>/webhook-trigger/...). */
function ghlLocationId() {
  return env("GHL_LOCATION_ID") || (env("GHL_WEBHOOK_URL").match(/\/hooks\/([^/]+)\//)?.[1] ?? "");
}

/** Token de la Private Integration de GHL (el secreto nuevo tiene prioridad). */
const ghlToken = () => env("GHL_TOKENv2") || env("GHL_TOKEN");

async function ghl(path: string, init: { method?: string; json?: unknown } = {}) {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${ghlToken()}`,
    Version: GHL_VERSION,
    Accept: "application/json",
  };
  if (init.json !== undefined) headers["Content-Type"] = "application/json";
  const res = await fetch(`${GHL_API}${path}`, {
    method: init.method ?? "GET",
    headers,
    body: init.json !== undefined ? JSON.stringify(init.json) : null,
    signal: AbortSignal.timeout(30_000),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`GHL ${path.split("?")[0]} respondió ${res.status}: ${text.slice(0, 300)}`);
  }
  return (text ? JSON.parse(text) : {}) as Record<string, unknown>;
}

/** Crea o encuentra el contacto (por correo o teléfono) y le agrega una nota con el enlace al PDF. */
async function noteInGhl(i: Intake, pdfUrl: string) {
  const locationId = ghlLocationId();
  if (!locationId) throw new Error("No se encontró el ID de la subcuenta de GHL");
  const up = await ghl("/contacts/upsert", {
    method: "POST",
    json: {
      locationId,
      firstName: [i.first_name, i.middle_name].filter(Boolean).join(" "),
      lastName: i.last_name,
      email: i.email,
      phone: toE164(i.phone),
      address1: [i.street, i.unit].filter(Boolean).join(", "),
      city: i.city,
      state: i.state,
      postalCode: i.zip,
      country: "US",
      source: "inscripcion_web",
    },
  });
  const contactId = (up["contact"] as { id?: string } | undefined)?.id;
  if (!contactId) throw new Error("GHL no devolvió el contacto");
  await ghl(`/contacts/${contactId}/notes`, {
    method: "POST",
    json: {
      body: [
        `Inscripción web · ${formatDateTime(i.created_at)}`,
        "",
        "PDF completo de la inscripción (datos, Seguro Social y documentos):",
        pdfUrl,
        "",
        `Número de inscripción: ${i.id}`,
      ].join("\n"),
    },
  });
  return contactId;
}

/** Aviso al "Inbound Webhook" de GoHighLevel. El SSN y la fecha de nacimiento solo van dentro del PDF. */
async function sendToGhl(i: Intake, pdfUrl: string) {
  const hook = env("GHL_WEBHOOK_URL");
  if (!hook) throw new Error("Falta el secreto GHL_WEBHOOK_URL");
  const firstNames = [i.first_name, i.middle_name].filter(Boolean).join(" ");
  const payload = {
    nombre: firstNames,
    apellido: i.last_name,
    nombre_completo: `${firstNames} ${i.last_name}`,
    email: i.email,
    telefono: toE164(i.phone),
    direccion: [i.street, i.unit].filter(Boolean).join(", "),
    ciudad: i.city,
    estado: i.state,
    zip: i.zip,
    idioma: i.idioma === "en" ? "Inglés" : "Español",
    metas: goalsText(i.goals),
    estado_inscripcion: STATUS[i.status] ?? i.status,
    pdf_url: pdfUrl,
    fuente: "inscripcion_web",
    lead_id: i.id,
    fecha: formatDateTime(i.created_at),
  };
  const res = await fetch(hook, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) throw new Error(`GoHighLevel respondió ${res.status}`);
}

/** GET: abre el PDF (o un documento original) con el enlace permanente. */
async function download(url: URL) {
  const id = url.searchParams.get("id");
  const token = url.searchParams.get("t") ?? "";
  const doc = url.searchParams.get("doc");
  if (!isUuid(id) || token.length < 32) return plain("Enlace no válido.", 404);

  const { data } = await db()
    .from("intakes")
    .select("id, first_name, last_name, middle_name, pdf_path, pdf_token, documents")
    .eq("id", id)
    .maybeSingle();
  const row = data as Pick<
    Intake,
    "id" | "first_name" | "last_name" | "middle_name" | "pdf_path" | "pdf_token" | "documents"
  > | null;
  if (!row?.pdf_token || !sameText(row.pdf_token, token)) return plain("Enlace no válido.", 404);

  let bucket = PDF_BUCKET;
  let path = row.pdf_path ?? "";
  let fileName = path.split("/").pop() ?? "inscripcion.pdf";
  if (doc) {
    if (!(DOC_KEYS as readonly string[]).includes(doc)) return plain("Enlace no válido.", 404);
    bucket = DOCS_BUCKET;
    path = row.documents?.[doc as DocKey] ?? "";
    fileName = `${slug(row)}-${doc}.${path.split(".").pop() ?? "bin"}`;
  }
  if (!path) return plain("El archivo todavía no está listo.", 404);

  const file = await db().storage.from(bucket).download(path);
  if (!file.data) return plain("No se encontró el archivo.", 404);
  return new Response(file.data, {
    headers: {
      ...CORS,
      "Content-Type": file.data.type || "application/octet-stream",
      "Content-Disposition": `inline; filename="${fileName}"`,
      "Cache-Control": "private, no-store",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

function linkFor(id: string, token: string, doc?: DocKey) {
  const u = new URL(`${env("SUPABASE_URL")}/functions/v1/${functionName}`);
  u.searchParams.set("id", id);
  u.searchParams.set("t", token);
  if (doc) u.searchParams.set("doc", doc);
  return u.toString();
}

function errorText(e: unknown) {
  if (e && typeof e === "object" && "message" in e)
    return String((e as { message: unknown }).message);
  return String(e);
}

function randomToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(24));
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

/** Comparación de la clave sin cortar en la primera diferencia. */
function sameText(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function toE164(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return phone;
}

/* ----------------------------------------------------------------------------
 * Formatos
 * ------------------------------------------------------------------------- */

function slug(i: Pick<Intake, "first_name" | "last_name">) {
  return (
    `${i.first_name} ${i.last_name}`
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "cliente"
  );
}

function goalsText(goals: string[] | null) {
  return goals?.length ? goals.map((g) => GOALS[g] ?? g).join(", ") : "No indicó";
}

function formatDateTime(iso: string) {
  const text = new Intl.DateTimeFormat("es-US", {
    timeZone: TZ,
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
  return `${text} (hora del Centro)`;
}

/** Fecha sin hora (AAAA-MM-DD), sin correrla por la zona horaria. */
function formatDate(ymd: string) {
  const d = new Date(`${ymd}T12:00:00Z`);
  if (Number.isNaN(d.getTime())) return ymd;
  return new Intl.DateTimeFormat("es-US", {
    timeZone: "UTC",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

function formatSsn(ssn: string) {
  const d = ssn.replace(/\D/g, "");
  return d.length === 9
    ? `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`
    : ssn || "No disponible";
}

/** Tipo real del archivo según sus primeros bytes. */
function sniff(bytes: Uint8Array): "jpg" | "png" | "pdf" | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47)
    return "png";
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46)
    return "pdf";
  return null;
}

/* ----------------------------------------------------------------------------
 * PDF para NovaCore
 * ------------------------------------------------------------------------- */

const NAVY = rgb(11 / 255, 30 / 255, 61 / 255);
const GREEN = rgb(140 / 255, 210 / 255, 35 / 255);
const MUTED = rgb(80 / 255, 98 / 255, 130 / 255);
const LINE = rgb(0.87, 0.9, 0.94);
const WHITE = rgb(1, 1, 1);

const PAGE_W = 612; // Carta (EE. UU.)
const PAGE_H = 792;
const M = 54;
const BOTTOM = 70;
const MAX_PDF_PAGES = 10;

/** Isotipo de NovaCore (PNG 144 px). */
const LOGO_PNG =
  "iVBORw0KGgoAAAANSUhEUgAAAJAAAACQCAMAAADQmBKKAAABIFBMVEVk019OoE5a3Q9XdaIsYaKt7JyUsdFsmMiN5nKe7jtEqSmRmrI64Al2g53d8uAdQX8EbQT+/v4AAAACKWkDNHcCGlADRJICO4UEIloDqAL///8DuAIJxQMCUqjS1+IBTaLn6/C2xdj///8ElwQJhgmyusv///8vRnT////S59KJmrcu0wgkzAP///////////8zVIuLpcYR0gUACTwrlioADEO1yuEwyTDR8s9O2gdziKsAHmMtty3M19QFeAWw1LDFy9iu5qkmOmpLZ5aU5ZHZ4uzG8bQt0SuMuIxMXocjpiOWo7xldJYyhDJQ2CxNplBZeqijrcFppGlHVntv2G0uTod6kraN2o90unOqyapm3Udy5TB94nXk+N6W6UyMx4x08ZRBAAAAYHRSTlP///////////////////////4A/////////wT/////////rv///9P/Mf////92i0n///////////////////////////////////////////////////////////////+rDBZrAAAHLElEQVR42u3ceVfbOBAAcEPPbfdyJDl2bEKIcydcCWkKCRCgQKG0pSd0e33/b7Gjy5adsHTfk4n+yPS9Qts4/DoaSWODbeUmolCgvzVWy7WanUnUauXVRkF+pVRY0ziF9XJGFkVVXi9MI1mTnMaafUex1pgkJUGUU7bvMMoN9kVvAhVyhTX7jmOtkBRZieFar9l3HrX1xLBZ6nCt2jOJVXXYLGW4yvaMoqwMm2WAJyGyTPCoIkvU82w9VCQq2xLza8YeEIm5xkGzml/JuRaBYP2xDYh1JrJYAdlGBCsjCsqtmQFayzFQodCwDYkGpAhAs59hykzLWYWcMQmCFOUKljEVJKrIMmWKyYlmmbEGxWuRZU5J87K2CjWTQLWC1bCNioa1ahZo1SqbBSpbNbNANfNAtmExB81Bc9AclF0cGAb6c9Ew0FVwYBZoFHw1CrTvdRdPTAKdB92vPwwCjfxue/G3H98NAR2M/KC7vQiiEwNAzY+DIAi67W2Ixd+3PzZnDTq4Pvc6beppd4Pw3GoaMGT7W0++breDwNvaN6Wo3z7Zph4ds6xUXUnGMxb/V7TQ6fqhnmn/oYdYYIzzLBwaj37d8pyVtheE+5rWoQ99jJnGiWJ56ZdFBxbfw669kY6to1iF3+pEZCfyLINo89dWoAUxq5relQ7QLhlDGR2SCc/S0vLDW9/9xSj8CR82V9hi3dSSIeLuMpEC4h4Q3VLZLwbhOUXsIAa60tIPFV2CivSD60yAlpaK/zVYAz9coLP0HuIgPS0sZIgcHtOhcx1nAnT/+MaZNfA9NlzFTyiPtYJAVC/ZdpUgBSREy/dL0w/76IOHzvIqRjDWmkFpUQxy8MbU4gl8P9yi5dNCbHrqBiHyCUSvCE4NmZN30NG00fL9ylv66aVYTfXWkEtFNBOtPk7OMvhSGN1LHfEN0uNVrmk5b8jVXSeIeRAa0kzs9PIKiHlwSkTTE3gVWj7Fv4TH0Q1iG9mQft2LnrMcrYvCg4c7yfQEYaXJyxlnCEIYXcIfj/og4iDuwfBPpCXTcxqwcqZTr4qkJysQRjQTZ30+yWR+WJB3YnJRDy9n+/MQywRlBcLoM9tonaVlOsFiDyKE5sTinvf8wNYw8ugGSQ+8fYmJltIeBC3BySn3vLSTIDoL8s+0g8SbUxBstKoHloR6kQ8X9fy0VVA+K5DMPtsoSi5RPC45g7/7h3H8ypfowBbKCqR0rxxEO4B87IFSf/6Gefjyo4Dy2YIcCbLHxJXzi075B22WHq+yaydAcQelEyRKmi0nWO7tK0JEaKfzLehwT6IjbKG4pdM6y5QEIRQ1G9U+ZA66gGP7+5upHg4SCUL6QfR/C/mIu593ICKwv520g44/xWM/jEF53SBe0lDACshu9Wg5P2h3wOMxT2mjqhy4iRzhgfrPAkQnFFb7w6dQzo874PEgqOfTEBcTIOnJAMQ8KRBbfbqBJz3Q/CDneAKU1w+iCaIeV60hm60+0rMrmjG0UUqB+AKqG8Q9KdBJu5P0sBfej0A49hDdIO5Jgh7Enn1WPyyTDr6UoDyvZ5QBCNG+mkAooMdwTcznni8yP3y12olBcn/RDHKFR82QBR6RH+g3Nkjcrjr5RxIU73dVnSCWGx5uKZpebTle19Qj+yW+lT7kILHduZpBikeC6G4hPdAfnhGlQWGxwmaZzI9mEJkAPYfVWXjo1YQLEjco8mS7yE4rBSczEFx1YNOL9obC85r2ImrDJBZDWCBLMJCCQ7IBQW3TneFAekIv3GMb6kpqwMCDYYEs1YngkKwyNBanOiI/3p5oEDeHiUuQrDOABbKIiSzAbDJEPVe+4nmZ6p8jD12foTUZu1KUCWiFXfaJPZWF+FWXUb+aFye07LSyKg7tawTtEiXrlk9BflzQURyJdiz2sNPKp/zYXgYg4fGlx9tLdogbiK3SgsPX6E16BUc3SAzZO+HxI8+X5OuOnQkPcsHxRy8T0Cv4bOD5rHmOVujUC2ONPMV2aR900dMP6lPPSPUkC0icGuGUh4pg5Trr6a6hfot5aEjQ3u6Ul26iFAdWxcMS/eaN3mnfp+fK3OPxHPnxCpSIz0jhiG21DtcC6lqHjHnOYw+c84QLN7z4HsJJD78UUXI1gsYX4IF9i0XARXs3fhflaIgTHCqCNxiPtf50TNMLWXg+B90wYGI5Snlct79j21p/XKcZiuCeYNoMi6KE0x7YzlpaQc2wwjgVj18j8//evf1qiZsIcU1UD6hZERFyT7D3/r8PqJIpobGo326JGJzCr8Hp6PVt7/jqsJ6Oww+l+c+gzUFz0Bw0B81BmYHm93XcBjLuVhzjblYy7nYu4254M+6WQONumjTutlLzbrw17dZk427eNu/2duMeAGDeIxKMe4iEeY/ZMO9BJMY9qsW8h9mY97gf8x6IZN4jo8x7qJZ5jx0z8MFs5j26zryH+83+8Yf/AnZr+heyBT9PAAAAAElFTkSuQmCC";

class Writer {
  page: PDFPage;
  y = PAGE_H - M;
  private charset: Set<number>;

  constructor(
    private doc: PDFDocument,
    private font: PDFFont,
    private bold: PDFFont,
  ) {
    this.page = doc.addPage([PAGE_W, PAGE_H]);
    this.charset = new Set(font.getCharacterSet());
  }

  /** Reemplaza caracteres que la fuente estándar no puede dibujar. */
  clean(text: string) {
    return Array.from(text.normalize("NFC").replace(/[\u00A0\u2007\u2009\u202F]/g, " "))
      .map((ch) => (this.charset.has(ch.codePointAt(0) ?? 0) ? ch : "?"))
      .join("");
  }

  wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
    const lines: string[] = [];
    for (const raw of text.split("\n")) {
      let line = "";
      for (const word of this.clean(raw).split(/\s+/)) {
        const next = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(next, size) <= maxW) {
          line = next;
          continue;
        }
        if (line) lines.push(line);
        // Palabras muy largas (enlaces, correos): se cortan por letras.
        let rest = word;
        while (font.widthOfTextAtSize(rest, size) > maxW) {
          let cut = rest.length;
          while (cut > 1 && font.widthOfTextAtSize(rest.slice(0, cut), size) > maxW) cut--;
          lines.push(rest.slice(0, cut));
          rest = rest.slice(cut);
        }
        line = rest;
      }
      lines.push(line);
    }
    return lines;
  }

  newPage() {
    this.page = this.doc.addPage([PAGE_W, PAGE_H]);
    this.y = PAGE_H - M;
  }

  ensure(h: number) {
    if (this.y - h < BOTTOM) this.newPage();
  }

  heading(text: string) {
    this.ensure(56);
    this.y -= 18;
    this.page.drawText(this.clean(text), {
      x: M,
      y: this.y,
      size: 13,
      font: this.bold,
      color: NAVY,
    });
    this.y -= 8;
    this.page.drawRectangle({ x: M, y: this.y, width: 36, height: 2.5, color: GREEN });
    this.y -= 12;
  }

  /** Fila etiqueta / valor. */
  field(label: string, value: string, opts: { strong?: boolean; link?: string | undefined } = {}) {
    const labelW = 178;
    const size = opts.strong ? 12 : 10.5;
    const lh = opts.strong ? 16 : 14;
    const valueFont = opts.strong ? this.bold : this.font;
    const lines = this.wrap(value || "-", valueFont, size, PAGE_W - M * 2 - labelW);
    const labelLines = this.wrap(label, this.bold, 9.5, labelW - 12);
    const h = Math.max(lines.length * lh, labelLines.length * 14) + 8;
    this.ensure(h);
    labelLines.forEach((l, i) =>
      this.page.drawText(l, {
        x: M,
        y: this.y - 10 - i * 14,
        size: 9.5,
        font: this.bold,
        color: MUTED,
      }),
    );
    lines.forEach((l, i) =>
      this.page.drawText(l, {
        x: M + labelW,
        y: this.y - 10 - i * lh,
        size,
        font: valueFont,
        color: NAVY,
      }),
    );
    if (opts.link) this.link(opts.link, M + labelW, this.y - h + 3, PAGE_W - M, this.y);
    this.y -= h;
    this.page.drawLine({
      start: { x: M, y: this.y + 3 },
      end: { x: PAGE_W - M, y: this.y + 3 },
      thickness: 0.5,
      color: LINE,
    });
  }

  /** Zona que abre un enlace al tocarla (los enlaces largos ocupan varias líneas). */
  link(url: string, x1: number, y1: number, x2: number, y2: number) {
    const ctx = this.doc.context;
    const annot = ctx.obj({
      Type: "Annot",
      Subtype: "Link",
      Rect: [x1, y1, x2, y2],
      Border: [0, 0, 0],
      A: { Type: "Action", S: "URI", URI: PDFString.of(url) },
    });
    this.page.node.addAnnot(ctx.register(annot));
  }

  paragraph(text: string, size = 10.5, color = NAVY) {
    const lh = size * 1.45;
    for (const l of this.wrap(text, this.font, size, PAGE_W - M * 2)) {
      this.ensure(lh);
      this.page.drawText(l, { x: M, y: this.y - size, size, font: this.font, color });
      this.y -= lh;
    }
    this.y -= 4;
  }

  /** Título de una página de documento. Devuelve la parte de arriba del espacio libre. */
  docHeader(title: string, note: string) {
    this.newPage();
    this.page.drawText(this.clean(title), {
      x: M,
      y: this.y - 13,
      size: 13,
      font: this.bold,
      color: NAVY,
    });
    this.page.drawRectangle({ x: M, y: this.y - 22, width: 36, height: 2.5, color: GREEN });
    this.page.drawText(this.clean(note), {
      x: M,
      y: this.y - 37,
      size: 9,
      font: this.font,
      color: MUTED,
    });
    return this.y - 50;
  }
}

/** Dibuja algo de tamaño w×h dentro del espacio libre de la página, centrado y sin deformarlo. */
function fitBox(w: number, h: number, top: number) {
  const boxW = PAGE_W - M * 2;
  const boxH = top - BOTTOM;
  const scale = Math.min(boxW / w, boxH / h);
  const width = w * scale;
  const height = h * scale;
  return { x: M + (boxW - width) / 2, y: top - height, width, height };
}

type PreparedDoc = {
  key: DocKey;
  original: string;
  /** Texto para la lista de documentos de la primera parte. */
  summary: string;
  /** Enlace al original cuando no se puede mostrar completo. */
  link?: string | undefined;
  image: PDFImage | null;
  pages: PDFEmbeddedPage[];
  total: number;
};

/** Prepara un documento: foto (JPG/PNG), páginas de un PDF, o una nota con el enlace al original. */
async function prepareDoc(
  pdf: PDFDocument,
  d: LoadedDoc,
  docLink: (key: DocKey) => string,
): Promise<PreparedDoc> {
  const original = d.path.split("/").pop() ?? "";
  const base = { key: d.key, original, image: null, pages: [], total: 0 };
  if (!d.bytes) {
    return {
      ...base,
      summary: `No se encontró el archivo. Revisar en Supabase > Storage > ${DOCS_BUCKET} > ${d.path || "-"}`,
    };
  }
  const kind = sniff(d.bytes);
  if (kind === "jpg" || kind === "png") {
    try {
      const image = kind === "jpg" ? await pdf.embedJpg(d.bytes) : await pdf.embedPng(d.bytes);
      return { ...base, image, summary: "Foto incluida al final de este documento." };
    } catch {
      /* imagen dañada: se trata como no compatible */
    }
  }
  if (kind === "pdf") {
    try {
      const src = await PDFDocument.load(d.bytes);
      const total = src.getPageCount();
      const pages = await pdf.embedPages(src.getPages().slice(0, MAX_PDF_PAGES));
      let summary =
        total === 1
          ? "PDF incluido al final de este documento."
          : `PDF de ${total} páginas incluido al final.`;
      if (total > MAX_PDF_PAGES) {
        summary = `PDF de ${total} páginas; se incluyen las primeras ${MAX_PDF_PAGES}. Original completo: ${docLink(d.key)}`;
        return { ...base, pages, total, summary, link: docLink(d.key) };
      }
      return { ...base, pages, total, summary };
    } catch {
      /* PDF protegido o dañado */
    }
  }
  const ext = (original.split(".").pop() ?? "").toUpperCase();
  return {
    ...base,
    summary: `No se puede mostrar dentro del PDF (formato ${ext || "desconocido"}). Abrir el original: ${docLink(d.key)}`,
    link: docLink(d.key),
  };
}

export async function buildNovaCorePdf(
  i: Intake,
  ssn: string,
  docs: LoadedDoc[],
  docLink: (key: DocKey) => string,
): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const fullName = [i.first_name, i.middle_name, i.last_name].filter(Boolean).join(" ");
  pdf.setTitle(`Inscripción · ${fullName} · NovaCore Credit`);
  pdf.setAuthor("NovaCore Credit");
  pdf.setLanguage("es-US");
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const w = new Writer(pdf, font, bold);

  // Encabezado: franja azul con el isotipo
  const bandH = 96;
  w.page.drawRectangle({ x: 0, y: PAGE_H - bandH, width: PAGE_W, height: bandH, color: NAVY });
  try {
    const logo = await pdf.embedPng(Uint8Array.from(atob(LOGO_PNG), (c) => c.charCodeAt(0)));
    w.page.drawImage(logo, { x: M, y: PAGE_H - bandH + 22, width: 52, height: 52 });
  } catch {
    /* sin logo */
  }
  w.page.drawText("NovaCore Credit", {
    x: M + 66,
    y: PAGE_H - 50,
    size: 18,
    font: bold,
    color: WHITE,
  });
  w.page.drawText("Inscripción de cliente", {
    x: M + 66,
    y: PAGE_H - 70,
    size: 11,
    font,
    color: GREEN,
  });
  const tag = "CONFIDENCIAL";
  w.page.drawText(tag, {
    x: PAGE_W - M - bold.widthOfTextAtSize(tag, 9),
    y: PAGE_H - 50,
    size: 9,
    font: bold,
    color: GREEN,
  });
  w.y = PAGE_H - bandH - 20;

  // Nombre del cliente
  w.page.drawText(w.clean(fullName), { x: M, y: w.y - 20, size: 20, font: bold, color: NAVY });
  w.y -= 34;
  w.paragraph(`Recibida el ${formatDateTime(i.created_at)}`, 10, MUTED);

  w.heading("Resumen");
  w.field("Estado", STATUS[i.status] ?? i.status);
  w.field("Idioma del formulario", i.idioma === "en" ? "Inglés" : "Español");
  w.field("Número de inscripción", i.id);

  w.heading("Datos del cliente");
  w.field("Nombre(s)", [i.first_name, i.middle_name].filter(Boolean).join(" "));
  w.field("Apellido(s)", i.last_name);
  w.field("Fecha de nacimiento", formatDate(i.date_of_birth));
  w.field("Número de Seguro Social", formatSsn(ssn), { strong: true });
  w.field("Teléfono", i.phone);
  w.field("Correo electrónico", i.email);
  w.field("Dirección", `${i.street}${i.unit ? `, ${i.unit}` : ""}\n${i.city}, ${i.state} ${i.zip}`);
  w.field("Puertas que quiere abrir", goalsText(i.goals));

  w.heading("Acuerdo y firma");
  w.field("Leyó sus derechos como consumidor", i.rights_read ? "Sí" : "No");
  w.field("Aceptó los términos y condiciones", i.terms_accepted ? "Sí" : "No");
  w.field("Firma (nombre escrito)", i.signature);
  w.field("Fecha y hora de la firma", formatDateTime(i.signed_at));
  w.field("Versión de los términos", i.terms_version);
  w.field("Dispositivo", i.user_agent ?? "-");

  // Documentos: se preparan antes para poder listarlos aquí, y cada uno va en
  // su propia página al final.
  const prepared = await Promise.all(docs.map((d) => prepareDoc(pdf, d, docLink)));
  w.heading("Documentos");
  for (const p of prepared) w.field(DOC_TITLES[p.key], p.summary, { link: p.link });

  w.heading("Próximos pasos para NovaCore");
  w.paragraph(
    "1. Confirmar el pago del cliente.\n2. Agregar al cliente a Credit Hero Score.\n3. Enviarle el enlace de bienvenida para activar su monitoreo de crédito.",
  );
  w.paragraph(
    "Este documento contiene el número de Seguro Social completo y copias de documentos de identidad. Guárdelo en un lugar seguro y no lo reenvíe.",
    9,
    MUTED,
  );

  for (const p of prepared) {
    const title = DOC_TITLES[p.key];
    if (p.image) {
      const img = p.image;
      const top = w.docHeader(
        title,
        `Archivo original: ${p.original}  ·  ${img.width} × ${img.height} px`,
      );
      const box = fitBox(img.width, img.height, top);
      w.page.drawImage(img, box);
      w.page.drawRectangle({ ...box, borderColor: LINE, borderWidth: 0.75 });
    }
    p.pages.forEach((pg, n) => {
      const top = w.docHeader(
        p.total > 1 ? `${title} (página ${n + 1} de ${p.total})` : title,
        `Archivo original: ${p.original}`,
      );
      const box = fitBox(pg.width, pg.height, top);
      w.page.drawPage(pg, box);
      w.page.drawRectangle({ ...box, borderColor: LINE, borderWidth: 0.75 });
    });
  }

  // Pie de página con número de página
  const pages = pdf.getPages();
  pages.forEach((pg, n) => {
    pg.drawLine({
      start: { x: M, y: 46 },
      end: { x: PAGE_W - M, y: 46 },
      thickness: 0.5,
      color: LINE,
    });
    pg.drawText(w.clean(`NovaCore Credit  |  Confidencial  |  ${fullName}`), {
      x: M,
      y: 32,
      size: 8.5,
      font,
      color: MUTED,
    });
    const label = `Página ${n + 1} / ${pages.length}`;
    pg.drawText(label, {
      x: PAGE_W - M - font.widthOfTextAtSize(label, 8.5),
      y: 32,
      size: 8.5,
      font,
      color: MUTED,
    });
  });

  return pdf.save();
}

Deno.serve(handler);
