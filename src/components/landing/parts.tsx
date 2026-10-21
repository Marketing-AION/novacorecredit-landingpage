import { useEffect, type CSSProperties, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Camera, MessageSquare, Phone } from "lucide-react";
import { cn } from "../../lib/utils";
import { PATHS, useLang, type PageKey } from "../../lib/i18n";
import { cx, primaryCx, primaryIconCx } from "../enroll/ui";
import { CONTACT } from "../enroll/data";
import { PHOTOS, smsHref, useCopy, type PhotoSlot } from "./content";

/** Botón principal: lleva al formulario del idioma actual. Mismo texto en toda la página. */
export function EnrollLink({
  tone = "green",
  className,
}: {
  /** "navy" para el menú superior. */
  tone?: "green" | "navy" | undefined;
  className?: string | undefined;
}) {
  const lang = useLang();
  const t = useCopy();
  return (
    <Link
      to={PATHS[lang].enroll}
      className={cn(
        primaryCx,
        tone === "navy" &&
          "bg-navy text-white shadow-[0_10px_24px_-14px_oklch(0.239_0.064_259.7_/_0.9)] hover:bg-navy-2",
        className,
      )}
    >
      <span className="whitespace-nowrap">{t.cta}</span>
      <span className={cn(primaryIconCx, tone === "navy" && "bg-green text-navy")}>
        <ArrowRight size={18} strokeWidth={2} aria-hidden="true" />
      </span>
    </Link>
  );
}

/** Botón secundario para llamar o enviar un mensaje de texto, para fondo azul (dark) o claro (light). */
export function ContactLink({
  kind = "call",
  tone = "light",
  className,
}: {
  kind?: "call" | "sms" | undefined;
  tone?: "dark" | "light" | undefined;
  className?: string | undefined;
}) {
  const lang = useLang();
  const t = useCopy();
  const Icon = kind === "call" ? Phone : MessageSquare;
  return (
    <a
      href={kind === "call" ? CONTACT.phoneHref : smsHref(lang)}
      className={cx(
        "inline-flex h-14 items-center justify-center gap-2.5 rounded-full px-6 text-[16px] font-semibold transition-[transform,background-color,border-color] duration-300 [transition-timing-function:var(--ease-out)] active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-3 sm:text-[17px]",
        tone === "dark"
          ? "bg-white/[0.08] text-white ring-1 ring-white/20 hover:bg-white/[0.14] focus-visible:outline-green"
          : "border border-navy/20 bg-white text-navy hover:border-navy/45 focus-visible:outline-green",
        className,
      )}
    >
      <Icon
        size={19}
        strokeWidth={1.75}
        className={tone === "dark" ? "text-green" : "text-green-ink"}
        aria-hidden="true"
      />
      <span className="whitespace-nowrap">
        {kind === "call" ? `${t.call} ${CONTACT.phone}` : t.text}
      </span>
    </a>
  );
}

/** Selector de idioma ES | EN (lleva a la misma página en el otro idioma). */
export function LangSwitch({
  tone = "light",
  page = "home",
  className,
}: {
  tone?: "dark" | "light" | undefined;
  /** Página a la que lleva en el otro idioma (landing, formulario o política). */
  page?: PageKey | undefined;
  className?: string | undefined;
}) {
  const lang = useLang();
  const t = useCopy();
  return (
    <nav
      aria-label={t.nav.language}
      className={cx(
        "inline-flex h-10 items-center rounded-full p-1 text-[13px] font-bold",
        tone === "dark"
          ? "bg-white/10 ring-1 ring-white/20"
          : "bg-navy-soft ring-1 ring-navy/[0.08]",
        className,
      )}
    >
      {(["es", "en"] as const).map((l) => {
        const on = l === lang;
        return (
          <Link
            key={l}
            to={PATHS[l][page]}
            hrefLang={l}
            lang={l}
            aria-current={on ? "page" : undefined}
            aria-label={l === "es" ? "Español" : "English"}
            className={cx(
              "grid h-8 min-w-10 place-items-center rounded-full px-2.5 uppercase transition-colors duration-200",
              on
                ? tone === "dark"
                  ? "bg-white text-navy"
                  : "bg-navy text-white"
                : tone === "dark"
                  ? "text-white/75 hover:text-white"
                  : "text-navy/60 hover:text-navy",
            )}
          >
            {l}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Foto de la landing. Mientras falte la imagen, muestra el espacio marcado
 * con su número (ver contenido/01-Landing-Textos-e-Imagenes.md).
 */
export function Photo({
  slot,
  tone = "light",
  priority,
  labelAt = "center",
  className,
}: {
  slot: PhotoSlot;
  tone?: "dark" | "light" | undefined;
  priority?: boolean | undefined;
  /** "corner"/"top" dejan el centro libre (video, tarjetas con título). */
  labelAt?: "center" | "corner" | "top" | undefined;
  className?: string | undefined;
}) {
  const t = useCopy();
  const p = PHOTOS[slot];
  const label = slot === "video" ? t.video.title : t.doors.items[slot].title;
  const alt = slot === "video" ? "" : t.doors.items[slot].alt;
  if (p.src) {
    return (
      <img
        src={p.src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        className={cx("h-full w-full object-cover", className)}
      />
    );
  }
  return (
    <div
      role="img"
      aria-label={`${t.photo.slot} ${p.n}: ${label}`}
      className={cx(
        "nc-photo-slot relative grid h-full w-full place-items-center overflow-hidden",
        tone === "dark" ? "bg-navy-2 text-white" : "bg-navy-soft text-navy",
        className,
      )}
    >
      <img
        src={tone === "dark" ? "/brand/isotipo-blanco.webp" : "/brand/isotipo.webp"}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[12%] -right-[10%] w-[70%] max-w-[380px] opacity-[0.07]"
      />
      {labelAt !== "center" ? (
        <span
          className={cx(
            "absolute left-3 z-[1] inline-flex items-center gap-2 rounded-full bg-navy/70 px-3 py-1.5 text-[12px] font-semibold text-white/85 sm:left-4",
            labelAt === "top" ? "top-3 sm:top-4" : "bottom-3 sm:bottom-4",
          )}
        >
          <Camera size={14} strokeWidth={1.75} className="text-green" aria-hidden="true" />
          {t.photo.word} {p.n} · {p.ratio}
        </span>
      ) : (
        <span className="relative grid justify-items-center gap-2 px-4 text-center">
          <span
            className={cx(
              "grid h-12 w-12 place-items-center rounded-full",
              tone === "dark" ? "bg-white/10 text-green" : "bg-white text-green-ink",
            )}
          >
            <Camera size={20} strokeWidth={1.75} aria-hidden="true" />
          </span>
          <span className="font-display text-[15px] font-bold">
            {t.photo.word} {p.n}
          </span>
          <span className={cx("text-[13px]", tone === "dark" ? "text-white/65" : "text-ink-muted")}>
            {label} · {p.ratio}
          </span>
        </span>
      )}
    </div>
  );
}

/** Estrella de 4 puntas del isotipo. */
export function NovaStar({
  className,
  style,
}: {
  className?: string | undefined;
  style?: CSSProperties | undefined;
}) {
  return (
    <svg viewBox="0 0 24 24" className={className} style={style} aria-hidden="true">
      <path
        d="M12 0 C12.9 6.6 17.4 11.1 24 12 C17.4 12.9 12.9 17.4 12 24 C11.1 17.4 6.6 12.9 0 12 C6.6 11.1 11.1 6.6 12 0 Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Contenedor de página. "wide" para los bloques de borde a borde (inicio, menú y cierre). */
export function Container({
  children,
  className,
  wide,
}: {
  children: ReactNode;
  className?: string | undefined;
  wide?: boolean | undefined;
}) {
  return (
    <div
      className={cx(
        "mx-auto w-full px-4 sm:px-6",
        wide ? "max-w-[1440px] lg:px-12 xl:px-16" : "max-w-[1200px] lg:px-8",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function H2({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string | undefined;
  id?: string | undefined;
}) {
  return (
    <h2
      id={id}
      className={cx(
        "font-display text-[30px] font-extrabold leading-[1.05] tracking-[-0.02em] text-balance text-navy sm:text-[38px] lg:text-[46px]",
        className,
      )}
    >
      {children}
    </h2>
  );
}

/**
 * Aparición suave al entrar en pantalla. Los elementos con data-reveal se
 * ocultan solo si hay JavaScript y el usuario no pidió reducir movimiento;
 * lo que ya está en pantalla al cargar se muestra de inmediato.
 */
export function useReveal() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const root = document.documentElement;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    const vh = window.innerHeight;
    for (const el of els) {
      if (el.getBoundingClientRect().top < vh * 0.92) el.dataset["in"] = "";
    }
    root.classList.add("nc-reveal-on");
    const pending = new Set(els.filter((el) => !("in" in el.dataset)));
    const show = (el: HTMLElement) => {
      el.dataset["in"] = "";
      pending.delete(el);
      io.unobserve(el);
    };
    // Respaldo: muestra todo lo que ya está en pantalla o quedó atrás tras un
    // salto rápido (tecla Fin, enlaces del menú), aunque no haya llegado aviso.
    const sweep = () => {
      const limit = window.innerHeight * 0.92;
      for (const el of pending) if (el.getBoundingClientRect().top < limit) show(el);
    };
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) show(e.target as HTMLElement);
        sweep();
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    for (const el of pending) io.observe(el);
    window.addEventListener("scrollend", sweep, { passive: true });

    // Elementos que aparecen después (recarga parcial del editor de Lovable,
    // contenido nuevo): también se vigilan, para que nunca queden ocultos.
    const register = (el: HTMLElement) => {
      if ("in" in el.dataset || pending.has(el)) return;
      if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
        el.dataset["in"] = "";
        return;
      }
      pending.add(el);
      io.observe(el);
    };
    const mo = new MutationObserver((records) => {
      for (const r of records) {
        for (const node of r.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          if (node.matches("[data-reveal]")) register(node);
          node.querySelectorAll<HTMLElement>("[data-reveal]").forEach(register);
        }
      }
    });
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
      window.removeEventListener("scrollend", sweep);
      root.classList.remove("nc-reveal-on");
    };
  }, []);
}

/** Retraso escalonado para data-reveal. */
export const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;
