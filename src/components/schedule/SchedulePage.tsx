import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, BadgeCheck, Clock, Languages, Phone } from "lucide-react";
import { LangProvider, PATHS } from "../../lib/i18n";
import { CONTACT } from "../enroll/data";
import { COPY } from "../landing/content";

/** Calendario "Consulta gratis · NovaCore Credit" de GoHighLevel (subcuenta de NovaCore). */
const CALENDAR_ID = "C1coEKfNqnbbuTPBf9ep";
const BOOKING_URL =
  `https://api.leadconnectorhq.com/widget/booking/${CALENDAR_ID}` +
  "?backgroundColor=%23FFFFFF&primaryColor=%230B1E3D&buttonText=Agendar+mi+llamada" +
  "&showCalendarTitle=false&showCalendarDescription=false&showCalendarDetails=true";
/** Script de GHL que ajusta la altura del calendario a su contenido. */
const EMBED_SCRIPT = "https://link.msgsndr.com/js/form_embed.js";

const POINTS = [
  { icon: Clock, text: "15 minutos" },
  { icon: Phone, text: "Te llamamos nosotros, al número que nos dejes" },
  { icon: Languages, text: "En español" },
  { icon: BadgeCheck, text: "Gratis y sin compromiso" },
];

/** Atajo para quien ya quiere inscribirse sin llamada previa. */
function StartCard({ className }: { className: string }) {
  return (
    <div className={`gap-2 rounded-[18px] bg-white p-5 ring-1 ring-navy/[0.07] ${className}`}>
      <p className="text-[15px] font-semibold text-navy">¿Ya quieres empezar?</p>
      <Link
        to={PATHS.es.enroll}
        className="inline-flex w-fit items-center gap-2 text-[15px] font-semibold text-green-ink underline-offset-4 hover:underline"
      >
        Empieza tu inscripción
        <ArrowRight size={16} strokeWidth={2} aria-hidden="true" />
      </Link>
    </div>
  );
}

/** Página para agendar la consulta gratis (/agendar). Solo en español: es para prospectos. */
export function SchedulePage() {
  return (
    <LangProvider lang="es">
      <Schedule />
    </LangProvider>
  );
}

function Schedule() {
  const site = COPY.es;

  useEffect(() => {
    if (document.querySelector(`script[src="${EMBED_SCRIPT}"]`)) return;
    const s = document.createElement("script");
    s.src = EMBED_SCRIPT;
    s.async = true;
    document.body.appendChild(s);
  }, []);

  return (
    <div className="min-h-[100dvh] bg-paper">
      <header className="border-b border-navy/[0.07] bg-white">
        <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
          <Link
            to={PATHS.es.home}
            aria-label={site.nav.home}
            className="flex shrink-0 items-center gap-2.5"
          >
            <img src="/brand/isotipo.webp" alt="" className="h-8 w-auto lg:h-10" />
            <img src="/brand/wordmark-color.webp" alt="" className="h-[18px] w-auto lg:h-[23px]" />
          </Link>
          <a
            href={CONTACT.phoneHref}
            aria-label={`Llámanos al ${CONTACT.phone}`}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full border border-navy/15 text-[14px] font-semibold text-navy transition-colors hover:border-navy/35 sm:w-auto sm:px-4"
          >
            <Phone size={16} strokeWidth={1.75} className="text-green-ink" aria-hidden="true" />
            <span className="hidden sm:inline">{CONTACT.phone}</span>
          </a>
        </div>
      </header>

      <main className="px-4 py-10 sm:px-6 sm:py-14 lg:py-16">
        <div className="mx-auto grid max-w-[1180px] gap-8 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-14">
          <section aria-labelledby="agendar-title" className="lg:pt-4">
            <Link
              to={PATHS.es.home}
              className="inline-flex items-center gap-2 text-[15px] font-semibold text-green-ink underline-offset-4 hover:underline"
            >
              <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
              Volver al inicio
            </Link>

            <p className="mt-6 text-[13px] font-semibold uppercase tracking-[0.16em] text-green-ink">
              Consulta gratis
            </p>
            <h1
              id="agendar-title"
              className="mt-2 font-display text-[34px] font-extrabold leading-[1.05] tracking-[-0.02em] text-navy sm:text-[44px]"
            >
              Agenda tu llamada gratis
            </h1>
            <p className="mt-4 max-w-[46ch] text-[17px] leading-relaxed text-navy/80">
              Una llamada de 15 minutos para conocer tu caso, resolver tus dudas y explicarte cómo
              trabajamos. Elige el día y la hora: nosotros te llamamos.
            </p>

            <ul className="mt-7 grid gap-3">
              {POINTS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-3 text-[16px] text-navy">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-green/15 text-green-ink">
                    <Icon size={18} strokeWidth={1.75} aria-hidden="true" />
                  </span>
                  {text}
                </li>
              ))}
            </ul>

            <StartCard className="mt-8 hidden lg:grid" />
          </section>

          <section aria-label="Calendario para agendar tu llamada">
            <div className="overflow-hidden rounded-[28px] bg-white p-2 shadow-[0_30px_60px_-40px_oklch(0.239_0.064_259.7_/_0.45)] ring-1 ring-navy/[0.07] sm:p-4">
              <iframe
                src={BOOKING_URL}
                id={`${CALENDAR_ID}_novacore`}
                title="Calendario de NovaCore Credit para agendar tu consulta gratis"
                scrolling="no"
                className="block min-h-[760px] w-full border-0"
              />
            </div>
            <p className="mt-4 text-center text-[14px] text-ink-muted">
              ¿Prefieres hablar ahora? Llámanos o envíanos un mensaje de texto al{" "}
              <a
                href={CONTACT.phoneHref}
                className="font-semibold text-navy underline-offset-4 hover:underline"
              >
                {CONTACT.phone}
              </a>
              .
            </p>
            <StartCard className="mt-6 lg:hidden" />
          </section>
        </div>
      </main>

      <footer className="mx-auto grid max-w-[1180px] gap-2 px-5 pb-10 text-[13px] leading-relaxed text-ink-muted sm:px-6 lg:px-8">
        <p>{site.footer.disclaimer}</p>
        <p>
          © {new Date().getFullYear()} NovaCore Credit ·{" "}
          <Link to={PATHS.es.privacy} className="underline-offset-4 hover:underline">
            {site.footer.privacy}
          </Link>
        </p>
      </footer>
    </div>
  );
}
