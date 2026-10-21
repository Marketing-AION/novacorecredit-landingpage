import { CONTACT } from "../enroll/data";
import { useLang, type Lang } from "../../lib/i18n";

/**
 * Textos de la landing en español (principal, público hispano) e inglés.
 * Español aprobado en contenido/01-Landing-Textos-e-Imagenes.md.
 * Lineamientos de NovaCore (en ambos idiomas): nunca prometer eliminación,
 * puntos ni plazos; tono directo ("tu casa", "your home").
 */

/* ---------- Fotos ----------
 * Mientras src sea null, la página muestra el espacio marcado con su número.
 */
export type PhotoSlot = "casa" | "auto" | "negocio" | "video";

export const PHOTOS: Record<
  PhotoSlot,
  { n: number; ratio: string; file: string; src: string | null }
> = {
  casa: {
    n: 2,
    ratio: "4:3",
    file: "puerta-casa-foto.webp",
    src: "/landing/puerta-casa-foto.webp",
  },
  auto: {
    n: 3,
    ratio: "4:3",
    file: "puerta-auto-foto.webp",
    src: "/landing/puerta-auto-foto.webp",
  },
  negocio: {
    n: 4,
    ratio: "4:3",
    file: "puerta-negocio-foto.webp",
    src: "/landing/puerta-negocio-foto.webp",
  },
  video: { n: 6, ratio: "16:9", file: "video-portada.webp", src: null },
};

/** Fondo del inicio: ciudad con la flecha verde que sube (enviada por AION). */
export const HERO_BG = "/landing/hero-ciudad-hd.webp";

/** Fondo del llamado final: el isotipo en 3D (enviado por AION). */
export const CLOSING_BG = "/landing/cierre-fondo-hd.webp";

/** Video de 2 minutos (Guion 1). Cuando esté listo: URL del archivo .mp4. */
export const VIDEO_SRC: string | null = null;

export type DoorKey =
  "casa" | "auto" | "renta" | "tarjetas" | "financiamiento" | "negocio" | "condiciones";

export const DOOR_ORDER: { key: DoorKey; photo?: PhotoSlot }[] = [
  { key: "casa", photo: "casa" },
  { key: "auto", photo: "auto" },
  { key: "negocio", photo: "negocio" },
  { key: "renta" },
  { key: "tarjetas" },
  { key: "financiamiento" },
  { key: "condiciones" },
];

/** Mensaje de texto (SMS) con un mensaje inicial para que NovaCore sepa de dónde viene. */
export const smsHref = (lang: Lang) =>
  `${CONTACT.smsHref}?&body=${encodeURIComponent(COPY[lang].smsText)}`;

/* ---------- Español ---------- */

const ES = {
  meta: {
    title: "NovaCore Credit · Reparación de crédito en español",
    description:
      "Revisamos tu reporte de crédito, disputamos los elementos negativos que correspondan y te acompañamos en cada paso, en español.",
    ogTitle: "NovaCore Credit · Tu crédito abre puertas",
    ogDescription: "Reparación de crédito en español. Empieza tu inscripción desde tu celular.",
  },
  cta: "Empieza tu inscripción",
  call: "Llámanos al",
  text: "Envíanos un mensaje de texto",
  textShort: "Mensaje de texto",
  schedule: "Agenda una llamada gratis",
  smsText: "Hola, vengo de la página de NovaCore Credit y tengo una pregunta.",
  nav: {
    items: {
      inicio: "Inicio",
      proceso: "Cómo funciona",
      preguntas: "Preguntas frecuentes",
      contacto: "Contacto",
    },
    short: {
      inicio: "Inicio",
      proceso: "Cómo funciona",
      preguntas: "Preguntas",
      contacto: "Contacto",
    },
    main: "Principal",
    sections: "Secciones",
    skip: "Ir al contenido",
    home: "NovaCore Credit, inicio",
    language: "Idioma",
  },
  hero: {
    eyebrow: "Reparación de crédito",
    line1: "Tu crédito",
    line2: "abre puertas",
    kicker: "empieza hoy.",
    body: "Revisamos tu reporte, disputamos los elementos negativos que correspondan y te acompañamos en cada paso, en español.",
    corner: ["Claridad antes", "que promesas."],
    points: [
      { title: "Revisión", text: "de tu reporte" },
      { title: "Disputas", text: "con los burós" },
      { title: "Monitoreo", text: "de tu crédito" },
      { title: "Atención", text: "en español" },
    ],
  },
  video: {
    title: "Mira cómo funciona",
    text: "Un video corto sobre cómo revisamos y disputamos tu reporte de crédito.",
    soon: "Video disponible pronto",
  },
  photo: { word: "Foto", slot: "Espacio para la foto" },
  doors: {
    title: "Un crédito más sano puede abrirte puertas",
    text: "No se trata solo de un número. Se trata de lo que quieres lograr.",
    items: {
      casa: {
        title: "Comprar tu casa",
        text: "Tu hogar puede estar más cerca de lo que imaginas.",
        alt: "Pareja abrazada frente a una casa moderna al atardecer",
      },
      auto: {
        title: "Financiar tu auto",
        text: "Prepárate para dar el siguiente paso hacia tu próximo auto.",
        alt: "Auto azul estacionado en una avenida de la ciudad al atardecer",
      },
      negocio: {
        title: "Impulsar tu negocio",
        text: "Dale a tus metas la oportunidad de crecer.",
        alt: "Hombre pensando frente a su computadora en su oficina",
      },
      renta: { title: "Rentar tu apartamento", text: "", alt: "" },
      tarjetas: { title: "Solicitar tus tarjetas de crédito", text: "", alt: "" },
      financiamiento: { title: "Acceder al financiamiento que necesitas", text: "", alt: "" },
      condiciones: { title: "Obtener mejores condiciones para ti", text: "", alt: "" },
    } as Record<DoorKey, { title: string; text: string; alt: string }>,
  },
  why: {
    statMid: "de cada",
    title: "Tu reporte de crédito puede tener errores",
    body: "Un estudio de la Comisión Federal de Comercio (FTC) encontró que 1 de cada 5 consumidores tenía un error en al menos uno de sus tres reportes de crédito. Mientras nadie lo revise, puede seguir afectando tu perfil.",
    source: "Fuente: FTC, estudio de 2013 sobre la exactitud de los reportes de crédito.",
  },
  process: {
    title: "Un proceso claro, paso a paso",
    intro:
      "Así acompañamos tu caso, desde la primera revisión de tu reporte hasta la orientación final.",
    stepLabel: "Paso",
    steps: [
      { title: "Evaluamos", text: "Revisamos tu reporte de crédito en detalle." },
      {
        title: "Identificamos",
        text: "Ubicamos las cuentas y elementos negativos que afectan tu perfil.",
      },
      { title: "Analizamos", text: "Determinamos cuáles se pueden disputar." },
      {
        title: "Disputamos",
        text: "Preparamos y gestionamos las disputas con los burós y las entidades correspondientes.",
      },
      {
        title: "Damos seguimiento",
        text: "Trabajamos para lograr la corrección o eliminación de lo que corresponda.",
      },
      {
        title: "Te orientamos",
        text: "Te ayudamos a mantener un perfil crediticio más saludable.",
      },
    ],
  },
  commit: {
    title: "Nuestro compromiso contigo",
    sub: "Tres principios que guían el trabajo con cada cliente.",
    items: [
      {
        icon: "idioma",
        title: "En español, de principio a fin",
        text: "Te explicamos todo en tu idioma y sin términos complicados.",
      },
      {
        icon: "claridad",
        title: "Claridad antes que promesas",
        text: "No prometemos puntos ni resultados garantizados. Te decimos qué se puede disputar y por qué.",
      },
      {
        icon: "datos",
        title: "Tus datos, protegidos",
        text: "Tu información viaja cifrada y se guarda de forma privada. Tu número de Seguro Social se almacena cifrado.",
      },
    ] as { icon: "idioma" | "claridad" | "datos"; title: string; text: string }[],
  },
  start: {
    title: "Empieza hoy, desde tu celular",
    sub: "La inscripción toma pocos minutos.",
    steps: [
      { title: "Tu información", text: "Tus datos básicos y tu número de Seguro Social." },
      {
        title: "Tus documentos",
        text: "Fotos de tu licencia, tu tarjeta del Seguro Social y un comprobante de domicilio.",
      },
      {
        title: "Acuerdo y pago",
        text: "Revisas los términos, firmas y pagas con tarjeta de débito o crédito.",
      },
    ],
    afterLabel: "Después:",
    afterText:
      "confirmamos tu pago, te agregamos a Credit Hero Score y te enviamos tu enlace de bienvenida para activar tu monitoreo de crédito.",
    phones: {
      docs: {
        src: "/landing/app-documentos.webp",
        alt: "Paso 2 del formulario de NovaCore en un celular: subir licencia, tarjeta del Seguro Social y comprobante de domicilio",
      },
      welcome: {
        src: "/landing/app-bienvenida.webp",
        alt: "Inicio del formulario de inscripción de NovaCore en un celular, con los 3 pasos",
      },
    },
  },
  faq: {
    title: "Preguntas frecuentes",
    other: "¿Tienes otra pregunta?",
    pendingLabel: "Pendiente de NovaCore:",
    items: [
      {
        q: "¿Qué es la reparación de crédito?",
        a: "Es el proceso de revisar tu reporte de crédito y disputar la información negativa que pueda tener errores, inconsistencias o que no se pueda verificar.",
      },
      {
        q: "¿Pueden borrar todo lo negativo de mi reporte?",
        a: "No. Disputamos los elementos negativos que correspondan y trabajamos para lograr su corrección o eliminación. La información exacta y vigente no se puede eliminar, y el resultado depende de cada caso.",
      },
      {
        q: "¿Cuánto tiempo toma?",
        a: "Depende de cada perfil y de las respuestas de los burós de crédito. Por ley, los burós tienen en general 30 días para investigar cada disputa, y algunos casos necesitan más de una ronda. No prometemos plazos exactos, pero puedes escribirnos cuando quieras para conocer el avance de tu caso, y con Credit Hero Score también puedes ver los cambios en tus reportes.",
      },
      {
        q: "¿Cuánto cuesta?",
        a: "Te lo explicamos antes de que firmes: el costo aparece en tu contrato y en el resumen de pago, antes de que pagues. Si quieres conocerlo antes de empezar, llámanos o envíanos un mensaje de texto al (210) 517-7078.",
      },
      {
        q: "¿Qué necesito para empezar?",
        a: "Tu número de Seguro Social, fotos de tu licencia de conducir, de tu tarjeta del Seguro Social y de un comprobante de domicilio, y una tarjeta de débito o crédito.",
      },
      {
        q: "¿Qué es Credit Hero Score?",
        a: "Es un servicio de monitoreo de crédito, aparte de NovaCore. Te muestra tus reportes y puntajes de Equifax, Experian y TransUnion. Cuando confirmamos tu pago, te agregamos a Credit Hero Score y te enviamos el enlace de bienvenida para activarlo.",
      },
      {
        q: "¿Puedo cancelar?",
        a: "Sí. Por ley, tienes 3 días hábiles después de firmar para cancelar sin costo ni penalidad.",
      },
      {
        q: "¿Mis datos están seguros?",
        a: "Tu información viaja cifrada y se guarda de forma privada. Tu número de Seguro Social se almacena cifrado y tus documentos quedan en un espacio privado: nadie puede verlos desde la página.",
      },
    ] as { q: string; a?: string; pending?: string }[],
  },
  closing: {
    eyebrow: "Tu próximo paso",
    line1: "Repara lo que hoy te limita.",
    line2: "Tu crédito abre puertas.",
    body: "Te inscribes en pocos minutos desde tu celular y nuestro equipo te acompaña en cada paso, en español.",
    legal: "Por ley, puedes cancelar sin costo dentro de los 3 días hábiles después de firmar.",
  },
  footer: {
    tagline: "Tu crédito abre puertas.",
    privacy: "Privacidad",
    terms: "Términos",
    disclaimer:
      "Los resultados varían según cada perfil. No se garantiza la eliminación de información exacta y vigente ni un aumento específico en el puntaje de crédito.",
  },
};

export type LandingCopy = typeof ES;

/* ---------- English ---------- */

const EN: LandingCopy = {
  meta: {
    title: "NovaCore Credit · Credit repair, step by step",
    description:
      "We review your credit report, dispute the negative items that apply, and guide you every step of the way.",
    ogTitle: "NovaCore Credit · Your credit opens doors",
    ogDescription: "Credit repair in English and Spanish. Start your enrollment from your phone.",
  },
  cta: "Start your enrollment",
  call: "Call us at",
  text: "Send us a text",
  textShort: "Text message",
  schedule: "Book a free call",
  smsText: "Hi, I'm coming from the NovaCore Credit website and I have a question.",
  nav: {
    items: { inicio: "Home", proceso: "How it works", preguntas: "FAQ", contacto: "Contact" },
    short: { inicio: "Home", proceso: "How it works", preguntas: "FAQ", contacto: "Contact" },
    main: "Main",
    sections: "Sections",
    skip: "Skip to content",
    home: "NovaCore Credit, home",
    language: "Language",
  },
  hero: {
    eyebrow: "Credit repair",
    line1: "Your credit",
    line2: "opens doors",
    kicker: "start today.",
    body: "We review your report, dispute the negative items that apply, and guide you every step of the way, in English or Spanish.",
    corner: ["Clarity before", "promises."],
    points: [
      { title: "Credit report", text: "review" },
      { title: "Disputes with", text: "the bureaus" },
      { title: "Credit", text: "monitoring" },
      { title: "Bilingual", text: "support" },
    ],
  },
  video: {
    title: "See how it works",
    text: "A short video on how we review and dispute your credit report.",
    soon: "Video coming soon",
  },
  photo: { word: "Photo", slot: "Space for photo" },
  doors: {
    title: "Healthier credit can open doors for you",
    text: "It's not just about a number. It's about what you want to achieve.",
    items: {
      casa: {
        title: "Buy your home",
        text: "Your home may be closer than you think.",
        alt: "Couple embracing in front of a modern house at sunset",
      },
      auto: {
        title: "Finance your car",
        text: "Get ready to take the next step toward your next car.",
        alt: "Blue car parked on a city avenue at sunset",
      },
      negocio: {
        title: "Grow your business",
        text: "Give your goals the chance to grow.",
        alt: "Man thinking in front of his computer in his office",
      },
      renta: { title: "Rent your apartment", text: "", alt: "" },
      tarjetas: { title: "Apply for your credit cards", text: "", alt: "" },
      financiamiento: { title: "Access the financing you need", text: "", alt: "" },
      condiciones: { title: "Get better terms for you", text: "", alt: "" },
    },
  },
  why: {
    statMid: "in",
    title: "Your credit report may have errors",
    body: "A Federal Trade Commission (FTC) study found that 1 in 5 consumers had an error on at least one of their three credit reports. Until someone reviews it, it can keep affecting your profile.",
    source: "Source: FTC, 2013 study on the accuracy of credit reports.",
  },
  process: {
    title: "A clear process, step by step",
    intro:
      "This is how we guide your case, from the first review of your report to our final guidance.",
    stepLabel: "Step",
    steps: [
      { title: "We evaluate", text: "We review your credit report in detail." },
      {
        title: "We identify",
        text: "We locate the accounts and negative items affecting your profile.",
      },
      { title: "We analyze", text: "We determine which ones can be disputed." },
      {
        title: "We dispute",
        text: "We prepare and manage the disputes with the credit bureaus and the corresponding entities.",
      },
      {
        title: "We follow up",
        text: "We work toward the correction or deletion of the items that apply.",
      },
      { title: "We guide you", text: "We help you maintain a healthier credit profile." },
    ],
  },
  commit: {
    title: "Our commitment to you",
    sub: "Three principles that guide our work with every client.",
    items: [
      {
        icon: "idioma",
        title: "In your language, start to finish",
        text: "We explain everything in English or Spanish, with no complicated terms.",
      },
      {
        icon: "claridad",
        title: "Clarity before promises",
        text: "We don't promise points or guaranteed results. We tell you what can be disputed and why.",
      },
      {
        icon: "datos",
        title: "Your data, protected",
        text: "Your information is encrypted in transit and stored privately. Your Social Security number is stored encrypted.",
      },
    ],
  },
  start: {
    title: "Start today, from your phone",
    sub: "Enrollment takes just a few minutes.",
    steps: [
      { title: "Your information", text: "Your basic details and your Social Security number." },
      {
        title: "Your documents",
        text: "Photos of your driver's license, your Social Security card, and a proof of address.",
      },
      {
        title: "Agreement and payment",
        text: "You review the terms, sign, and pay with a debit or credit card.",
      },
    ],
    afterLabel: "Next:",
    afterText:
      "we confirm your payment, add you to Credit Hero Score, and send you your welcome link to activate your credit monitoring.",
    phones: {
      docs: {
        src: "/landing/app-documents-en.webp",
        alt: "Step 2 of the NovaCore form on a phone: uploading a driver's license, Social Security card, and proof of address",
      },
      welcome: {
        src: "/landing/app-welcome-en.webp",
        alt: "Start of the NovaCore enrollment form on a phone, showing the 3 steps",
      },
    },
  },
  faq: {
    title: "Frequently asked questions",
    other: "Have another question?",
    pendingLabel: "Pending from NovaCore:",
    items: [
      {
        q: "What is credit repair?",
        a: "It's the process of reviewing your credit report and disputing negative information that may have errors, inconsistencies, or that can't be verified.",
      },
      {
        q: "Can you remove everything negative from my report?",
        a: "No. We dispute the negative items that apply and work toward their correction or deletion. Accurate, current information can't be removed, and results depend on each case.",
      },
      {
        q: "How long does it take?",
        a: "It depends on each profile and on the credit bureaus' responses. By law, the bureaus generally have 30 days to investigate each dispute, and some cases need more than one round. We don't promise exact timelines, but you can message us anytime to check on your case, and with Credit Hero Score you can also see changes in your reports.",
      },
      {
        q: "How much does it cost?",
        a: "We explain it before you sign: the cost appears in your contract and in the payment summary before you pay. If you'd like to know it before you start, call or text us at (210) 517-7078.",
      },
      {
        q: "What do I need to get started?",
        a: "Your Social Security number, photos of your driver's license, your Social Security card, and a proof of address, plus a debit or credit card.",
      },
      {
        q: "What is Credit Hero Score?",
        a: "It's a credit monitoring service, separate from NovaCore. It shows your reports and scores from Equifax, Experian, and TransUnion. When we confirm your payment, we add you to Credit Hero Score and send you the welcome link to activate it.",
      },
      {
        q: "Can I cancel?",
        a: "Yes. By law, you have 3 business days after signing to cancel at no cost or penalty.",
      },
      {
        q: "Is my information safe?",
        a: "Your information is encrypted in transit and stored privately. Your Social Security number is stored encrypted, and your documents are kept in a private space: no one can see them from the website.",
      },
    ],
  },
  closing: {
    eyebrow: "Your next step",
    line1: "Repair what's holding you back.",
    line2: "Your credit opens doors.",
    body: "Enroll in just a few minutes from your phone, and our team will guide you every step of the way.",
    legal: "By law, you can cancel at no cost within 3 business days after signing.",
  },
  footer: {
    tagline: "Your credit opens doors.",
    privacy: "Privacy",
    terms: "Terms",
    disclaimer:
      "Results vary by profile. We do not guarantee the removal of accurate, current information or any specific increase in your credit score.",
  },
};

export const COPY: Record<Lang, LandingCopy> = { es: ES, en: EN };

/** Textos de la landing en el idioma actual. */
export const useCopy = () => COPY[useLang()];
