import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";
import type { Lang } from "../../lib/i18n";
import { ENROLL_COPY } from "./copy";
import { CONTACT, type DocKey, type FormData } from "./data";

/**
 * Copia en PDF que descarga el cliente al terminar la inscripción.
 * El número de Seguro Social va oculto (solo los últimos 4 dígitos) y sin las
 * fotos de los documentos: es su comprobante de lo que envió y firmó.
 */

const NAVY = rgb(11 / 255, 30 / 255, 61 / 255);
const GREEN = rgb(140 / 255, 210 / 255, 35 / 255);
const MUTED = rgb(80 / 255, 98 / 255, 130 / 255);
const LINE = rgb(0.87, 0.9, 0.94);
const WHITE = rgb(1, 1, 1);

const PAGE_W = 612; // Carta (EE. UU.)
const PAGE_H = 792;
const M = 54;
const BOTTOM = 70;

/** Escritor sencillo de PDF: títulos, filas etiqueta/valor y párrafos con salto de línea. */
class Writer {
  page: PDFPage;
  y = PAGE_H - M;
  private charset: Set<number>;

  constructor(
    private doc: PDFDocument,
    private font: PDFFont,
    private bold: PDFFont,
  ) {
    this.page = doc.addPage([PAGE_W, PAGE_H]);
    this.charset = new Set(font.getCharacterSet());
  }

  /** Reemplaza caracteres que la fuente estándar no puede dibujar. */
  clean(text: string) {
    return Array.from(text.normalize("NFC").replace(/[\u00A0\u2007\u2009\u202F]/g, " "))
      .map((ch) => (this.charset.has(ch.codePointAt(0) ?? 0) ? ch : "?"))
      .join("");
  }

  wrap(text: string, font: PDFFont, size: number, maxW: number): string[] {
    const lines: string[] = [];
    for (const raw of text.split("\n")) {
      const para = this.clean(raw);
      let line = "";
      for (const word of para.split(/\s+/)) {
        const next = line ? `${line} ${word}` : word;
        if (font.widthOfTextAtSize(next, size) <= maxW) {
          line = next;
          continue;
        }
        if (line) lines.push(line);
        // Palabras muy largas (correos, nombres de archivo): se cortan por letras.
        let rest = word;
        while (font.widthOfTextAtSize(rest, size) > maxW) {
          let cut = rest.length;
          while (cut > 1 && font.widthOfTextAtSize(rest.slice(0, cut), size) > maxW) cut--;
          lines.push(rest.slice(0, cut));
          rest = rest.slice(cut);
        }
        line = rest;
      }
      lines.push(line);
    }
    return lines;
  }

  ensure(h: number) {
    if (this.y - h < BOTTOM) {
      this.page = this.doc.addPage([PAGE_W, PAGE_H]);
      this.y = PAGE_H - M;
    }
  }

  heading(text: string) {
    this.ensure(48);
    this.y -= 14;
    this.page.drawText(this.clean(text), {
      x: M,
      y: this.y,
      size: 13,
      font: this.bold,
      color: NAVY,
    });
    this.y -= 8;
    this.page.drawRectangle({ x: M, y: this.y, width: 36, height: 2.5, color: GREEN });
    this.y -= 14;
  }

  field(label: string, value: string) {
    const labelW = 178;
    const size = 10.5;
    const lh = 14;
    const lines = this.wrap(value || "-", this.font, size, PAGE_W - M * 2 - labelW);
    const labelLines = this.wrap(label, this.bold, 9.5, labelW - 12);
    const h = Math.max(lines.length, labelLines.length) * lh + 8;
    this.ensure(h);
    labelLines.forEach((l, i) =>
      this.page.drawText(l, {
        x: M,
        y: this.y - 10 - i * lh,
        size: 9.5,
        font: this.bold,
        color: MUTED,
      }),
    );
    lines.forEach((l, i) =>
      this.page.drawText(l, {
        x: M + labelW,
        y: this.y - 10 - i * lh,
        size,
        font: this.font,
        color: NAVY,
      }),
    );
    this.y -= h;
    this.page.drawLine({
      start: { x: M, y: this.y + 3 },
      end: { x: PAGE_W - M, y: this.y + 3 },
      thickness: 0.5,
      color: LINE,
    });
  }

  paragraph(text: string, size = 10.5, color = NAVY) {
    const lh = size * 1.45;
    for (const l of this.wrap(text, this.font, size, PAGE_W - M * 2)) {
      this.ensure(lh);
      this.page.drawText(l, { x: M, y: this.y - size, size, font: this.font, color });
      this.y -= lh;
    }
    this.y -= 4;
  }
}

async function loadLogo(doc: PDFDocument) {
  try {
    const res = await fetch("/novacore-icon.png");
    if (!res.ok) return null;
    return await doc.embedPng(new Uint8Array(await res.arrayBuffer()));
  } catch {
    return null;
  }
}

export async function buildClientPdf(
  d: FormData,
  lang: Lang,
  meta: { intakeId: string; signedAt: Date },
): Promise<Uint8Array> {
  const t = ENROLL_COPY[lang];
  const p = t.pdf;
  const doc = await PDFDocument.create();
  doc.setTitle(`${p.title} · NovaCore Credit`);
  doc.setAuthor("NovaCore Credit");
  doc.setLanguage(lang === "es" ? "es-US" : "en-US");
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const logo = await loadLogo(doc);
  const w = new Writer(doc, font, bold);

  const fmtDate = new Intl.DateTimeFormat(t.dateLocale, {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const fmtDateTime = new Intl.DateTimeFormat(t.dateLocale, {
    dateStyle: "long",
    timeStyle: "short",
  });

  // Encabezado: franja azul con el isotipo
  const bandH = 96;
  w.page.drawRectangle({ x: 0, y: PAGE_H - bandH, width: PAGE_W, height: bandH, color: NAVY });
  if (logo) w.page.drawImage(logo, { x: M, y: PAGE_H - bandH + 22, width: 52, height: 52 });
  w.page.drawText("NovaCore Credit", {
    x: M + 66,
    y: PAGE_H - 50,
    size: 18,
    font: bold,
    color: WHITE,
  });
  w.page.drawText(w.clean(p.title), { x: M + 66, y: PAGE_H - 70, size: 11, font, color: GREEN });
  w.y = PAGE_H - bandH - 26;

  w.paragraph(p.intro, 10.5, MUTED);
  w.field(p.date, fmtDate.format(meta.signedAt));
  w.field(p.id, meta.intakeId);

  w.heading(p.personal);
  const name = [d.firstName, d.middleName, d.lastName]
    .map((s) => s.trim())
    .filter(Boolean)
    .join(" ");
  const dob = new Date(Number(d.dobYear), Number(d.dobMonth) - 1, Number(d.dobDay));
  const address = [
    `${d.street}${d.unit ? `, ${d.unit}` : ""}`,
    `${d.city}, ${d.state} ${d.zip}`,
  ].join("\n");
  w.field(p.name, name);
  w.field(p.dob, Number.isNaN(dob.getTime()) ? "" : fmtDate.format(dob));
  w.field(p.phone, d.phone);
  w.field(p.email, d.email);
  w.field(p.address, address);
  w.field(p.ssn, `***-**-${d.ssn.replace(/\D/g, "").slice(-4)}`);
  w.field(p.goals, d.goals.length ? d.goals.map((g) => t.identity.goals[g]).join(", ") : p.none);

  w.heading(p.documents);
  for (const key of ["license", "ssnCard", "proofAddress"] as DocKey[]) {
    w.field(t.documents.items[key].title, d[key]?.name ?? "-");
  }

  w.heading(p.agreement);
  w.field(p.rights, d.rightsRead ? p.yes : "-");
  w.field(p.terms, d.termsAccepted ? p.yes : "-");
  w.field(p.signature, d.signature);
  w.field(p.signedAt, fmtDateTime.format(meta.signedAt));

  w.heading(p.cancelTitle);
  w.paragraph(p.cancelText);

  w.heading(p.termsTitle);
  w.paragraph(p.termsText, 10.5, MUTED);

  w.heading(p.contact);
  w.paragraph(
    `${t.about.phone} (${p.phoneNote}): ${CONTACT.phone}\n${t.done.email}: ${CONTACT.email}`,
  );
  w.paragraph(t.shell.disclaimer, 9, MUTED);

  // Pie de página con número de página
  const pages = doc.getPages();
  pages.forEach((pg, i) => {
    pg.drawLine({
      start: { x: M, y: 46 },
      end: { x: PAGE_W - M, y: 46 },
      thickness: 0.5,
      color: LINE,
    });
    pg.drawText(`NovaCore Credit  |  ${CONTACT.phone}  |  ${CONTACT.email}`, {
      x: M,
      y: 32,
      size: 8.5,
      font,
      color: MUTED,
    });
    const label = `${p.page} ${i + 1} / ${pages.length}`;
    pg.drawText(label, {
      x: PAGE_W - M - font.widthOfTextAtSize(label, 8.5),
      y: 32,
      size: 8.5,
      font,
      color: MUTED,
    });
  });

  return doc.save();
}

/** Genera la copia y la descarga en el dispositivo del cliente. */
export async function downloadClientPdf(
  d: FormData,
  lang: Lang,
  meta: { intakeId: string; signedAt: Date },
) {
  const bytes = await buildClientPdf(d, lang, meta);
  const blob = new Blob([bytes as BlobPart], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = ENROLL_COPY[lang].pdf.fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
}
