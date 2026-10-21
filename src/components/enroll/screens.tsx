import type { ReactNode, Ref } from "react";
import {
  BriefcaseBusiness,
  Building2,
  CalendarClock,
  Camera,
  Car,
  CreditCard,
  Download,
  FileText,
  House,
  IdCard,
  Landmark,
  Mail,
  MessageSquare,
  Percent,
  Phone,
  Receipt,
  ShieldCheck,
  SquareUser,
} from "lucide-react";
import { smsHref } from "../landing/content";
import { useLang } from "../../lib/i18n";
import { useEnrollCopy } from "./copy";
import { compressImage } from "./image";
import {
  CONTACT,
  MAX_DOC_MB,
  PAY_NOW,
  US_STATES,
  type DocFile,
  type DocKey,
  type FieldKey,
  type FormData,
  type Goal,
} from "./data";
import {
  formatCard,
  formatCvc,
  formatDay,
  formatExp,
  formatPhone,
  formatSSN,
  formatYear,
  formatZip,
  type Errors,
} from "./logic";
import {
  CheckRow,
  DocUpload,
  Field,
  FieldError,
  SecretInput,
  SecureNote,
  SelectInput,
  TextInput,
  Why,
  cx,
} from "./ui";

export type ScreenProps = {
  d: FormData;
  set: <K extends FieldKey>(k: K, v: FormData[K]) => void;
  errors: Errors;
  headingRef: Ref<HTMLHeadingElement>;
};

const STATE_OPTIONS = US_STATES.map(([c, n]) => [c, `${n} (${c})`] as [string, string]);

function Heading({
  headingRef,
  title,
  text,
  as = "h2",
}: {
  headingRef: Ref<HTMLHeadingElement>;
  title: string;
  text?: ReactNode;
  as?: "h1" | "h2";
}) {
  const Tag = as;
  return (
    <div className="mb-7">
      <Tag
        ref={headingRef}
        tabIndex={-1}
        className="font-display text-[27px] font-extrabold leading-[1.08] tracking-[-0.02em] text-navy outline-none sm:text-[32px]"
      >
        {title}
      </Tag>
      {text && (
        <p className="mt-2.5 max-w-[46ch] text-[16.5px] leading-relaxed text-ink-muted">{text}</p>
      )}
    </div>
  );
}

function IconTile({ children }: { children: ReactNode }) {
  return (
    <span
      className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-navy-soft text-navy"
      aria-hidden="true"
    >
      {children}
    </span>
  );
}

/* ---------------- Bienvenida ---------------- */

export function Welcome({ headingRef }: Pick<ScreenProps, "headingRef">) {
  const t = useEnrollCopy();
  const icons: ReactNode[] = [
    <IdCard key="i" size={21} strokeWidth={1.75} />,
    <Camera key="c" size={21} strokeWidth={1.75} />,
    <CreditCard key="t" size={21} strokeWidth={1.75} />,
  ];
  const items: [ReactNode, string][] = t.welcome.items.map((text, i) => [icons[i], text]);
  return (
    <>
      <Heading headingRef={headingRef} as="h1" title={t.welcome.title} text={t.welcome.text} />
      <p className="text-[15px] font-semibold text-navy">{t.welcome.haveReady}</p>
      <ul className="mt-3 grid gap-3">
        {items.map(([icon, text]) => (
          <li key={text} className="flex items-center gap-3.5 text-[16px] leading-snug text-navy">
            <IconTile>{icon}</IconTile>
            {text}
          </li>
        ))}
      </ul>
      <div className="mt-7">
        <SecureNote>{t.welcome.secure}</SecureNote>
      </div>
    </>
  );
}

/* ---------------- Paso 1 · Sobre ti ---------------- */

export function AboutYou({ d, set, errors, headingRef }: ScreenProps) {
  const t = useEnrollCopy();
  const a = t.about;
  const monthOptions = t.months.map((m, i) => [String(i + 1), m] as [string, string]);
  const dobErr = errors.dob;
  return (
    <>
      <Heading headingRef={headingRef} title={a.title} text={a.text} />
      <div className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field id="firstName" label={a.firstName} error={errors.firstName}>
            <TextInput
              id="firstName"
              value={d.firstName}
              onValue={(v) => set("firstName", v)}
              autoComplete="given-name"
              error={errors.firstName}
            />
          </Field>
          <Field id="middleName" label={a.middleName} optional>
            <TextInput
              id="middleName"
              value={d.middleName}
              onValue={(v) => set("middleName", v)}
              autoComplete="additional-name"
            />
          </Field>
        </div>
        <Field id="lastName" label={a.lastName} error={errors.lastName}>
          <TextInput
            id="lastName"
            value={d.lastName}
            onValue={(v) => set("lastName", v)}
            autoComplete="family-name"
            error={errors.lastName}
          />
        </Field>

        <fieldset className="grid gap-2" aria-describedby={dobErr ? "dob-error" : undefined}>
          <legend className="mb-2 text-[15px] font-semibold text-navy">{a.dob}</legend>
          <div className="grid grid-cols-[1fr_2fr_1.35fr] gap-2.5">
            <TextInput
              id="dobDay"
              aria-label={a.day}
              placeholder={a.day}
              inputMode="numeric"
              autoComplete="bday-day"
              value={d.dobDay}
              onValue={(v) => set("dobDay", formatDay(v))}
              error={dobErr}
            />
            <SelectInput
              id="dobMonth"
              ariaLabel={a.month}
              placeholder={a.month}
              value={d.dobMonth}
              onValue={(v) => set("dobMonth", v)}
              options={monthOptions}
              autoComplete="bday-month"
              error={dobErr}
            />
            <TextInput
              id="dobYear"
              aria-label={a.year}
              placeholder={a.year}
              inputMode="numeric"
              autoComplete="bday-year"
              value={d.dobYear}
              onValue={(v) => set("dobYear", formatYear(v))}
              error={dobErr}
            />
          </div>
          {dobErr && <FieldError id="dob-error" message={dobErr} />}
        </fieldset>

        <Field id="phone" label={a.phone} error={errors.phone}>
          <TextInput
            id="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            placeholder={a.phonePh}
            value={d.phone}
            onValue={(v) => set("phone", formatPhone(v))}
            error={errors.phone}
          />
        </Field>
        <Field id="email" label={a.email} error={errors.email} hint={a.emailHint}>
          <TextInput
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder={a.emailPh}
            value={d.email}
            onValue={(v) => set("email", v.trim())}
            error={errors.email}
            hasHint
          />
        </Field>
      </div>
      <p className="mt-6 text-[13.5px] leading-snug text-ink-muted">{a.consent}</p>
    </>
  );
}

/* ---------------- Paso 1 · Dirección ---------------- */

export function Address({ d, set, errors, headingRef }: ScreenProps) {
  const a = useEnrollCopy().address;
  return (
    <>
      <Heading headingRef={headingRef} title={a.title} text={a.text} />
      <div className="grid gap-5">
        <Field id="street" label={a.street} error={errors.street}>
          <TextInput
            id="street"
            autoComplete="address-line1"
            placeholder={a.streetPh}
            value={d.street}
            onValue={(v) => set("street", v)}
            error={errors.street}
          />
        </Field>
        <Field id="unit" label={a.unit} optional>
          <TextInput
            id="unit"
            autoComplete="address-line2"
            value={d.unit}
            onValue={(v) => set("unit", v)}
          />
        </Field>
        <Field id="city" label={a.city} error={errors.city}>
          <TextInput
            id="city"
            autoComplete="address-level2"
            value={d.city}
            onValue={(v) => set("city", v)}
            error={errors.city}
          />
        </Field>
        <div className="grid grid-cols-[1.6fr_1fr] gap-3">
          <Field id="state" label={a.state} error={errors.state}>
            <SelectInput
              id="state"
              placeholder={a.statePh}
              value={d.state}
              onValue={(v) => set("state", v)}
              options={STATE_OPTIONS}
              autoComplete="address-level1"
              error={errors.state}
            />
          </Field>
          <Field id="zip" label={a.zip} error={errors.zip}>
            <TextInput
              id="zip"
              inputMode="numeric"
              autoComplete="postal-code"
              value={d.zip}
              onValue={(v) => set("zip", formatZip(v))}
              error={errors.zip}
            />
          </Field>
        </div>
      </div>
    </>
  );
}

/* ---------------- Paso 1 · Seguro Social y meta ---------------- */

const GOALS: [Goal, ReactNode][] = [
  ["casa", <House key="h" size={18} strokeWidth={1.75} />],
  ["auto", <Car key="a" size={18} strokeWidth={1.75} />],
  ["renta", <Building2 key="r" size={18} strokeWidth={1.75} />],
  ["tarjetas", <CreditCard key="t" size={18} strokeWidth={1.75} />],
  ["financiamiento", <Landmark key="f" size={18} strokeWidth={1.75} />],
  ["negocio", <BriefcaseBusiness key="n" size={18} strokeWidth={1.75} />],
  ["condiciones", <Percent key="c" size={18} strokeWidth={1.75} />],
];

export function Identity({ d, set, errors, headingRef }: ScreenProps) {
  const t = useEnrollCopy();
  const a = t.identity;
  const toggle = (g: Goal) =>
    set("goals", d.goals.includes(g) ? d.goals.filter((x) => x !== g) : [...d.goals, g]);
  return (
    <>
      <Heading headingRef={headingRef} title={a.title} text={a.text} />
      <div className="grid gap-5">
        <Field id="ssn" label={a.ssn} error={errors.ssn} hint={a.ssnHint}>
          <SecretInput
            id="ssn"
            inputMode="numeric"
            autoComplete="off"
            value={d.ssn}
            onValue={(v) => set("ssn", formatSSN(v))}
            error={errors.ssn}
            hasHint
          />
        </Field>
        <Why>{a.why}</Why>
        <SecureNote>{a.secure}</SecureNote>

        <fieldset className="mt-3 border-t border-line pt-6">
          <legend className="sr-only">{a.goalsTitle}</legend>
          <p
            className="font-display text-[19px] font-bold leading-tight text-navy"
            aria-hidden="true"
          >
            {a.goalsTitle}
            <span className="ml-1.5 font-body text-[15px] font-normal text-ink-muted">
              {t.ui.optional}
            </span>
          </p>
          <p className="mt-1.5 text-[15px] text-ink-muted">{a.goalsText}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {GOALS.map(([g, icon]) => {
              const label = a.goals[g];
              const on = d.goals.includes(g);
              return (
                <button
                  key={g}
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(g)}
                  className={cx(
                    "inline-flex h-11 items-center gap-2 rounded-full border px-4 text-[15px] font-semibold transition-[background-color,border-color,color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green",
                    on
                      ? "border-navy bg-navy text-white [&_svg]:text-green"
                      : "border-line bg-white text-navy hover:border-navy/40",
                  )}
                >
                  {icon}
                  {label}
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>
    </>
  );
}

/* ---------------- Paso 2 · Documentos ---------------- */

const PREVIEWABLE = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function toDoc(f: File): DocFile {
  return {
    name: f.name,
    size: f.size,
    type: f.type,
    file: f,
    previewUrl: PREVIEWABLE.includes(f.type) ? URL.createObjectURL(f) : undefined,
  };
}

const DOCS: [DocKey, ReactNode][] = [
  ["license", <SquareUser key="l" size={21} strokeWidth={1.75} />],
  ["ssnCard", <IdCard key="s" size={21} strokeWidth={1.75} />],
  ["proofAddress", <Receipt key="p" size={21} strokeWidth={1.75} />],
];

export function Documents({ d, set, errors, headingRef }: ScreenProps) {
  const a = useEnrollCopy().documents;
  return (
    <>
      <Heading headingRef={headingRef} title={a.title} text={a.text} />
      <div className="grid gap-3">
        {DOCS.map(([key, icon]) => (
          <DocUpload
            key={key}
            id={key}
            title={a.items[key].title}
            hint={a.items[key].hint}
            icon={icon}
            value={d[key]}
            onFile={(f) => void compressImage(f).then((c) => set(key, toDoc(c)))}
            onClear={() => set(key, null)}
            error={errors[key]}
          />
        ))}
      </div>
      <div className="mt-5 grid gap-4">
        <Why>{a.why}</Why>
        <SecureNote>{a.secure(MAX_DOC_MB)}</SecureNote>
      </div>
    </>
  );
}

/* ---------------- Paso 3 · Términos y condiciones ---------------- */

function LegalDoc({ title, subtitle }: { title: string; subtitle: string }) {
  const a = useEnrollCopy().agreement;
  return (
    <details className="group rounded-[16px] border border-line bg-white open:bg-paper">
      <summary className="flex cursor-pointer list-none items-center gap-3.5 rounded-[16px] p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green [&::-webkit-details-marker]:hidden">
        <IconTile>
          <FileText size={20} strokeWidth={1.75} />
        </IconTile>
        <span className="grid flex-1">
          <span className="text-[16px] font-semibold leading-snug text-navy">{title}</span>
          <span className="text-[14px] text-ink-muted">{subtitle}</span>
        </span>
        <span className="text-[14px] font-semibold text-green-ink group-open:hidden">{a.read}</span>
        <span className="hidden text-[14px] font-semibold text-green-ink group-open:inline">
          {a.close}
        </span>
      </summary>
      <div className="px-4 pb-4">
        <div className="rounded-[12px] border border-dashed border-navy/25 bg-white p-4 text-[15px] leading-relaxed text-ink-muted">
          {a.placeholder}
        </div>
      </div>
    </details>
  );
}

export function Agreement({ d, set, errors, headingRef }: ScreenProps) {
  const t = useEnrollCopy();
  const a = t.agreement;
  const today = new Intl.DateTimeFormat(t.dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());
  const rights: [ReactNode, string, string][] = [
    [<CalendarClock key="c" size={20} strokeWidth={1.75} />, a.cancelTitle, a.cancelText],
  ];
  if (!PAY_NOW) {
    rights.push([
      <ShieldCheck key="s" size={20} strokeWidth={1.75} />,
      a.noUpfrontTitle,
      a.noUpfrontText,
    ]);
  }
  return (
    <>
      <Heading headingRef={headingRef} title={a.title} text={a.text} />
      <div className="grid gap-5">
        <ul className={cx("grid gap-3", rights.length > 1 && "sm:grid-cols-2")}>
          {rights.map(([icon, title, text]) => (
            <li key={title} className="flex gap-3.5 rounded-[16px] bg-navy-soft p-4">
              <span
                className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-navy text-green"
                aria-hidden="true"
              >
                {icon}
              </span>
              <span className="grid gap-1">
                <span className="text-[16px] font-bold leading-snug text-navy">{title}</span>
                <span className="text-[15px] leading-snug text-navy/80">{text}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="grid gap-2.5">
          <LegalDoc title={a.rightsDoc.title} subtitle={a.rightsDoc.subtitle} />
          <LegalDoc title={a.termsDoc.title} subtitle={a.termsDoc.subtitle} />
        </div>

        <div className="grid gap-2.5">
          <CheckRow
            id="rightsRead"
            checked={d.rightsRead}
            onValue={(v) => set("rightsRead", v)}
            error={errors.rightsRead}
          >
            {a.rightsCheck}
          </CheckRow>
          <CheckRow
            id="termsAccepted"
            checked={d.termsAccepted}
            onValue={(v) => set("termsAccepted", v)}
            error={errors.termsAccepted}
          >
            {a.termsCheck}
          </CheckRow>
        </div>

        <Field
          id="signature"
          label={a.signature}
          error={errors.signature}
          hint={a.signedToday(today)}
        >
          <TextInput
            id="signature"
            autoComplete="name"
            value={d.signature}
            onValue={(v) => set("signature", v)}
            error={errors.signature}
            hasHint
            className="text-[18px] font-semibold"
          />
        </Field>
      </div>
    </>
  );
}

/* ---------------- Paso 3 · Pago ---------------- */

export function Payment({ d, set, errors, headingRef }: ScreenProps) {
  const a = useEnrollCopy().payment;
  const rows: [string, string, boolean?][] = [
    [a.service, a.serviceValue],
    [a.amount, a.amountValue, true],
    [a.charge, PAY_NOW ? a.chargeNow : a.chargeLater],
  ];
  return (
    <>
      <Heading headingRef={headingRef} title={a.title} text={PAY_NOW ? a.textNow : a.textLater} />
      <div className="grid gap-5">
        <dl className="grid rounded-[18px] bg-navy-soft px-4 py-1">
          {rows.map(([k, v, pending], i) => (
            <div
              key={k}
              className={cx(
                "flex items-baseline justify-between gap-4 py-3",
                i > 0 && "border-t border-navy/10",
              )}
            >
              <dt className="text-[15px] text-ink-muted">{k}</dt>
              <dd
                className={cx(
                  "text-right text-[15px] font-semibold text-navy",
                  pending && "italic text-ink-muted",
                )}
              >
                {v}
              </dd>
            </div>
          ))}
        </dl>

        <Field id="cardName" label={a.cardName} error={errors.cardName}>
          <TextInput
            id="cardName"
            autoComplete="cc-name"
            value={d.cardName}
            onValue={(v) => set("cardName", v)}
            error={errors.cardName}
          />
        </Field>
        <Field id="cardNumber" label={a.cardNumber} error={errors.cardNumber}>
          <div className="relative">
            <CreditCard
              size={20}
              strokeWidth={1.75}
              aria-hidden="true"
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted"
            />
            <TextInput
              id="cardNumber"
              inputMode="numeric"
              autoComplete="cc-number"
              placeholder="0000 0000 0000 0000"
              value={d.cardNumber}
              onValue={(v) => set("cardNumber", formatCard(v))}
              error={errors.cardNumber}
              className="pl-12 tracking-[0.04em]"
            />
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field id="cardExp" label={a.exp} error={errors.cardExp}>
            <TextInput
              id="cardExp"
              inputMode="numeric"
              autoComplete="cc-exp"
              placeholder={a.expPh}
              value={d.cardExp}
              onValue={(v) => set("cardExp", formatExp(v))}
              error={errors.cardExp}
            />
          </Field>
          <Field id="cardCvc" label={a.cvc} error={errors.cardCvc} hint={a.cvcHint}>
            <TextInput
              id="cardCvc"
              inputMode="numeric"
              autoComplete="cc-csc"
              placeholder="CVC"
              value={d.cardCvc}
              onValue={(v) => set("cardCvc", formatCvc(v))}
              error={errors.cardCvc}
              hasHint
            />
          </Field>
        </div>
        <Field id="cardZip" label={a.zip} error={errors.cardZip}>
          <TextInput
            id="cardZip"
            inputMode="numeric"
            autoComplete="postal-code"
            value={d.cardZip}
            onValue={(v) => set("cardZip", formatZip(v))}
            error={errors.cardZip}
          />
        </Field>
        <SecureNote>{a.secure}</SecureNote>
      </div>
    </>
  );
}

/* ---------------- Terminado ---------------- */

export function Done({
  d,
  headingRef,
  onDownload,
}: Pick<ScreenProps, "d" | "headingRef"> & { onDownload?: (() => void) | undefined }) {
  const lang = useLang();
  const a = useEnrollCopy().done;
  const name = d.firstName.trim().split(/\s+/)[0];
  const next: ReactNode[] = [
    a.step1,
    <>
      {a.sent} <strong className="font-semibold">{a.link}</strong>
      {d.email ? (
        <>
          {" "}
          {a.to} <strong className="font-semibold [overflow-wrap:anywhere]">{d.email}</strong>
        </>
      ) : null}
      {a.sentEnd}
    </>,
    a.step3,
  ];
  return (
    <>
      <p className="font-script text-[64px] leading-none text-navy" aria-hidden="true">
        {a.big}
      </p>
      <Heading
        headingRef={headingRef}
        as="h1"
        title={a.title}
        text={name ? a.thanksName(name) : a.thanks}
      />
      <p className="text-[15px] font-semibold text-navy">{a.next}</p>
      <ol className="mt-3 grid gap-3">
        {next.map((item, i) => (
          <li key={i} className="flex items-start gap-3.5 text-[16px] leading-snug text-navy">
            <span
              className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-green font-display text-[14px] font-bold text-navy"
              aria-hidden="true"
            >
              {i + 1}
            </span>
            <span className="pt-1">{item}</span>
          </li>
        ))}
      </ol>
      {onDownload && (
        <div className="mt-6 flex flex-col gap-4 rounded-[18px] border border-line p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
          <div className="flex items-start gap-3.5">
            <IconTile>
              <FileText size={20} strokeWidth={1.75} />
            </IconTile>
            <span className="grid gap-0.5">
              <span className="text-[15px] font-semibold text-navy">{a.pdfTitle}</span>
              <span className="text-[14px] leading-snug text-ink-muted">{a.pdfText}</span>
            </span>
          </div>
          <button
            type="button"
            onClick={onDownload}
            className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-navy px-5 text-[15px] font-semibold text-white transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
          >
            <Download size={18} strokeWidth={1.75} className="text-green" aria-hidden="true" />
            {a.pdfButton}
          </button>
        </div>
      )}
      <div className="mt-6">
        <Why title={a.whyTitle}>{a.whyText}</Why>
      </div>
      <div className="mt-6 grid gap-3 rounded-[18px] bg-navy-soft p-4 sm:p-5">
        <p className="text-[15px] font-semibold text-navy">{a.doubts}</p>
        <div className="flex flex-wrap gap-2">
          <a
            href={CONTACT.phoneHref}
            className="inline-flex h-12 items-center gap-2 rounded-full bg-navy px-5 text-[15px] font-semibold text-white transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
          >
            <Phone size={18} strokeWidth={1.75} className="text-green" aria-hidden="true" />
            {CONTACT.phone}
          </a>
          <a
            href={smsHref(lang)}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-navy/20 bg-white px-5 text-[15px] font-semibold text-navy transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
          >
            <MessageSquare size={18} strokeWidth={1.75} aria-hidden="true" />
            {a.sms}
          </a>
          <a
            href={`mailto:${CONTACT.email}`}
            className="inline-flex h-12 items-center gap-2 rounded-full border border-navy/20 bg-white px-5 text-[15px] font-semibold text-navy transition-transform active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
          >
            <Mail size={18} strokeWidth={1.75} aria-hidden="true" />
            {a.email}
          </a>
        </div>
      </div>
    </>
  );
}
