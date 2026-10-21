import type { ReactNode, Ref } from "react";
import { Link } from "@tanstack/react-router";
import {
  BadgePercent,
  ChartLine,
  CircleDashed,
  CreditCard,
  FileSearch,
  KeyRound,
  Landmark,
  Languages,
  LockKeyhole,
  CalendarCheck,
  Mail,
  MessageSquare,
  Phone,
  Play,
  Plus,
  Scale,
  Send,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { CONTACT } from "../enroll/data";
import { cx } from "../enroll/ui";
import { PATHS, useLang } from "../../lib/i18n";
import {
  CLOSING_BG,
  DOOR_ORDER,
  HERO_BG,
  PHOTOS,
  VIDEO_SRC,
  smsHref,
  useCopy,
  type DoorKey,
} from "./content";
import { ContactLink, Container, EnrollLink, H2, Photo, delay } from "./parts";
import { ProcessPath } from "./Process";

const lead = "text-[17px] leading-relaxed text-ink-muted sm:text-[19px]";

/* ---------- 1. Inicio ---------- */

const HERO_ICONS: ReactNode[] = [
  <FileSearch key="r" size={28} strokeWidth={1.5} />,
  <ShieldCheck key="d" size={28} strokeWidth={1.5} />,
  <ChartLine key="m" size={28} strokeWidth={1.5} />,
  <Languages key="a" size={28} strokeWidth={1.5} />,
];

/**
 * Inicio: la ciudad con la flecha que sube como fondo, oscurecida con el azul
 * de NovaCore hacia la izquierda para que el texto se lea y con un halo verde
 * donde está la flecha. Ocupa toda la pantalla al entrar.
 */
export function Hero({ ctaRef }: { ctaRef: Ref<HTMLDivElement> }) {
  const t = useCopy();
  return (
    <section
      id="inicio"
      aria-labelledby="hero-title"
      className="relative isolate flex min-h-[100dvh] items-center overflow-hidden bg-navy-deep text-white"
    >
      {/* Fondo y difuminados con los colores de la marca */}
      <img
        src={HERO_BG}
        alt=""
        fetchPriority="high"
        className="nc-hero-photo absolute inset-0 -z-20 h-full w-full object-cover object-[72%_center]"
      />
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-navy/25 mix-blend-multiply" />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--navy-deep)_0%,oklch(0.193_0.047_259.2/0.94)_24%,oklch(0.239_0.064_259.7/0.62)_46%,oklch(0.239_0.064_259.7/0.08)_70%,transparent_100%)] max-lg:bg-[linear-gradient(180deg,oklch(0.193_0.047_259.2/0.55)_0%,oklch(0.193_0.047_259.2/0.82)_40%,var(--navy-deep)_100%)]"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(38%_42%_at_88%_22%,oklch(0.788_0.203_130.3/0.22),transparent_70%),radial-gradient(45%_55%_at_8%_100%,oklch(0.788_0.203_130.3/0.12),transparent_70%)] mix-blend-screen"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-b from-navy-deep/70 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 -z-10 h-40 bg-gradient-to-t from-navy-deep to-transparent"
      />

      {/* Frase de la esquina (escritorio) */}
      <div className="pointer-events-none absolute right-0 top-28 hidden w-full lg:block lg:short:top-24">
        <Container wide className="flex justify-end">
          <p
            className="nc-step-in text-right text-[12px] font-semibold uppercase leading-[1.7] tracking-[0.28em] text-white/85"
            style={{ animationDelay: "500ms" }}
          >
            {t.hero.corner[0]}
            <br />
            {t.hero.corner[1]}
            <span
              aria-hidden="true"
              className="ml-auto mt-3 block h-0.5 w-14 rounded-full bg-green"
            />
          </p>
        </Container>
      </div>

      <Container
        wide
        className="relative pb-14 pt-28 sm:pt-32 lg:pb-16 lg:pt-32 lg:short:pb-10 lg:short:pt-24"
      >
        <div className="max-w-[1000px]">
          <img
            src="/brand/logo-mixto.webp"
            alt="NovaCore Credit"
            width={560}
            height={342}
            className="nc-step-in h-auto w-[150px] sm:w-[190px] lg:w-[220px] lg:short:w-[160px]"
          />
          <p
            className="nc-step-in mt-8 text-[12px] font-semibold uppercase tracking-[0.34em] text-white/85 sm:text-[14px] sm:tracking-[0.4em] lg:short:mt-6"
            style={{ animationDelay: "60ms" }}
          >
            {t.hero.eyebrow}
          </p>
          <h1
            id="hero-title"
            className="nc-step-in mt-3 font-display text-[40px] font-extrabold uppercase leading-[0.95] tracking-[-0.01em] [font-stretch:112%] min-[400px]:text-[44px] sm:text-[64px] sm:[font-stretch:125%] lg:text-[76px] xl:text-[86px] lg:short:text-[66px]"
            style={{ animationDelay: "120ms" }}
          >
            <span className="block">{t.hero.line1}</span>
            <span className="block bg-gradient-to-r from-green to-[oklch(0.86_0.19_135)] bg-clip-text text-transparent">
              {t.hero.line2}
            </span>
          </h1>
          <p
            className="nc-step-in mt-2 font-display text-[30px] font-normal leading-none tracking-[-0.015em] text-white/90 sm:mt-3 sm:text-[42px] lg:text-[48px] lg:short:text-[40px]"
            style={{ animationDelay: "200ms" }}
          >
            {t.hero.kicker}
          </p>
          <p
            className="nc-step-in mt-7 max-w-[46ch] text-[17px] leading-relaxed text-white/85 sm:text-[19px] lg:short:mt-5 lg:short:text-[17px]"
            style={{ animationDelay: "260ms" }}
          >
            {t.hero.body}
          </p>

          <ul
            className="nc-step-in mt-8 grid grid-cols-2 gap-x-4 gap-y-5 sm:flex sm:flex-wrap sm:items-center sm:gap-0 lg:short:mt-6"
            style={{ animationDelay: "320ms" }}
          >
            {t.hero.points.map((p, i) => (
              <li
                key={p.title}
                className={cx(
                  "flex items-center gap-3 sm:px-5 sm:first:pl-0",
                  i > 0 && "sm:border-l sm:border-white/20",
                )}
              >
                <span className="shrink-0 text-green" aria-hidden="true">
                  {HERO_ICONS[i]}
                </span>
                <span className="text-[14px] leading-tight text-white/90">
                  {p.title}
                  <br />
                  {p.text}
                </span>
              </li>
            ))}
          </ul>

          <div
            ref={ctaRef}
            className="nc-step-in mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap lg:short:mt-7"
            style={{ animationDelay: "380ms" }}
          >
            <EnrollLink className="w-full shadow-[0_0_44px_-8px_oklch(0.788_0.203_130.3/0.75)] sm:w-auto" />
            <ContactLink tone="dark" className="w-full sm:w-auto" />
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------- 2. Video ---------- */

export function VideoSection() {
  const t = useCopy();
  return (
    <section aria-labelledby="video-title" className="py-20 sm:py-24 lg:py-32">
      <Container>
        <div data-reveal className="mx-auto max-w-[640px] text-center">
          <H2 id="video-title">{t.video.title}</H2>
          <p className={cx(lead, "mt-4")}>{t.video.text}</p>
        </div>
        <div
          data-reveal
          style={delay(120)}
          className="mx-auto mt-10 max-w-[960px] rounded-[32px] bg-white/70 p-2 shadow-[0_40px_80px_-48px_oklch(0.239_0.064_259.7_/_0.55)] ring-1 ring-navy/[0.07] lg:mt-14"
        >
          <div className="relative aspect-video overflow-hidden rounded-[24px] bg-navy">
            {VIDEO_SRC ? (
              <video
                src={VIDEO_SRC}
                controls
                playsInline
                preload="metadata"
                className="h-full w-full object-cover"
              />
            ) : (
              <>
                <Photo slot="video" tone="dark" labelAt="corner" />
                {PHOTOS.video.src && (
                  <div className="absolute inset-0 bg-navy/40" aria-hidden="true" />
                )}
                <div className="absolute inset-0 grid place-items-center">
                  <div className="grid justify-items-center gap-4">
                    <span
                      className="grid h-16 w-16 place-items-center rounded-full bg-green text-navy shadow-[0_16px_40px_-12px_oklch(0.5_0.142_135.3_/_0.9)] sm:h-20 sm:w-20"
                      aria-hidden="true"
                    >
                      <Play
                        size={26}
                        strokeWidth={1.5}
                        fill="currentColor"
                        className="translate-x-0.5"
                      />
                    </span>
                    <span className="rounded-full bg-navy/80 px-4 py-2 text-[14px] font-semibold text-white ring-1 ring-white/15">
                      {t.video.soon}
                    </span>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------- 3. Las puertas ---------- */

const DOOR_ICON: Partial<Record<DoorKey, ReactNode>> = {
  renta: <KeyRound size={22} strokeWidth={1.75} />,
  tarjetas: <CreditCard size={22} strokeWidth={1.75} />,
  financiamiento: <Landmark size={22} strokeWidth={1.75} />,
  condiciones: <BadgePercent size={22} strokeWidth={1.75} />,
};

export function Doors() {
  const t = useCopy();
  const photoDoors = DOOR_ORDER.filter((d) => d.photo);
  const iconDoors = DOOR_ORDER.filter((d) => !d.photo);
  return (
    <section aria-labelledby="puertas-title" className="pb-20 sm:pb-24 lg:pb-32">
      <Container>
        <div data-reveal className="max-w-[640px]">
          <H2 id="puertas-title">{t.doors.title}</H2>
          <p className={cx(lead, "mt-4")}>{t.doors.text}</p>
        </div>

        {/* Foto arriba y el texto debajo de cada una */}
        <ul className="mt-10 grid gap-4 sm:mx-auto sm:max-w-[540px] lg:mt-14 lg:max-w-none lg:grid-cols-3 lg:gap-5">
          {photoDoors.map((door, i) => {
            const p = door.photo ? PHOTOS[door.photo] : null;
            const item = t.doors.items[door.key];
            if (!p) return null;
            return (
              <li
                key={door.key}
                data-reveal
                style={delay(i * 90)}
                className="group flex flex-col overflow-hidden rounded-[24px] bg-white shadow-[0_24px_48px_-32px_oklch(0.239_0.064_259.7_/_0.45)] ring-1 ring-navy/[0.07]"
              >
                <div className="aspect-[4/3] overflow-hidden bg-navy-soft">
                  {p.src ? (
                    <img
                      src={p.src}
                      srcSet={`${p.src.replace(".webp", "-640.webp")} 640w, ${p.src} 960w`}
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 540px, 100vw"
                      alt={item.alt}
                      width={960}
                      height={720}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-700 [transition-timing-function:var(--ease-out)] group-hover:scale-[1.04]"
                    />
                  ) : (
                    <Photo slot={door.photo ?? "casa"} />
                  )}
                </div>
                <div className="flex flex-1 flex-col gap-2 p-5 sm:p-6">
                  <h3 className="font-display text-[20px] font-bold leading-tight text-navy sm:text-[22px]">
                    {item.title}
                  </h3>
                  {item.text && (
                    <p className="text-[16px] leading-relaxed text-ink-muted">{item.text}</p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

        <ul className="mt-4 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-5 lg:grid-cols-4">
          {iconDoors.map((door, i) => (
            <li
              key={door.key}
              data-reveal
              style={delay(i * 70)}
              className="flex min-h-[150px] flex-col justify-between gap-6 rounded-[24px] bg-white p-4 ring-1 ring-navy/[0.07] sm:min-h-[180px] sm:p-6"
            >
              <span
                className="grid h-12 w-12 place-items-center rounded-full bg-navy-soft text-green-ink"
                aria-hidden="true"
              >
                {DOOR_ICON[door.key]}
              </span>
              <p className="font-display text-[16px] font-bold leading-tight text-navy sm:text-[19px]">
                {t.doors.items[door.key].title}
              </p>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

/* ---------- 4. Por qué revisar tu reporte ---------- */

export function WhyReview() {
  const t = useCopy();
  return (
    <section aria-labelledby="errores-title" className="bg-white py-20 sm:py-24 lg:py-32">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <div data-reveal>
          <p
            className="font-display font-extrabold leading-none tracking-[-0.04em] text-navy"
            aria-hidden="true"
          >
            <span className="text-[104px] text-green-ink sm:text-[136px] lg:text-[160px]">1</span>
            <span className="mx-3 align-[0.55em] font-body text-[22px] font-semibold tracking-normal text-ink-muted sm:text-[28px]">
              {t.why.statMid}
            </span>
            <span className="text-[104px] sm:text-[136px] lg:text-[160px]">5</span>
          </p>
          <div className="mt-6 flex gap-2.5 sm:gap-3" aria-hidden="true">
            {[0, 1, 2, 3, 4].map((n) => (
              <span
                key={n}
                className={cx(
                  "grid h-12 w-12 place-items-center rounded-full sm:h-14 sm:w-14",
                  n === 0 ? "bg-green text-navy" : "bg-navy-soft text-navy/35",
                )}
              >
                <UserRound size={22} strokeWidth={1.75} />
              </span>
            ))}
          </div>
        </div>

        <div data-reveal style={delay(120)}>
          <H2 id="errores-title">{t.why.title}</H2>
          <p className={cx(lead, "mt-5 max-w-[52ch] text-navy/80")}>{t.why.body}</p>
          <p className="mt-6 text-[13px] leading-relaxed text-ink-muted">{t.why.source}</p>
        </div>
      </Container>
    </section>
  );
}

/* ---------- 5. Cómo trabajamos ---------- */

export function Process() {
  const t = useCopy();
  return (
    <section
      id="proceso"
      aria-labelledby="proceso-title"
      className="relative isolate scroll-mt-28 overflow-hidden bg-navy-deep py-20 text-white sm:py-24 lg:py-32"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(55%_65%_at_0%_100%,oklch(0.788_0.203_130.3/0.13),transparent_70%),radial-gradient(50%_60%_at_100%_0%,oklch(0.312_0.083_258.5/0.9),transparent_70%)]"
      />
      <Container wide>
        <ProcessPath
          heading={
            <div data-reveal>
              <H2 id="proceso-title" className="text-white">
                {t.process.title}
              </H2>
              <p className="mt-5 max-w-[40ch] text-[17px] leading-relaxed text-white/70 sm:text-[18px]">
                {t.process.intro}
              </p>
            </div>
          }
        />
      </Container>
    </section>
  );
}

/* ---------- 6. Nuestro compromiso ---------- */

const COMMIT_ICON = {
  idioma: <Languages size={22} strokeWidth={1.75} />,
  claridad: <Scale size={22} strokeWidth={1.75} />,
  datos: <LockKeyhole size={22} strokeWidth={1.75} />,
};

export function Commitments() {
  const t = useCopy();
  return (
    <section aria-labelledby="claro-title" className="py-20 sm:py-24 lg:py-32">
      <Container>
        <div className="relative overflow-hidden rounded-[28px] bg-navy-soft px-5 py-12 sm:px-10 sm:py-14 lg:grid lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:gap-16 lg:rounded-[40px] lg:px-16 lg:py-20">
          <div data-reveal className="relative">
            <H2 id="claro-title">{t.commit.title}</H2>
            <p className="mt-5 max-w-[36ch] text-[17px] leading-relaxed text-navy/70 sm:text-[18px]">
              {t.commit.sub}
            </p>
            <span aria-hidden="true" className="mt-8 block h-1 w-16 rounded-full bg-green" />
          </div>
          <ul className="relative mt-10 grid gap-8 lg:mt-0 lg:gap-10">
            {t.commit.items.map((c, i) => (
              <li
                key={c.title}
                data-reveal
                style={delay(i * 90)}
                className="grid grid-cols-[52px_minmax(0,1fr)] gap-4 sm:gap-5"
              >
                <span
                  className="grid h-[52px] w-[52px] place-items-center rounded-full bg-white text-green-ink shadow-[0_8px_20px_-12px_oklch(0.239_0.064_259.7_/_0.35)]"
                  aria-hidden="true"
                >
                  {COMMIT_ICON[c.icon]}
                </span>
                <div className="pt-1">
                  <h3 className="font-display text-[19px] font-bold leading-snug text-navy sm:text-[21px]">
                    {c.title}
                  </h3>
                  <p className="mt-2 max-w-[52ch] text-[16px] leading-relaxed text-navy/75 sm:text-[17px]">
                    {c.text}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}

/* ---------- 7. Cómo empezar ---------- */

/** Captura real del formulario dentro de un marco de celular. */
function PhoneShot({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string | undefined;
}) {
  return (
    <div
      className={cx(
        "rounded-[2.2rem] bg-[#070f1d] p-[6px] shadow-[0_40px_80px_-28px_rgb(0_0_0/0.75)] ring-1 ring-white/15 sm:rounded-[2.6rem] sm:p-[8px]",
        className,
      )}
    >
      <div className="relative overflow-hidden rounded-[1.8rem] bg-white sm:rounded-[2.1rem]">
        <img
          src={src}
          alt={alt}
          width={720}
          height={1558}
          loading="lazy"
          decoding="async"
          className="block h-auto w-full"
        />
        <span
          aria-hidden="true"
          className="absolute left-1/2 top-[1.4%] h-[2.6%] w-[32%] -translate-x-1/2 rounded-full bg-[#070f1d]"
        />
      </div>
    </div>
  );
}

export function Start() {
  const t = useCopy();
  return (
    <section aria-labelledby="empezar-title" className="bg-white py-20 sm:py-24 lg:py-32">
      <Container className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        {/* El formulario real de NovaCore en dos celulares */}
        <div data-reveal className="order-2 lg:order-1">
          <div className="relative isolate h-[440px] overflow-hidden rounded-[32px] bg-navy-deep sm:h-[540px] lg:h-[620px]">
            <div
              aria-hidden="true"
              className="absolute inset-0 -z-10 bg-[radial-gradient(60%_45%_at_25%_100%,oklch(0.788_0.203_130.3/0.24),transparent_70%),radial-gradient(65%_60%_at_95%_0%,oklch(0.312_0.083_258.5),transparent_70%)]"
            />
            <PhoneShot
              src={t.start.phones.docs.src}
              alt={t.start.phones.docs.alt}
              className="absolute left-[7%] top-[15%] w-[44%] -rotate-[7deg] opacity-95"
            />
            <PhoneShot
              src={t.start.phones.welcome.src}
              alt={t.start.phones.welcome.alt}
              className="absolute right-[7%] top-[6%] w-[48%] rotate-[4deg]"
            />
          </div>
        </div>

        <div className="order-1 lg:order-2">
          <div data-reveal>
            <H2 id="empezar-title">{t.start.title}</H2>
            <p className={cx(lead, "mt-4")}>{t.start.sub}</p>
          </div>

          <ol className="mt-9 grid gap-6">
            {t.start.steps.map((s, i) => (
              <li
                key={s.title}
                data-reveal
                style={delay(80 + i * 80)}
                className="relative grid grid-cols-[40px_minmax(0,1fr)] gap-4"
              >
                {i < t.start.steps.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-6 left-[19px] top-10 w-0.5 bg-line"
                  />
                )}
                <span
                  className="relative grid h-10 w-10 place-items-center rounded-full bg-navy font-display text-[15px] font-bold text-green"
                  aria-hidden="true"
                >
                  {i + 1}
                </span>
                <div className="pt-1.5">
                  <h3 className="font-display text-[18px] font-bold leading-tight text-navy">
                    {s.title}
                  </h3>
                  <p className="mt-1.5 text-[16px] leading-relaxed text-ink-muted">{s.text}</p>
                </div>
              </li>
            ))}
          </ol>

          <p
            data-reveal
            style={delay(320)}
            className="mt-8 flex items-start gap-3 rounded-[18px] bg-navy-soft p-4 text-[15px] leading-snug text-navy sm:text-[16px]"
          >
            <Send
              size={18}
              strokeWidth={1.75}
              className="mt-0.5 shrink-0 text-green-ink"
              aria-hidden="true"
            />
            <span>
              <strong className="font-semibold">{t.start.afterLabel}</strong> {t.start.afterText}
            </span>
          </p>

          <div data-reveal style={delay(380)} className="mt-8">
            <EnrollLink className="w-full sm:w-auto" />
          </div>
        </div>
      </Container>
    </section>
  );
}

/* ---------- 8. Preguntas frecuentes ---------- */

export function Faq() {
  const t = useCopy();
  const lang = useLang();
  return (
    <section
      id="preguntas"
      aria-labelledby="preguntas-title"
      className="scroll-mt-28 py-20 sm:py-24 lg:py-32"
    >
      <Container className="grid gap-10 lg:grid-cols-[minmax(0,0.75fr)_minmax(0,1.25fr)] lg:gap-16">
        <div data-reveal className="lg:sticky lg:top-28 lg:self-start">
          <H2 id="preguntas-title">{t.faq.title}</H2>
          <p className={cx(lead, "mt-4")}>{t.faq.other}</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {/* La consulta gratis (calendario de GHL) es en español */}
            {lang === "es" && (
              <Link
                to="/agendar"
                className="inline-flex h-14 items-center justify-center gap-2.5 rounded-full bg-navy px-6 text-[16px] font-semibold text-white transition-transform duration-300 [transition-timing-function:var(--ease-out)] active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-green sm:text-[17px]"
              >
                <CalendarCheck
                  size={19}
                  strokeWidth={1.75}
                  className="text-green"
                  aria-hidden="true"
                />
                <span className="whitespace-nowrap">{t.schedule}</span>
              </Link>
            )}
            <ContactLink className="w-full sm:w-auto" />
            <ContactLink kind="sms" className="w-full sm:w-auto" />
          </div>
        </div>

        <div className="grid content-start gap-3">
          {t.faq.items.map((f, i) => (
            <details
              key={f.q}
              data-reveal
              style={delay(i * 50)}
              className="group rounded-[20px] bg-white ring-1 ring-navy/[0.07] transition-shadow duration-300 open:shadow-[0_20px_40px_-28px_oklch(0.239_0.064_259.7_/_0.45)]"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-[20px] px-5 py-5 text-[17px] font-semibold leading-snug text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green sm:px-6 sm:text-[18px] [&::-webkit-details-marker]:hidden">
                {f.q}
                <span
                  aria-hidden="true"
                  className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy-soft text-navy transition-transform duration-300 [transition-timing-function:var(--ease-out)] group-open:rotate-45"
                >
                  <Plus size={18} strokeWidth={2} />
                </span>
              </summary>
              <div className="nc-faq-a px-5 pb-6 text-[16px] leading-relaxed text-navy/80 sm:px-6 sm:text-[17px]">
                {f.a && <p className="max-w-[60ch]">{f.a}</p>}
                {f.pending && (
                  <p
                    className={cx(
                      "flex items-start gap-2 rounded-[12px] border border-dashed border-navy/25 bg-navy-soft px-3.5 py-2.5 text-[14px] leading-snug text-ink-muted",
                      f.a && "mt-3",
                    )}
                  >
                    <CircleDashed
                      size={16}
                      strokeWidth={2}
                      className="mt-px shrink-0"
                      aria-hidden="true"
                    />
                    <span>
                      <strong className="font-semibold text-navy">{t.faq.pendingLabel}</strong>{" "}
                      {f.pending}
                    </span>
                  </p>
                )}
              </div>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}

/* ---------- 9. Cierre y pie de página ---------- */

export function Closing({ sectionRef }: { sectionRef: Ref<HTMLElement> }) {
  const t = useCopy();
  const lang = useLang();
  const year = new Date().getFullYear();
  return (
    <section ref={sectionRef} id="contacto" aria-labelledby="cierre-title" className="scroll-mt-28">
      <div className="relative isolate overflow-hidden bg-navy-deep text-white">
        {/* Llamado final: fondo con el isotipo en 3D y difuminados de la marca */}
        <div className="relative isolate">
          <img
            src={CLOSING_BG}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 -z-20 h-full w-full object-cover object-[80%_center] lg:object-right"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--navy-deep)_0%,oklch(0.193_0.047_259.2/0.88)_34%,oklch(0.193_0.047_259.2/0.35)_58%,transparent_78%)] max-lg:bg-[linear-gradient(180deg,oklch(0.193_0.047_259.2/0.62)_0%,oklch(0.193_0.047_259.2/0.86)_45%,var(--navy-deep)_100%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-[radial-gradient(40%_60%_at_8%_105%,oklch(0.788_0.203_130.3/0.16),transparent_70%)]"
          />
          <div
            aria-hidden="true"
            className="absolute inset-x-0 bottom-0 -z-10 h-24 bg-gradient-to-t from-navy-deep to-transparent"
          />

          <Container wide className="py-20 sm:py-24 lg:py-32">
            <div data-reveal className="max-w-[880px]">
              <p className="flex items-center gap-4 text-[12px] font-semibold uppercase tracking-[0.38em] text-white/85 sm:text-[13px] sm:tracking-[0.45em]">
                <span aria-hidden="true" className="h-0.5 w-10 rounded-full bg-green sm:w-14" />
                {t.closing.eyebrow}
              </p>
              <h2
                id="cierre-title"
                className="mt-6 font-display text-[36px] font-extrabold leading-[1.04] tracking-[-0.025em] text-balance sm:text-[52px] lg:text-[60px] xl:text-[66px]"
              >
                <span className="block">{t.closing.line1}</span>
                <span className="block bg-gradient-to-r from-green to-[oklch(0.86_0.19_135)] bg-clip-text text-transparent">
                  {t.closing.line2}
                </span>
              </h2>
              <p className="mt-6 max-w-[50ch] text-[18px] leading-relaxed text-white/80 sm:text-[20px]">
                {t.closing.body}
              </p>
              <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
                <EnrollLink className="h-16 w-full pl-7 text-[17px] shadow-[0_0_48px_-6px_oklch(0.788_0.203_130.3/0.7)] sm:w-auto sm:pl-8 sm:text-[18px]" />
                <ContactLink tone="dark" className="h-16 w-full px-7 sm:w-auto" />
              </div>
              <p className="mt-6 max-w-[60ch] text-[14px] leading-relaxed text-white/60">
                {t.closing.legal}
              </p>
            </div>
          </Container>
        </div>

        <footer className="border-t border-white/10">
          <Container
            wide
            className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,0.8fr)] lg:py-14"
          >
            <div className="grid content-start gap-4">
              <Link
                to={PATHS[lang].home}
                aria-label={t.nav.home}
                className="flex w-fit items-center gap-3"
              >
                <img src="/brand/isotipo-blanco.webp" alt="" className="h-9 w-auto" />
                <img src="/brand/wordmark-blanco.webp" alt="" className="h-[22px] w-auto" />
              </Link>
              <p className="text-[15px] text-white/65">{t.footer.tagline}</p>
            </div>

            <ul className="grid content-start gap-3 text-[15px]">
              <li>
                <a
                  href={CONTACT.phoneHref}
                  className="inline-flex items-center gap-2.5 text-white/85 hover:text-white"
                >
                  <Phone size={16} strokeWidth={1.75} className="text-green" aria-hidden="true" />
                  {CONTACT.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="inline-flex items-center gap-2.5 text-white/85 [overflow-wrap:anywhere] hover:text-white"
                >
                  <Mail
                    size={16}
                    strokeWidth={1.75}
                    className="shrink-0 text-green"
                    aria-hidden="true"
                  />
                  {CONTACT.email}
                </a>
              </li>
              <li>
                <a
                  href={smsHref(lang)}
                  className="inline-flex items-center gap-2.5 text-white/85 hover:text-white"
                >
                  <MessageSquare
                    size={16}
                    strokeWidth={1.75}
                    className="text-green"
                    aria-hidden="true"
                  />
                  {t.textShort}
                </a>
              </li>
              {lang === "es" && (
                <li>
                  <Link
                    to="/agendar"
                    className="inline-flex items-center gap-2.5 text-white/85 hover:text-white"
                  >
                    <CalendarCheck
                      size={16}
                      strokeWidth={1.75}
                      className="text-green"
                      aria-hidden="true"
                    />
                    {t.schedule}
                  </Link>
                </li>
              )}
            </ul>

            <ul className="grid content-start gap-3 text-[15px]">
              <li>
                <Link
                  to={PATHS[lang].privacy}
                  className="text-white/85 underline-offset-4 hover:text-white hover:underline"
                >
                  {t.footer.privacy}
                </Link>
              </li>
              <li>
                <a
                  href="#"
                  className="text-white/85 underline-offset-4 hover:text-white hover:underline"
                >
                  {t.footer.terms}
                </a>
              </li>
            </ul>
          </Container>

          <Container
            wide
            className="grid gap-3 border-t border-white/10 py-8 text-[13px] leading-relaxed text-white/55"
          >
            <p className="max-w-[90ch]">{t.footer.disclaimer}</p>
            <p>© {year} NovaCore Credit</p>
          </Container>
        </footer>
      </div>
    </section>
  );
}
