import type { Lang } from "../../lib/i18n";
import { PRIVACY_COPY } from "./privacy";

/** Etiquetas <head> de la política de privacidad (con enlaces hreflang entre ambos idiomas). */
export function privacyHead(lang: Lang) {
  const m = PRIVACY_COPY[lang].meta;
  return {
    meta: [
      { title: m.title },
      { name: "description", content: m.description },
      { property: "og:title", content: m.title },
    ],
    links: [
      { rel: "alternate", hrefLang: "es", href: "/privacidad" },
      { rel: "alternate", hrefLang: "en", href: "/en/privacy" },
    ],
  };
}
