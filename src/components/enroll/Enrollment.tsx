import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { CircleAlert, Lock, Phone, RotateCcw } from "lucide-react";
import { LangProvider, PATHS, useLang, type Lang } from "../../lib/i18n";
import { LangSwitch } from "../landing/parts";
import { useEnrollCopy } from "./copy";
import {
  CONTACT,
  PAY_NOW,
  SCREENS,
  SCREEN_FIELDS,
  STEP_OF,
  SUBSTEP,
  emptyForm,
  exampleForm,
  type DocFile,
  type FieldKey,
  type FormData,
  type ScreenId,
} from "./data";
import { SubmitError, exampleFile, sendProspect, submitEnrollment } from "./submit";
import { FOCUS_ORDER, validate, type Errors } from "./logic";
import { BackButton, PrimaryButton, cx } from "./ui";
import { Trajectory } from "./Trajectory";
import {
  AboutYou,
  Address,
  Agreement,
  Documents,
  Done,
  Identity,
  Payment,
  Welcome,
} from "./screens";

const FIELD_TO_ERROR: Partial<Record<FieldKey, keyof Errors>> = {
  dobDay: "dob",
  dobMonth: "dob",
  dobYear: "dob",
};

/** Formulario de inscripción en español (/inscripcion) o inglés (/en/enroll). */
export function Enrollment({ lang }: { lang: Lang }) {
  return (
    <LangProvider lang={lang}>
      <EnrollmentFlow />
    </LangProvider>
  );
}

function EnrollmentFlow() {
  const t = useEnrollCopy();
  const lang = useLang();
  const [index, setIndex] = useState(0);
  const [data, setData] = useState<FormData>(emptyForm);
  const [errors, setErrors] = useState<Errors>({});
  const [paying, setPaying] = useState(false);
  const [intakeId, setIntakeId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  /** Datos para la copia en PDF del cliente (se llena al enviar). */
  const [receipt, setReceipt] = useState<{ intakeId: string; signedAt: Date } | null>(null);
  const autoDownloaded = useRef(false);
  /** Correo con el que ya se avisó a GHL del prospecto (para no repetir el aviso). */
  const prospectSent = useRef<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  const screen: ScreenId = SCREENS[index] ?? "welcome";
  const step = STEP_OF[screen];
  const sub = SUBSTEP[screen];

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    headingRef.current?.focus({ preventScroll: true });
  }, [index]);

  function set<K extends FieldKey>(k: K, v: FormData[K]) {
    setData((p) => ({ ...p, [k]: v }));
    const errKey = FIELD_TO_ERROR[k] ?? (k as keyof Errors);
    if (errors[errKey]) setErrors((e) => ({ ...e, [errKey]: undefined }));
  }

  function next() {
    const found = validate(screen, data, t.errors);
    const keys = FOCUS_ORDER.filter((k) => found[k]);
    if (keys.length) {
      setErrors(found);
      const first = keys[0] ?? "firstName";
      const id = first === "dob" ? "dobDay" : first;
      requestAnimationFrame(() => {
        const el = document.getElementById(id);
        el?.focus({ preventScroll: true });
        el?.scrollIntoView({ block: "center", behavior: "smooth" });
      });
      return;
    }
    setErrors({});
    if (screen === "about" && prospectSent.current !== data.email) {
      prospectSent.current = data.email;
      sendProspect(data, lang);
    }
    if (screen === "payment") {
      void pay();
      return;
    }
    setIndex((i) => Math.min(i + 1, SCREENS.length - 1));
  }

  async function pay() {
    setPaying(true);
    setSubmitError(null);
    try {
      // 1. Guardar la inscripción y los documentos en Supabase.
      const signedAt = new Date();
      const id = await submitEnrollment(data, intakeId, setIntakeId, t.submit, lang);
      setReceipt({ intakeId: id, signedAt });
      // 2. Cobro: pendiente de conectar el procesador de pago de NovaCore.
      setIndex((i) => Math.min(i + 1, SCREENS.length - 1));
    } catch (e) {
      setSubmitError(e instanceof SubmitError ? e.message : t.submit.generic);
    } finally {
      setPaying(false);
    }
  }

  function back() {
    setErrors({});
    setIndex((i) => Math.max(i - 1, 0));
  }

  function fillExample() {
    const fields = SCREEN_FIELDS[screen] ?? [];
    setData((p) => {
      const n = { ...p } as Record<FieldKey, unknown>;
      for (const f of fields) {
        const v = exampleForm[f];
        // Los documentos de ejemplo llevan un archivo real pequeño para poder probar el envío.
        n[f] =
          v && typeof v === "object" && "type" in v
            ? { ...(v as DocFile), file: exampleFile((v as DocFile).name, (v as DocFile).type) }
            : v;
      }
      return n as FormData;
    });
    setErrors({});
  }

  async function downloadCopy() {
    if (!receipt) return;
    try {
      const { downloadClientPdf } = await import("./pdf");
      await downloadClientPdf(data, lang, receipt);
    } catch (e) {
      console.error(e);
    }
  }

  // Al terminar, la copia en PDF se descarga sola una vez (y queda el botón).
  useEffect(() => {
    if (screen === "done" && receipt && !autoDownloaded.current) {
      autoDownloaded.current = true;
      void downloadCopy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, receipt]);

  function restart() {
    autoDownloaded.current = false;
    setReceipt(null);
    setData(emptyForm);
    setErrors({});
    setIntakeId(null);
    setSubmitError(null);
    setIndex(0);
  }

  const props = { d: data, set, errors, headingRef };
  const content: Record<ScreenId, ReactNode> = {
    welcome: <Welcome headingRef={headingRef} />,
    about: <AboutYou {...props} />,
    address: <Address {...props} />,
    identity: <Identity {...props} />,
    documents: <Documents {...props} />,
    agreement: <Agreement {...props} />,
    payment: <Payment {...props} />,
    done: (
      <Done
        d={data}
        headingRef={headingRef}
        onDownload={receipt ? () => void downloadCopy() : undefined}
      />
    ),
  };

  let actions: ReactNode = null;
  if (screen === "welcome") {
    actions = (
      <PrimaryButton onClick={next} className="w-full lg:w-auto">
        {t.shell.start}
      </PrimaryButton>
    );
  } else if (screen !== "done") {
    actions = (
      <>
        <BackButton onClick={back} />
        {screen === "payment" ? (
          <PrimaryButton
            onClick={next}
            loading={paying}
            icon={<Lock size={17} strokeWidth={2} />}
            className="flex-1 lg:flex-none"
          >
            {paying ? t.shell.processing : PAY_NOW ? t.shell.payNow : t.shell.saveCard}
          </PrimaryButton>
        ) : (
          <PrimaryButton onClick={next} className="flex-1 lg:flex-none">
            {screen === "agreement" ? t.shell.accept : t.shell.continue}
          </PrimaryButton>
        )}
      </>
    );
  }

  const canFill = Boolean(SCREEN_FIELDS[screen]);

  return (
    <div className="min-h-[100dvh] bg-paper">
      {/* Barra de la vista de diseño: se quita al conectar el formulario real */}
      <div className="flex items-center justify-between gap-3 bg-navy-deep px-4 py-2 text-[13px] text-white/75 lg:px-8">
        <span>
          {t.shell.demo}
          <span className="hidden sm:inline">{t.shell.demoExtra}</span>
        </span>
        <span className="flex items-center gap-4">
          {canFill && (
            <button
              type="button"
              onClick={fillExample}
              className="font-semibold text-green underline-offset-4 hover:underline"
            >
              {t.shell.fill}
            </button>
          )}
          {index > 0 && (
            <button
              type="button"
              onClick={restart}
              className="inline-flex items-center gap-1.5 font-semibold text-white/80 underline-offset-4 hover:underline"
            >
              <RotateCcw size={13} strokeWidth={2} aria-hidden="true" />
              {t.shell.restart}
            </button>
          )}
        </span>
      </div>

      <div className="lg:grid lg:grid-cols-[minmax(0,44fr)_minmax(0,56fr)]">
        {/* Panel de marca */}
        <aside
          className={cx(
            "relative overflow-hidden bg-navy text-white lg:sticky lg:top-0 lg:flex lg:h-[100dvh] lg:flex-col lg:justify-between lg:px-12 lg:py-10 xl:px-16",
            step === 0 || step === 4 ? "px-5 pb-16 pt-6" : "px-5 pb-14 pt-4",
          )}
        >
          <img
            src="/brand/isotipo.webp"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-16 -right-20 hidden w-[420px] opacity-[0.05] lg:block"
          />

          {/* Encabezado */}
          <div className="relative flex items-center justify-between">
            <Link
              to={PATHS[lang].home}
              aria-label={t.shell.home}
              className="rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-green"
            >
              <img
                src="/brand/logo-blanco.webp"
                alt=""
                className={cx(
                  "h-auto w-[132px] lg:block lg:w-[150px]",
                  step !== 0 && step !== 4 && "hidden",
                )}
              />
              {step !== 0 && step !== 4 && (
                <img src="/brand/isotipo-blanco.webp" alt="" className="h-auto w-10 lg:hidden" />
              )}
            </Link>
            <div className="flex items-center gap-2">
              {/* El idioma se elige antes de empezar (cambiarlo después reiniciaría el formulario) */}
              {screen === "welcome" && <LangSwitch tone="dark" page="enroll" />}
              <a
                href={CONTACT.phoneHref}
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white/10 px-3.5 text-[14px] font-semibold text-white transition-colors hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green lg:hidden"
              >
                <Phone size={16} strokeWidth={1.75} className="text-green" aria-hidden="true" />
                {t.shell.doubtsShort}
              </a>
            </div>
          </div>

          {/* Trayectoria */}
          <div className="relative">
            <p
              className={cx(
                "font-display font-extrabold leading-[1.02] tracking-[-0.02em] text-white lg:block lg:text-[44px] xl:text-[52px]",
                step === 0 || step === 4 ? "mt-7 text-[30px]" : "hidden",
              )}
            >
              {t.shell.tagline1} <span className="text-green">{t.shell.tagline2}</span>
            </p>
            <div
              className={cx(
                "lg:mt-10 lg:block",
                step === 0 || step === 4 ? "mt-6 block" : "hidden",
              )}
            >
              <Trajectory step={step} variant="hero" />
            </div>
            {step >= 1 && step <= 3 && (
              <div className="mt-4 lg:hidden">
                <Trajectory step={step} variant="compact" />
              </div>
            )}
          </div>

          {/* Pie del panel (escritorio) */}
          <div className="relative hidden gap-4 lg:grid">
            <div>
              <p className="text-[15px] font-semibold text-white">{t.shell.doubtsTitle}</p>
              <p className="mt-1 text-[15px] text-white/70">
                {t.shell.doubtsWrite}{" "}
                <a
                  href={CONTACT.phoneHref}
                  className="font-semibold text-white underline-offset-4 hover:underline"
                >
                  {CONTACT.phone}
                </a>
                .
              </p>
            </div>
          </div>
        </aside>

        {/* Contenido */}
        <main
          className={cx(
            "px-4 lg:px-12 lg:py-14 xl:px-16",
            screen === "done" ? "pb-10" : "pb-32 lg:pb-14",
          )}
        >
          <div className="relative z-10 mx-auto -mt-9 max-w-[600px] lg:mt-0">
            <div className="rounded-[28px] bg-white/60 p-1.5 shadow-[0_30px_60px_-30px_oklch(0.239_0.064_259.7_/_0.45)] ring-1 ring-navy/[0.07]">
              <div className="rounded-[22px] bg-white px-5 pb-7 pt-6 shadow-[inset_0_1px_0_rgb(255_255_255)] sm:px-9 sm:pb-9 sm:pt-8">
                {step >= 1 && step <= 3 && (
                  <div className="mb-6 flex items-center justify-between gap-4">
                    <p className="text-[14px] font-semibold text-green-ink">
                      {t.shell.stepOf(step, t.steps[step - 1]?.title ?? "")}
                    </p>
                    {sub && (
                      <span className="flex gap-1.5" aria-label={t.shell.partOf(sub[0], sub[1])}>
                        {Array.from({ length: sub[1] }, (_, i) => (
                          <span
                            key={i}
                            className={cx(
                              "h-1.5 w-6 rounded-full transition-colors duration-500",
                              i < sub[0] ? "bg-green" : "bg-navy/10",
                            )}
                          />
                        ))}
                      </span>
                    )}
                  </div>
                )}

                <div key={screen} className="nc-step-in">
                  {content[screen]}
                </div>

                {screen === "payment" && submitError && (
                  <div
                    role="alert"
                    className="mt-6 flex items-start gap-3 rounded-[14px] border border-danger/25 bg-[oklch(0.97_0.02_29.5)] p-4 text-[15px] leading-snug text-navy"
                  >
                    <CircleAlert
                      size={20}
                      strokeWidth={2}
                      className="mt-0.5 shrink-0 text-danger"
                      aria-hidden="true"
                    />
                    <span>
                      <strong className="font-semibold">{submitError}</strong> {t.shell.notCharged}{" "}
                      <a
                        href={CONTACT.phoneHref}
                        className="font-semibold text-green-ink underline underline-offset-4"
                      >
                        {CONTACT.phone}
                      </a>
                      .
                    </span>
                  </div>
                )}

                {actions && (
                  <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 px-4 pb-[max(12px,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:static lg:z-auto lg:mt-9 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
                    <div className="mx-auto flex max-w-[600px] items-center gap-2 lg:justify-between">
                      {actions}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <footer className="mt-8 grid gap-3 px-1 text-[13px] leading-relaxed text-ink-muted">
              <p>{t.shell.disclaimer}</p>
              <p className="flex flex-wrap gap-x-4 gap-y-1">
                <span>© {new Date().getFullYear()} NovaCore Credit</span>
                {/* En otra pestaña, para no perder lo que ya se llenó */}
                <a
                  href={PATHS[lang].privacy}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline underline-offset-4 hover:text-navy"
                >
                  {t.shell.privacy}
                </a>
                <a href="#" className="underline underline-offset-4 hover:text-navy">
                  {t.shell.terms}
                </a>
                <a
                  href={`mailto:${CONTACT.email}`}
                  className="underline underline-offset-4 hover:text-navy"
                >
                  {CONTACT.email}
                </a>
              </p>
            </footer>
          </div>
        </main>
      </div>
    </div>
  );
}
