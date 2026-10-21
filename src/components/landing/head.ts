import type { Lang } from "../../lib/i18n";
import { COPY, HERO_BG } from "./content";

/** Etiquetas <head> de la landing en cada idioma (con enlaces hreflang entre ambas). */
export function landingHead(lang: Lang) {
  const m = COPY[lang].meta;
  return {
    meta: [
      { title: m.title },
      { name: "description", content: m.description },
      { property: "og:title", content: m.ogTitle },
      { property: "og:description", content: m.ogDescription },
      { property: "og:locale", content: lang === "es" ? "es_US" : "en_US" },
    ],
    links: [
      { rel: "preload", as: "image", href: HERO_BG, fetchPriority: "high" as const },
      { rel: "alternate", hrefLang: "es", href: "/" },
      { rel: "alternate", hrefLang: "en", href: "/en" },
      { rel: "alternate", hrefLang: "x-default", href: "/" },
    ],
  };
}
