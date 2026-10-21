import { DOCS_BUCKET, supabase } from "../../lib/supabase";
import type { Lang } from "../../lib/i18n";
import type { EnrollCopy } from "./copy";
import type { DocFile, DocKey, FormData } from "./data";

/** Error con un mensaje listo para mostrarle al cliente. */
export class SubmitError extends Error {}

const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/heic": "heic",
  "image/heif": "heif",
  "application/pdf": "pdf",
};

const TYPE_BY_EXT: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  heic: "image/heic",
  heif: "image/heif",
  pdf: "application/pdf",
};

/** Extensión y tipo del archivo. Algunos celulares envían HEIC sin tipo: se deduce del nombre. */
function docMeta(doc: DocFile) {
  const fromName = doc.name.split(".").pop()?.toLowerCase() ?? "";
  const contentType = EXT_BY_TYPE[doc.type] ? doc.type : TYPE_BY_EXT[fromName];
  const ext = contentType ? EXT_BY_TYPE[contentType] : undefined;
  return { ext, contentType };
}

const SLOTS: DocKey[] = ["license", "ssnCard", "proofAddress"];
const pad = (n: string) => n.padStart(2, "0");

/**
 * Guarda la inscripción en Supabase:
 *   1. submit_intake: crea la fila (el SSN se cifra en la base).
 *   2. Sube los 3 documentos a la carpeta privada de esa inscripción.
 *   3. complete_intake_documents: confirma que llegaron los 3.
 * Si un intento falla después del paso 1, el reintento reutiliza la misma
 * inscripción (existingId) para no duplicarla.
 */
export async function submitEnrollment(
  d: FormData,
  existingId: string | null,
  onCreated: (id: string) => void,
  m: EnrollCopy["submit"],
  lang: Lang,
): Promise<string> {
  let id = existingId;

  if (!id) {
    const { data, error } = await supabase.rpc("submit_intake", {
      p: {
        first_name: d.firstName,
        middle_name: d.middleName,
        last_name: d.lastName,
        date_of_birth: `${d.dobYear}-${pad(d.dobMonth)}-${pad(d.dobDay)}`,
        phone: d.phone,
        email: d.email,
        street: d.street,
        unit: d.unit,
        city: d.city,
        state: d.state,
        zip: d.zip,
        ssn: d.ssn,
        goals: d.goals,
        rights_read: d.rightsRead,
        terms_accepted: d.termsAccepted,
        signature: d.signature,
        terms_version: "pendiente",
        idioma: lang,
        user_agent: navigator.userAgent,
      },
    });
    if (error || typeof data !== "string") {
      throw new SubmitError(m.save);
    }
    id = data;
    onCreated(id);
  }

  for (const slot of SLOTS) {
    const doc = d[slot];
    if (!doc?.file) {
      throw new SubmitError(m.missingDoc);
    }
    const { ext, contentType } = docMeta(doc);
    if (!ext || !contentType) {
      throw new SubmitError(m.badDoc);
    }
    const { error } = await supabase.storage
      .from(DOCS_BUCKET)
      .upload(`${id}/${slot}.${ext}`, doc.file, { contentType, upsert: false });
    // Si ya se había subido en un intento anterior, seguimos.
    if (error && !/exists|duplicate/i.test(error.message)) {
      throw new SubmitError(m.upload);
    }
  }

  const { error } = await supabase.rpc("complete_intake_documents", { p_id: id });
  if (error) {
    throw new SubmitError(m.confirm);
  }

  // Aviso a NovaCore: la función "inscripciones" de Supabase arma el PDF
  // completo y lo envía a GoHighLevel (en segundo plano). Si falla, la
  // inscripción ya quedó guardada y no se le muestra error al cliente.
  try {
    await Promise.race([
      supabase.functions.invoke("inscripciones", { body: { id } }),
      new Promise((resolve) => setTimeout(resolve, 10_000)),
    ]);
  } catch {
    /* sin bloquear al cliente */
  }
  return id;
}

/**
 * Al terminar el primer paso se avisa a GoHighLevel (por la función de Supabase) con el
 * nombre, el correo y el teléfono. Si la persona no termina la inscripción, NovaCore le
 * escribe para recordarle. No bloquea el formulario si falla.
 */
export function sendProspect(d: FormData, lang: Lang) {
  void supabase.functions
    .invoke("inscripciones", {
      body: {
        prospecto: {
          nombre: [d.firstName, d.middleName]
            .map((s) => s.trim())
            .filter(Boolean)
            .join(" "),
          apellido: d.lastName.trim(),
          email: d.email.trim(),
          telefono: d.phone,
          idioma: lang,
        },
      },
    })
    .catch(() => undefined);
}

/* ---------- Archivos de ejemplo para "Rellenar este paso" (vista de diseño) ---------- */

const PNG_1PX =
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

export function exampleFile(name: string, type: string): File {
  if (type === "application/pdf") {
    return new File(["%PDF-1.4\n% Documento de ejemplo NovaCore\n%%EOF\n"], name, { type });
  }
  const bytes = Uint8Array.from(atob(PNG_1PX), (c) => c.charCodeAt(0));
  return new File([bytes], name, { type });
}
