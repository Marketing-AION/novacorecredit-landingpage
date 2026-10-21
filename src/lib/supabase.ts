import { createClient } from "@supabase/supabase-js";

// Proyecto "Novacore Credit - Intake Form". La clave publicable es pública por
// diseño: la seguridad está en las reglas de la base (la página solo puede
// llamar a submit_intake / complete_intake_documents y subir documentos, nunca
// leer). La clave secreta jamás va en este proyecto.
const SUPABASE_URL =
  import.meta.env["VITE_SUPABASE_URL"] ?? "https://eeocsaicszutpepnknoz.supabase.co";
const SUPABASE_PUBLISHABLE_KEY =
  import.meta.env["VITE_SUPABASE_PUBLISHABLE_KEY"] ??
  "sb_publishable_eRnv9DSl0PJxFS932OkVrA_mCrAoVY8";

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export const DOCS_BUCKET = "intake-documents";
