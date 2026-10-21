import { createContext, useContext, type ReactNode } from "react";

/**
 * Idioma del sitio. El español es el principal (público hispano); el inglés
 * vive en /en (landing) y /en/enroll (formulario).
 */
export type Lang = "es" | "en";

const LangContext = createContext<Lang>("es");

export function LangProvider({ lang, children }: { lang: Lang; children: ReactNode }) {
  return <LangContext.Provider value={lang}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

/** Rutas de cada idioma. */
export const PATHS = {
  es: { home: "/", enroll: "/inscripcion", privacy: "/privacidad" },
  en: { home: "/en", enroll: "/en/enroll", privacy: "/en/privacy" },
} as const satisfies Record<Lang, { home: string; enroll: string; privacy: string }>;

export type PageKey = keyof (typeof PATHS)["es"];

/** Idioma según la dirección (para <html lang>). */
export const langFromPath = (pathname: string): Lang =>
  pathname === "/en" || pathname.startsWith("/en/") ? "en" : "es";
