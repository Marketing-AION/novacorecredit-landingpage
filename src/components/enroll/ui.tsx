import { useState, type ComponentPropsWithoutRef, type ReactNode } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  ChevronDown,
  CircleAlert,
  Eye,
  EyeOff,
  FileText,
  LoaderCircle,
  Lock,
  Trash2,
} from "lucide-react";
import { useEnrollCopy } from "./copy";
import { MAX_DOC_MB, type DocFile } from "./data";
import { docFileError, formatSize } from "./logic";

const cx = (...c: (string | false | undefined | null)[]) => c.filter(Boolean).join(" ");

const control =
  "h-[54px] w-full rounded-[14px] border border-line bg-white px-4 text-[17px] text-navy outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-ink-muted focus:border-navy focus:shadow-[0_0_0_4px_oklch(0.788_0.203_130.3_/_0.32)] aria-[invalid=true]:border-danger aria-[invalid=true]:focus:shadow-[0_0_0_4px_oklch(0.5_0.182_29.5_/_0.18)]";

export function Field({
  id,
  label,
  hint,
  error,
  optional,
  children,
  className,
}: {
  id: string;
  label: string;
  hint?: ReactNode | undefined;
  error?: string | undefined;
  optional?: boolean | undefined;
  children: ReactNode;
  className?: string | undefined;
}) {
  const t = useEnrollCopy();
  return (
    <div className={cx("grid content-start gap-2", className)}>
      <label htmlFor={id} className="text-[15px] font-semibold leading-snug text-navy">
        {label}
        {optional && <span className="ml-1.5 font-normal text-ink-muted">{t.ui.optional}</span>}
      </label>
      {children}
      {error ? (
        <FieldError id={`${id}-error`} message={error} />
      ) : hint ? (
        <p id={`${id}-hint`} className="text-[14px] leading-snug text-ink-muted">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function FieldError({ id, message }: { id: string; message: string }) {
  return (
    <p
      id={id}
      className="flex items-start gap-1.5 text-[14px] font-medium leading-snug text-danger"
    >
      <CircleAlert size={16} strokeWidth={2} className="mt-px shrink-0" aria-hidden="true" />
      {message}
    </p>
  );
}

type InputProps = Omit<ComponentPropsWithoutRef<"input">, "onChange"> & {
  id: string;
  error?: string | undefined;
  hasHint?: boolean | undefined;
  onValue: (v: string) => void;
};

export function TextInput({ id, error, hasHint, onValue, className, ...rest }: InputProps) {
  return (
    <input
      id={id}
      name={id}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : hasHint ? `${id}-hint` : undefined}
      onChange={(e) => onValue(e.target.value)}
      className={cx(control, className)}
      {...rest}
    />
  );
}

export function SecretInput({ id, error, hasHint, onValue, ...rest }: InputProps) {
  const t = useEnrollCopy();
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id}
        name={id}
        type={show ? "text" : "password"}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : hasHint ? `${id}-hint` : undefined}
        onChange={(e) => onValue(e.target.value)}
        className={cx(control, "pr-14 font-display tracking-[0.12em]")}
        {...rest}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? t.ui.hideNumber : t.ui.showNumber}
        aria-pressed={show}
        className="absolute right-1.5 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-[10px] text-ink-muted transition-colors hover:bg-navy-soft hover:text-navy focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-green"
      >
        {show ? <EyeOff size={20} strokeWidth={1.75} /> : <Eye size={20} strokeWidth={1.75} />}
      </button>
    </div>
  );
}

export function SelectInput({
  id,
  error,
  value,
  onValue,
  placeholder,
  options,
  autoComplete,
  ariaLabel,
}: {
  id: string;
  error?: string | undefined;
  value: string;
  onValue: (v: string) => void;
  placeholder: string;
  options: [string, string][];
  autoComplete?: string | undefined;
  ariaLabel?: string | undefined;
}) {
  return (
    <div className="relative">
      <select
        id={id}
        name={id}
        value={value}
        autoComplete={autoComplete}
        aria-label={ariaLabel}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onValue(e.target.value)}
        className={cx(
          control.replace("text-navy", ""),
          "appearance-none pr-11",
          value ? "text-navy" : "text-ink-muted",
        )}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map(([v, l]) => (
          <option key={v} value={v} className="text-navy">
            {l}
          </option>
        ))}
      </select>
      <ChevronDown
        size={20}
        strokeWidth={1.75}
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-ink-muted"
      />
    </div>
  );
}

export function Segmented<T extends string>({
  id,
  value,
  onValue,
  options,
  error,
}: {
  id: string;
  value: T | "";
  onValue: (v: T) => void;
  options: [T, string][];
  error?: string | undefined;
}) {
  return (
    <div
      id={id}
      role="radiogroup"
      tabIndex={-1}
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
      className="grid grid-cols-2 gap-2 outline-none"
    >
      {options.map(([v, l]) => {
        const on = value === v;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onValue(v)}
            className={cx(
              "flex h-[54px] items-center justify-center gap-2 rounded-[14px] border text-[17px] font-semibold transition-[background-color,border-color,color] duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green",
              on
                ? "border-navy bg-navy text-white"
                : "border-line bg-white text-navy hover:border-navy/40",
              error && !on && "border-danger",
            )}
          >
            {on && <Check size={18} strokeWidth={2.5} className="text-green" aria-hidden="true" />}
            {l}
          </button>
        );
      })}
    </div>
  );
}

export function CheckRow({
  id,
  checked,
  onValue,
  error,
  children,
}: {
  id: string;
  checked: boolean;
  onValue: (v: boolean) => void;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <label
        htmlFor={id}
        className={cx(
          "flex cursor-pointer items-start gap-3.5 rounded-[14px] border p-4 transition-colors duration-200",
          checked ? "border-navy/25 bg-navy-soft" : "border-line bg-white hover:border-navy/30",
          error && !checked && "border-danger",
        )}
      >
        <input
          id={id}
          name={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onValue(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className={cx(
            "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-[7px] border-2 transition-colors duration-200 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-green",
            checked ? "border-navy bg-navy text-green" : "border-navy/35 bg-white",
          )}
        >
          {checked && <Check size={15} strokeWidth={3} />}
        </span>
        <span className="text-[16px] leading-snug text-navy">{children}</span>
      </label>
      {error && <FieldError id={`${id}-error`} message={error} />}
    </div>
  );
}

/** Botón principal verde (también lo usan los enlaces de la landing). */
export const primaryCx =
  "group inline-flex h-14 min-w-0 disabled:cursor-progress disabled:opacity-80 items-center justify-between gap-3 rounded-full bg-green pl-6 pr-2 text-[16px] font-bold sm:gap-4 sm:pl-7 sm:text-[17px] text-navy shadow-[0_10px_24px_-12px_oklch(0.5_0.142_135.3_/_0.9)] transition-[transform,background-color] duration-300 [transition-timing-function:var(--ease-out)] hover:bg-[oklch(0.82_0.2_130)] active:scale-[0.98] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-navy";

/** Círculo del ícono dentro del botón principal. */
export const primaryIconCx =
  "grid h-10 w-10 shrink-0 place-items-center rounded-full bg-navy text-green transition-transform duration-300 [transition-timing-function:var(--ease-out)] group-hover:translate-x-0.5";

export function PrimaryButton({
  children,
  onClick,
  icon = <ArrowRight size={18} strokeWidth={2} />,
  type = "button",
  className,
  loading,
}: {
  children: ReactNode;
  onClick?: (() => void) | undefined;
  icon?: ReactNode | undefined;
  type?: "button" | "submit" | undefined;
  className?: string | undefined;
  loading?: boolean | undefined;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={loading}
      aria-busy={loading || undefined}
      className={cx(primaryCx, className)}
    >
      <span className="whitespace-nowrap">{children}</span>
      <span className={primaryIconCx}>
        {loading ? <LoaderCircle size={18} strokeWidth={2} className="animate-spin" /> : icon}
      </span>
    </button>
  );
}

export function BackButton({ onClick }: { onClick: () => void }) {
  const t = useEnrollCopy();
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-14 w-14 shrink-0 items-center justify-center gap-2 rounded-full border border-line text-[16px] font-semibold text-navy transition-colors hover:bg-navy-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green sm:w-auto sm:border-0 sm:px-4"
    >
      <ArrowLeft size={18} strokeWidth={2} aria-hidden="true" />
      <span className="sr-only sm:not-sr-only">{t.ui.back}</span>
    </button>
  );
}

export function Why({ title, children }: { title?: string | undefined; children: ReactNode }) {
  const t = useEnrollCopy();
  return (
    <details className="group rounded-[14px] bg-navy-soft open:pb-4">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 rounded-[14px] px-4 py-3.5 text-[15px] font-semibold text-navy focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green [&::-webkit-details-marker]:hidden">
        {title ?? t.ui.why}
        <ChevronDown
          size={18}
          strokeWidth={2}
          aria-hidden="true"
          className="shrink-0 transition-transform duration-300 group-open:rotate-180"
        />
      </summary>
      <div className="px-4 text-[15px] leading-relaxed text-navy/85">{children}</div>
    </details>
  );
}

export function SecureNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-2 text-[14px] text-ink-muted">
      <Lock size={15} strokeWidth={2} className="shrink-0 text-green-ink" aria-hidden="true" />
      {children}
    </p>
  );
}

export function DocUpload({
  id,
  title,
  hint,
  icon,
  value,
  onFile,
  onClear,
  error,
}: {
  id: string;
  title: string;
  hint: string;
  icon: ReactNode;
  value: DocFile | null;
  onFile: (f: File) => void;
  onClear: () => void;
  error?: string | undefined;
}) {
  const t = useEnrollCopy();
  const [localError, setLocalError] = useState<string | undefined>();
  const shown = localError ?? error;
  return (
    <div className="grid gap-2">
      <input
        id={id}
        name={id}
        type="file"
        accept="image/*,application/pdf"
        aria-invalid={shown ? true : undefined}
        aria-describedby={shown ? `${id}-error` : `${id}-hint`}
        className="peer sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (!f) return;
          const err = docFileError(f, MAX_DOC_MB, t.errors);
          setLocalError(err);
          if (!err) onFile(f);
        }}
      />
      {value ? (
        <div className="flex items-center gap-3.5 rounded-[16px] border border-navy/15 bg-navy-soft p-3 pr-2 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-green">
          {value.previewUrl ? (
            <img
              src={value.previewUrl}
              alt=""
              className="h-14 w-14 shrink-0 rounded-[10px] object-cover"
            />
          ) : (
            <span
              className="grid h-14 w-14 shrink-0 place-items-center rounded-[10px] bg-white text-navy"
              aria-hidden="true"
            >
              <FileText size={22} strokeWidth={1.75} />
            </span>
          )}
          <span className="grid min-w-0 flex-1 gap-0.5">
            <span className="flex items-start gap-1.5 text-[15px] font-semibold leading-snug text-navy">
              <span
                className="mt-0.5 grid h-4.5 w-4.5 shrink-0 place-items-center rounded-full bg-green text-navy"
                aria-hidden="true"
              >
                <Check size={11} strokeWidth={3.5} />
              </span>
              {title}
            </span>
            <span id={`${id}-hint`} className="truncate text-[14px] text-ink-muted">
              {value.name} · {formatSize(value.size)}
            </span>
            <label
              htmlFor={id}
              className="w-fit cursor-pointer text-[14px] font-semibold text-green-ink underline underline-offset-4"
            >
              {t.ui.changeFile}
            </label>
          </span>
          <button
            type="button"
            onClick={onClear}
            aria-label={t.ui.remove(title)}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full text-ink-muted transition-colors hover:bg-white hover:text-danger focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
          >
            <Trash2 size={18} strokeWidth={1.75} />
          </button>
        </div>
      ) : (
        <label
          htmlFor={id}
          className={cx(
            "flex cursor-pointer items-center gap-3.5 rounded-[16px] border-2 border-dashed bg-white p-4 transition-colors duration-200 hover:border-navy/35 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-green",
            shown ? "border-danger" : "border-line",
          )}
        >
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-navy-soft text-navy"
            aria-hidden="true"
          >
            {icon}
          </span>
          <span className="grid min-w-0 flex-1">
            <span className="text-[16px] font-semibold leading-snug text-navy">{title}</span>
            <span id={`${id}-hint`} className="text-[14px] leading-snug text-ink-muted">
              {hint}
            </span>
          </span>
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center gap-1.5 rounded-full bg-navy text-[14px] font-semibold text-white sm:h-10 sm:w-auto sm:px-4">
            <Camera size={18} strokeWidth={1.75} className="text-green" aria-hidden="true" />
            <span className="sr-only sm:not-sr-only">{t.ui.upload}</span>
          </span>
        </label>
      )}
      {shown && <FieldError id={`${id}-error`} message={shown} />}
    </div>
  );
}

export { cx };
