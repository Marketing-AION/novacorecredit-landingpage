import type { Lang } from "../../lib/i18n";
import { ENROLL_COPY } from "./copy";

/** Etiquetas <head> del formulario en cada idioma (con enlaces hreflang entre ambos). */
export function enrollHead(lang: Lang) {
  const m = ENROLL_COPY[lang].meta;
  return {
    meta: [
      { title: m.title },
      { name: "description", content: m.description },
      { property: "og:title", content: m.title },
      { property: "og:description", content: m.ogDescription },
    ],
    links: [
      { rel: "alternate", hrefLang: "es", href: "/inscripcion" },
      { rel: "alternate", hrefLang: "en", href: "/en/enroll" },
    ],
  };
}
