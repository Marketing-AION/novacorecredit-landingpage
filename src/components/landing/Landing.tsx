import { useEffect, useRef, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Phone } from "lucide-react";
import { cx } from "../enroll/ui";
import { LangProvider, PATHS, useLang, type Lang } from "../../lib/i18n";
import { CONTACT } from "../enroll/data";
import { VIDEO_SRC, useCopy } from "./content";
import { Container, EnrollLink, LangSwitch, useReveal } from "./parts";
import {
  Closing,
  Commitments,
  Doors,
  Faq,
  Hero,
  Process,
  Start,
  VideoSection,
  WhyReview,
} from "./sections";

/**
 * Landing de NovaCore Credit, en español (/) e inglés (/en). Llega gente de
 * anuncios y de referidos que aún no conoce a NovaCore: la página explica y da
 * confianza antes de pedir la inscripción. Los botones principales llevan al
 * formulario del mismo idioma.
 */
export function Landing({ lang }: { lang: Lang }) {
  return (
    <LangProvider lang={lang}>
      <LandingPage />
    </LangProvider>
  );
}

/** Secciones del menú (los textos vienen de content.ts en cada idioma). */
const NAV_IDS = ["inicio", "proceso", "preguntas", "contacto"] as const;
type NavId = (typeof NAV_IDS)[number];

function LandingPage() {
  const t = useCopy();
  const lang = useLang();
  const heroCtaRef = useRef<HTMLDivElement>(null);
  const closingRef = useRef<HTMLElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const [pastHero, setPastHero] = useState(false);
  const [atEnd, setAtEnd] = useState(false);
  const [solid, setSolid] = useState(false);
  const [active, setActive] = useState<NavId>("inicio");

  useReveal();

  // El menú se vuelve blanco (y en el celular muestra las secciones) en cuanto se baja un poco.
  useEffect(() => {
    const top = topRef.current;
    if (!top) return;
    const io = new IntersectionObserver(([e]) => setSolid(!(e?.isIntersecting ?? true)));
    io.observe(top);
    return () => io.disconnect();
  }, []);

  // Sección actual en el menú. Las secciones sin enlace propio cuentan como
  // la anterior que sí lo tiene (el video y las puertas son parte del inicio).
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("#contenido > section, #contacto"),
    );
    const owner = new Map<Element, NavId>();
    let current: NavId = "inicio";
    for (const el of sections) {
      if ((NAV_IDS as readonly string[]).includes(el.id)) current = el.id as NavId;
      owner.set(el, current);
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const nav = owner.get(e.target);
          if (e.isIntersecting && nav) setActive(nav);
        }
      },
      { rootMargin: "-40% 0px -55% 0px" },
    );
    for (const el of sections) io.observe(el);
    return () => io.disconnect();
  }, []);

  // Botón fijo en el celular: aparece al pasar los botones del inicio y se
  // esconde al llegar al cierre (que ya tiene los suyos).
  useEffect(() => {
    const hero = heroCtaRef.current;
    const closing = closingRef.current;
    if (!hero || !closing) return;
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        const above = e.boundingClientRect.top < 0;
        if (e.target === hero) setPastHero(!e.isIntersecting && above);
        else setAtEnd(e.isIntersecting || above);
      }
    });
    io.observe(hero);
    io.observe(closing);
    return () => io.disconnect();
  }, []);

  const showBar = pastHero && !atEnd;

  return (
    <div className="relative min-h-[100dvh] bg-paper">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-navy focus:px-4 focus:py-2 focus:text-white"
      >
        {t.nav.skip}
      </a>

      {/* Marca para saber si ya se bajó del borde superior */}
      <div
        ref={topRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-6"
      />

      {/* Menú: transparente sobre el inicio, blanco al bajar */}
      <header
        className={cx(
          "fixed inset-x-0 top-0 z-30 border-b transition-[background-color,border-color,box-shadow] duration-300",
          solid
            ? "border-navy/[0.07] bg-white/90 shadow-[0_10px_30px_-24px_oklch(0.239_0.064_259.7_/_0.6)] backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <Container wide className="flex h-16 items-center justify-between gap-6 lg:h-20">
          <Link
            to={PATHS[lang].home}
            aria-label={t.nav.home}
            className={cx(
              "flex shrink-0 items-center gap-2.5 transition-opacity duration-300",
              !solid && "pointer-events-none invisible opacity-0",
            )}
          >
            <img src="/brand/isotipo.webp" alt="" className="h-8 w-auto lg:h-10" />
            <img src="/brand/wordmark-color.webp" alt="" className="h-[18px] w-auto lg:h-[23px]" />
          </Link>

          <nav aria-label={t.nav.main} className="hidden items-center gap-0.5 lg:flex xl:gap-1">
            {NAV_IDS.map((id) => {
              const on = active === id;
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  aria-current={on ? "location" : undefined}
                  className={cx(
                    "relative whitespace-nowrap px-2.5 py-2 text-[14px] font-semibold transition-colors xl:px-4 xl:text-[15px]",
                    "after:absolute after:inset-x-2.5 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-green after:transition-transform after:duration-300 xl:after:inset-x-4",
                    on ? "after:scale-x-100" : "after:scale-x-0",
                    solid
                      ? on
                        ? "text-navy"
                        : "text-navy/65 hover:text-navy"
                      : on
                        ? "text-white"
                        : "text-white/75 hover:text-white",
                  )}
                >
                  <span className="xl:hidden">{t.nav.short[id]}</span>
                  <span className="hidden xl:inline">{t.nav.items[id]}</span>
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-2 xl:gap-3">
            <LangSwitch tone={solid ? "light" : "dark"} />
            <div className="hidden lg:block">
              <EnrollLink
                tone={solid ? "navy" : "green"}
                className="h-12 pl-5 text-[15px] shadow-none sm:gap-3 sm:pl-5 sm:text-[15px]"
              />
            </div>
            <a
              href={CONTACT.phoneHref}
              aria-label={`${t.call} ${CONTACT.phone}`}
              className={cx(
                "grid h-11 w-11 place-items-center rounded-full text-green transition-[transform,background-color] active:scale-[0.96] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green lg:hidden",
                solid ? "bg-navy" : "bg-white/10 ring-1 ring-white/20",
              )}
            >
              <Phone size={20} strokeWidth={1.75} aria-hidden="true" />
            </a>
          </div>
        </Container>

        {/* Celular: las secciones aparecen debajo del logo al bajar */}
        <nav
          aria-label={t.nav.sections}
          inert={!solid}
          className={cx(
            "overflow-hidden transition-[max-height,opacity] duration-300 [transition-timing-function:var(--ease-out)] lg:hidden",
            solid ? "max-h-12 opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <Container
            wide
            className="flex h-11 items-center justify-between gap-3 border-t border-navy/[0.06]"
          >
            {NAV_IDS.map((id) => {
              const on = active === id;
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  aria-current={on ? "location" : undefined}
                  className={cx(
                    "relative whitespace-nowrap py-2.5 text-[13px] font-semibold transition-colors",
                    "after:absolute after:inset-x-0 after:bottom-1 after:h-0.5 after:origin-left after:rounded-full after:bg-green after:transition-transform after:duration-300",
                    on ? "text-navy after:scale-x-100" : "text-navy/60 after:scale-x-0",
                  )}
                >
                  {t.nav.short[id]}
                </a>
              );
            })}
          </Container>
        </nav>
      </header>

      <main id="contenido">
        <Hero ctaRef={heroCtaRef} />
        {/* La sección del video aparece cuando haya video (VIDEO_SRC en content.ts) */}
        {VIDEO_SRC && <VideoSection />}
        <Doors />
        <WhyReview />
        <Process />
        <Commitments />
        <Start />
        <Faq />
      </main>
      <Closing sectionRef={closingRef} />

      {/* Botón fijo (solo celular) */}
      <div
        inert={!showBar}
        className={cx(
          "fixed inset-x-0 bottom-0 z-30 px-3 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 transition-transform duration-500 [transition-timing-function:var(--ease-out)] lg:hidden",
          showBar ? "translate-y-0" : "translate-y-[130%]",
        )}
      >
        <div className="rounded-full bg-white/85 p-1.5 shadow-[0_16px_40px_-16px_oklch(0.239_0.064_259.7_/_0.55)] ring-1 ring-navy/10 backdrop-blur-xl">
          <EnrollLink className="w-full" />
        </div>
      </div>
    </div>
  );
}
