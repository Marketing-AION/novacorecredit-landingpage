import { Link } from "@tanstack/react-router";
import { ArrowLeft, Mail, MessageSquare, Phone } from "lucide-react";
import { LangProvider, PATHS, useLang, type Lang } from "../../lib/i18n";
import { CONTACT } from "../enroll/data";
import { smsHref, useCopy } from "../landing/content";
import { LangSwitch } from "../landing/parts";
import { usePrivacyCopy } from "./privacy";

/** Política de privacidad en español (/privacidad) o inglés (/en/privacy). */
export function PrivacyPage({ lang }: { lang: Lang }) {
  return (
    <LangProvider lang={lang}>
      <Privacy />
    </LangProvider>
  );
}

function Privacy() {
  const lang = useLang();
  const t = usePrivacyCopy();
  const site = useCopy();
  return (
    <div className="min-h-[100dvh] bg-paper">
      <header className="border-b border-navy/[0.07] bg-white">
        <div className="mx-auto flex h-16 max-w-[1100px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-8">
          <Link
            to={PATHS[lang].home}
            aria-label={site.nav.home}
            className="flex shrink-0 items-center gap-2.5"
          >
            <img src="/brand/isotipo.webp" alt="" className="h-8 w-auto lg:h-10" />
            <img src="/brand/wordmark-color.webp" alt="" className="h-[18px] w-auto lg:h-[23px]" />
          </Link>
          <LangSwitch page="privacy" />
        </div>
      </header>

      <main className="px-4 py-10 sm:px-6 sm:py-14 lg:py-20">
        <article className="mx-auto max-w-[820px] rounded-[28px] bg-white p-6 shadow-[0_30px_60px_-40px_oklch(0.239_0.064_259.7_/_0.45)] ring-1 ring-navy/[0.07] sm:p-10 lg:p-14">
          <Link
            to={PATHS[lang].home}
            className="inline-flex items-center gap-2 text-[15px] font-semibold text-green-ink underline-offset-4 hover:underline"
          >
            <ArrowLeft size={16} strokeWidth={2} aria-hidden="true" />
            {t.back}
          </Link>

          <h1 className="mt-6 font-display text-[34px] font-extrabold leading-[1.05] tracking-[-0.02em] text-navy sm:text-[44px]">
            {t.title}
          </h1>
          <p className="mt-3 text-[14px] text-ink-muted">{t.updated}</p>
          <p className="mt-6 text-[17px] leading-relaxed text-navy/85">{t.intro}</p>

          <div className="mt-10 grid gap-9">
            {t.sections.map((s) => (
              <section key={s.title} aria-labelledby={slug(s.title)}>
                <h2
                  id={slug(s.title)}
                  className="font-display text-[20px] font-bold leading-snug text-navy sm:text-[22px]"
                >
                  {s.title}
                </h2>
                {s.paragraphs?.map((p) => (
                  <p
                    key={p}
                    className="mt-3 text-[16px] leading-relaxed text-navy/80 sm:text-[17px]"
                  >
                    {p}
                  </p>
                ))}
                {s.list && (
                  <ul className="mt-3 grid gap-2.5">
                    {s.list.map((item) => (
                      <li
                        key={item}
                        className="flex gap-3 text-[16px] leading-relaxed text-navy/80 sm:text-[17px]"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-green"
                        />
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
                {s.after?.map((p) => (
                  <p
                    key={p}
                    className="mt-3 text-[16px] font-medium leading-relaxed text-navy sm:text-[17px]"
                  >
                    {p}
                  </p>
                ))}
              </section>
            ))}

            <section aria-labelledby="contacto-privacidad">
              <h2
                id="contacto-privacidad"
                className="font-display text-[20px] font-bold leading-snug text-navy sm:text-[22px]"
              >
                {t.contactTitle}
              </h2>
              <p className="mt-3 text-[16px] leading-relaxed text-navy/80 sm:text-[17px]">
                {t.contactText}
              </p>
              <ul className="mt-4 grid gap-2 text-[16px] sm:text-[17px]">
                <li>
                  <a
                    href={`mailto:${CONTACT.email}`}
                    className="inline-flex items-center gap-2.5 font-semibold text-navy hover:text-green-ink"
                  >
                    <Mail
                      size={17}
                      strokeWidth={1.75}
                      className="text-green-ink"
                      aria-hidden="true"
                    />
                    {t.contactLabels.email}: {CONTACT.email}
                  </a>
                </li>
                <li>
                  <a
                    href={CONTACT.phoneHref}
                    className="inline-flex items-center gap-2.5 font-semibold text-navy hover:text-green-ink"
                  >
                    <Phone
                      size={17}
                      strokeWidth={1.75}
                      className="text-green-ink"
                      aria-hidden="true"
                    />
                    {t.contactLabels.phone}: {CONTACT.phone}
                  </a>
                </li>
                <li>
                  <a
                    href={smsHref(lang)}
                    className="inline-flex items-center gap-2.5 font-semibold text-navy hover:text-green-ink"
                  >
                    <MessageSquare
                      size={17}
                      strokeWidth={1.75}
                      className="text-green-ink"
                      aria-hidden="true"
                    />
                    {t.contactLabels.sms}: {CONTACT.phone}
                  </a>
                </li>
              </ul>
            </section>
          </div>
        </article>

        <footer className="mx-auto mt-8 grid max-w-[820px] gap-2 px-1 text-[13px] leading-relaxed text-ink-muted">
          <p>{site.footer.disclaimer}</p>
          <p>© {new Date().getFullYear()} NovaCore Credit</p>
        </footer>
      </main>
    </div>
  );
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
