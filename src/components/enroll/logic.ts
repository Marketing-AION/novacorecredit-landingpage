import type { EnrollCopy } from "./copy";
import type { FieldKey, FormData, ScreenId } from "./data";

/* ---------- Formatos mientras se escribe ---------- */

export const digits = (v: string) => v.replace(/\D/g, "");

export function formatPhone(v: string) {
  const d = digits(v).slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export function formatSSN(v: string) {
  const d = digits(v).slice(0, 9);
  if (d.length < 4) return d;
  if (d.length < 6) return `${d.slice(0, 3)}-${d.slice(3)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 5)}-${d.slice(5)}`;
}

export function formatCard(v: string) {
  return digits(v)
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatExp(v: string) {
  const d = digits(v).slice(0, 4);
  return d.length < 3 ? d : `${d.slice(0, 2)}/${d.slice(2)}`;
}

export const formatZip = (v: string) => digits(v).slice(0, 5);
export const formatDay = (v: string) => digits(v).slice(0, 2);
export const formatYear = (v: string) => digits(v).slice(0, 4);
export const formatCvc = (v: string) => digits(v).slice(0, 4);

/* ---------- Validaciones por pantalla ---------- */

export type Errors = Partial<Record<FieldKey | "dob", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function luhn(num: string) {
  let sum = 0;
  let dbl = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let n = Number(num[i]);
    if (dbl) {
      n *= 2;
      if (n > 9) n -= 9;
    }
    sum += n;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

type Msg = EnrollCopy["errors"];

function dobError(d: FormData, m: Msg): string | undefined {
  const day = Number(d.dobDay);
  const month = Number(d.dobMonth);
  const year = Number(d.dobYear);
  if (!d.dobDay || !d.dobMonth || !d.dobYear) return m.dobMissing;
  const now = new Date();
  if (year < 1900 || year > now.getFullYear()) return m.dobYear;
  const date = new Date(year, month - 1, day);
  if (date.getMonth() !== month - 1 || date.getDate() !== day) return m.dobDayMonth;
  const adult = new Date(year + 18, month - 1, day);
  if (adult > now) return m.dobAdult;
  return undefined;
}

export function validate(screen: ScreenId, d: FormData, m: Msg): Errors {
  const e: Errors = {};
  if (screen === "about") {
    if (!d.firstName.trim()) e.firstName = m.firstName;
    if (!d.lastName.trim()) e.lastName = m.lastName;
    const dob = dobError(d, m);
    if (dob) e.dob = dob;
    if (digits(d.phone).length !== 10) e.phone = m.phone;
    if (!EMAIL.test(d.email.trim())) e.email = m.email;
  }
  if (screen === "address") {
    if (!d.street.trim()) e.street = m.street;
    if (!d.city.trim()) e.city = m.city;
    if (!d.state) e.state = m.state;
    if (d.zip.length !== 5) e.zip = m.zip;
  }
  if (screen === "identity") {
    if (digits(d.ssn).length !== 9) e.ssn = m.ssn;
  }
  if (screen === "documents") {
    if (!d.license) e.license = m.license;
    if (!d.ssnCard) e.ssnCard = m.ssnCard;
    if (!d.proofAddress) e.proofAddress = m.proofAddress;
  }
  if (screen === "agreement") {
    if (!d.rightsRead) e.rightsRead = m.check;
    if (!d.termsAccepted) e.termsAccepted = m.check;
    if (d.signature.trim().split(/\s+/).length < 2) e.signature = m.signature;
  }
  if (screen === "payment") {
    if (!d.cardName.trim()) e.cardName = m.cardName;
    const card = digits(d.cardNumber);
    if (card.length !== 16 || !luhn(card)) e.cardNumber = m.cardNumber;
    const [mm, yy] = d.cardExp.split("/");
    const month = Number(mm);
    const y = 2000 + Number(yy);
    const now = new Date();
    const expired =
      y < now.getFullYear() || (y === now.getFullYear() && month < now.getMonth() + 1);
    if (!mm || !yy || yy.length !== 2 || month < 1 || month > 12 || expired) e.cardExp = m.cardExp;
    if (d.cardCvc.length < 3) e.cardCvc = m.cardCvc;
    if (d.cardZip.length !== 5) e.cardZip = m.cardZip;
  }
  return e;
}

/** Revisa un documento antes de aceptarlo. Devuelve el error o undefined. */
export function docFileError(file: File, maxMb: number, m: Msg): string | undefined {
  const okType = file.type.startsWith("image/") || file.type === "application/pdf";
  if (!okType) return m.fileType;
  if (file.size > maxMb * 1024 * 1024) return m.fileSize(maxMb);
  return undefined;
}

export function formatSize(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

/** Orden de enfoque para el primer error de cada pantalla. */
export const FOCUS_ORDER: (FieldKey | "dob")[] = [
  "firstName",
  "lastName",
  "dob",
  "phone",
  "email",
  "street",
  "city",
  "state",
  "zip",
  "ssn",
  "license",
  "ssnCard",
  "proofAddress",
  "rightsRead",
  "termsAccepted",
  "signature",
  "cardName",
  "cardNumber",
  "cardExp",
  "cardCvc",
  "cardZip",
];
