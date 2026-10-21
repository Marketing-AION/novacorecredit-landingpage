import { useLang, type Lang } from "../../lib/i18n";

/**
 * Política de privacidad del sitio (español e inglés). Describe lo que el
 * sitio hace hoy con los datos (formulario, Supabase con SSN cifrado y
 * documentos privados, sin guardar la tarjeta). Si cambia algo (por ejemplo,
 * se agrega el píxel de Meta o el procesador de pagos), hay que actualizarla.
 * Debe revisarla el abogado de NovaCore antes del lanzamiento.
 */

export type PolicySection = {
  title: string;
  paragraphs?: string[];
  list?: string[];
  after?: string[];
};

const ES = {
  meta: {
    title: "Política de privacidad · NovaCore Credit",
    description: "Cómo NovaCore Credit recopila, usa, comparte y protege tu información.",
  },
  back: "Volver al inicio",
  title: "Política de privacidad",
  updated: "Última actualización: 14 de octubre de 2026",
  intro:
    "En NovaCore Credit (“NovaCore”, “nosotros”) respetamos tu privacidad. Esta política explica qué información recopilamos cuando visitas este sitio o te inscribes en nuestros servicios de reparación de crédito, cómo la usamos, con quién la compartimos y cómo la protegemos.",
  sections: [
    {
      title: "1. Información que recopilamos",
      list: [
        "Datos de identificación y contacto: nombre, fecha de nacimiento, teléfono, correo electrónico y dirección.",
        "Tu número de Seguro Social (SSN).",
        "Los documentos que subes: licencia de conducir, tarjeta del Seguro Social y comprobante de domicilio.",
        "Tu firma electrónica y la fecha en que aceptas los términos.",
        "Información opcional, como las metas que eliges (por ejemplo, comprar tu casa o financiar tu auto).",
        "Datos técnicos básicos, como el tipo de navegador y de dispositivo que usas al enviar el formulario.",
        "Los mensajes que nos envías por mensaje de texto, por teléfono o por correo electrónico.",
      ],
      after: [
        "Los datos de tu tarjeta los procesa nuestro procesador de pagos. Este sitio no guarda los datos de tu tarjeta.",
      ],
    },
    {
      title: "2. Cómo usamos tu información",
      list: [
        "Para prestarte el servicio: obtener y revisar tus reportes de crédito, identificar los elementos que se pueden disputar y preparar y enviar las disputas.",
        "Para comprobar tu identidad y tu dirección ante los burós de crédito.",
        "Para comunicarnos contigo sobre tu caso y enviarte el enlace de Credit Hero Score.",
        "Si empiezas tu inscripción y no la terminas, o si nos dejas tus datos en un anuncio, para escribirte por correo sobre cómo completarla. Puedes darte de baja cuando quieras.",
        "Para procesar tus pagos.",
        "Para cumplir con nuestras obligaciones legales y conservar los registros que exige la ley.",
      ],
    },
    {
      title: "3. Con quién compartimos tu información",
      paragraphs: [
        "Solo la compartimos cuando es necesario para prestarte el servicio o para cumplir la ley:",
      ],
      list: [
        "Los burós de crédito (Equifax, Experian y TransUnion) y las entidades que reportan tu información, como parte de las disputas.",
        "Proveedores que nos ayudan a operar, como alojamiento en la nube, procesamiento de pagos y comunicaciones. Solo pueden usar tu información para prestarnos esos servicios.",
        "Las autoridades, cuando la ley lo exija.",
      ],
      after: [
        "No vendemos tu información personal.",
        "Credit Hero Score es un servicio aparte de NovaCore. Cuando lo activas, tu información también se rige por la política de privacidad de ese servicio.",
      ],
    },
    {
      title: "4. Cómo protegemos tu información",
      list: [
        "Tu información viaja cifrada (HTTPS).",
        "Tu número de Seguro Social se guarda cifrado.",
        "Tus documentos se guardan en un espacio privado: no se pueden ver desde el sitio web.",
        "Solo personas autorizadas pueden acceder a tu información.",
      ],
      after: [
        "Ningún sistema es 100 % seguro, pero trabajamos para proteger tu información con medidas razonables de seguridad.",
      ],
    },
    {
      title: "5. Cuánto tiempo la conservamos",
      paragraphs: [
        "Conservamos tu información mientras sea necesaria para prestarte el servicio y durante el tiempo que exija la ley. Después la eliminamos de forma segura.",
      ],
    },
    {
      title: "6. Tus opciones y derechos",
      paragraphs: [
        "Puedes pedirnos acceder a tu información, corregirla o eliminarla (salvo la que debamos conservar por ley), y dejar de recibir mensajes que no sean necesarios para tu caso. Según el estado donde vivas, puedes tener derechos adicionales. Para ejercerlos, escríbenos a los datos de contacto que aparecen abajo.",
      ],
    },
    {
      title: "7. Cookies",
      paragraphs: [
        "Este sitio usa solo las cookies y tecnologías necesarias para funcionar. Si en el futuro usamos herramientas de medición o de publicidad (por ejemplo, para anuncios en redes sociales), lo indicaremos en esta política.",
      ],
    },
    {
      title: "8. Menores de edad",
      paragraphs: [
        "Nuestros servicios son para personas de 18 años o más. No recopilamos a sabiendas información de menores de edad.",
      ],
    },
    {
      title: "9. Cambios a esta política",
      paragraphs: [
        "Podemos actualizar esta política. La fecha de la última actualización aparece al inicio de esta página.",
      ],
    },
  ] as PolicySection[],
  contactTitle: "10. Contacto",
  contactText:
    "Si tienes preguntas sobre esta política o sobre tu información, escríbenos o llámanos:",
  contactLabels: { email: "Correo", phone: "Teléfono", sms: "Mensajes de texto" },
};

export type PrivacyCopy = typeof ES;

const EN: PrivacyCopy = {
  meta: {
    title: "Privacy policy · NovaCore Credit",
    description: "How NovaCore Credit collects, uses, shares, and protects your information.",
  },
  back: "Back to home",
  title: "Privacy policy",
  updated: "Last updated: October 14, 2026",
  intro:
    "At NovaCore Credit (“NovaCore,” “we”), we respect your privacy. This policy explains what information we collect when you visit this site or enroll in our credit repair services, how we use it, who we share it with, and how we protect it.",
  sections: [
    {
      title: "1. Information we collect",
      list: [
        "Identification and contact details: name, date of birth, phone number, email, and address.",
        "Your Social Security number (SSN).",
        "The documents you upload: driver's license, Social Security card, and proof of address.",
        "Your electronic signature and the date you accept the terms.",
        "Optional information, such as the goals you choose (for example, buying your home or financing your car).",
        "Basic technical data, such as the type of browser and device you use when submitting the form.",
        "The messages you send us by text message, phone, or email.",
      ],
      after: [
        "Your card details are handled by our payment processor. This site does not store your card details.",
      ],
    },
    {
      title: "2. How we use your information",
      list: [
        "To provide the service: obtain and review your credit reports, identify the items that can be disputed, and prepare and send the disputes.",
        "To verify your identity and address with the credit bureaus.",
        "To communicate with you about your case and send you your Credit Hero Score link.",
        "If you start your enrollment and don't finish it, or leave us your details through an ad, to email you about how to complete it. You can unsubscribe at any time.",
        "To process your payments.",
        "To comply with our legal obligations and keep the records required by law.",
      ],
    },
    {
      title: "3. Who we share your information with",
      paragraphs: [
        "We only share it when it's necessary to provide the service or to comply with the law:",
      ],
      list: [
        "The credit bureaus (Equifax, Experian, and TransUnion) and the entities that report your information, as part of the disputes.",
        "Providers that help us operate, such as cloud hosting, payment processing, and communications. They may only use your information to provide those services to us.",
        "Authorities, when required by law.",
      ],
      after: [
        "We do not sell your personal information.",
        "Credit Hero Score is a separate service from NovaCore. When you activate it, your information is also governed by that service's privacy policy.",
      ],
    },
    {
      title: "4. How we protect your information",
      list: [
        "Your information is encrypted in transit (HTTPS).",
        "Your Social Security number is stored encrypted.",
        "Your documents are kept in a private space: they can't be viewed from the website.",
        "Only authorized people can access your information.",
      ],
      after: [
        "No system is 100% secure, but we work to protect your information with reasonable security measures.",
      ],
    },
    {
      title: "5. How long we keep it",
      paragraphs: [
        "We keep your information for as long as it's needed to provide the service and for the time required by law. After that, we delete it securely.",
      ],
    },
    {
      title: "6. Your choices and rights",
      paragraphs: [
        "You can ask us to access, correct, or delete your information (except what we must keep by law), and to stop sending you messages that aren't necessary for your case. Depending on the state where you live, you may have additional rights. To exercise them, contact us using the details below.",
      ],
    },
    {
      title: "7. Cookies",
      paragraphs: [
        "This site only uses the cookies and technologies needed for it to work. If we use measurement or advertising tools in the future (for example, for social media ads), we will say so in this policy.",
      ],
    },
    {
      title: "8. Minors",
      paragraphs: [
        "Our services are for people 18 years of age or older. We do not knowingly collect information from minors.",
      ],
    },
    {
      title: "9. Changes to this policy",
      paragraphs: [
        "We may update this policy. The date of the last update appears at the top of this page.",
      ],
    },
  ],
  contactTitle: "10. Contact",
  contactText: "If you have questions about this policy or your information, message or call us:",
  contactLabels: { email: "Email", phone: "Phone", sms: "Text messages" },
};

export const PRIVACY_COPY: Record<Lang, PrivacyCopy> = { es: ES, en: EN };

export const usePrivacyCopy = () => PRIVACY_COPY[useLang()];
