export type Goal =
  "casa" | "auto" | "renta" | "tarjetas" | "financiamiento" | "negocio" | "condiciones";

export type DocKey = "license" | "ssnCard" | "proofAddress";

export type DocFile = {
  name: string;
  size: number;
  type: string;
  /** Vista previa local (solo imágenes). */
  previewUrl?: string | undefined;
  /** Archivo real; se enviará cuando se conecte el sistema de NovaCore. */
  file?: File | undefined;
};

export type FormData = {
  firstName: string;
  middleName: string;
  lastName: string;
  dobDay: string;
  dobMonth: string;
  dobYear: string;
  phone: string;
  email: string;
  street: string;
  unit: string;
  city: string;
  state: string;
  zip: string;
  ssn: string;
  goals: Goal[];
  license: DocFile | null;
  ssnCard: DocFile | null;
  proofAddress: DocFile | null;
  rightsRead: boolean;
  termsAccepted: boolean;
  signature: string;
  cardName: string;
  cardNumber: string;
  cardExp: string;
  cardCvc: string;
  cardZip: string;
};

export type FieldKey = keyof FormData;

export const emptyForm: FormData = {
  firstName: "",
  middleName: "",
  lastName: "",
  dobDay: "",
  dobMonth: "",
  dobYear: "",
  phone: "",
  email: "",
  street: "",
  unit: "",
  city: "",
  state: "",
  zip: "",
  ssn: "",
  goals: [],
  license: null,
  ssnCard: null,
  proofAddress: null,
  rightsRead: false,
  termsAccepted: false,
  signature: "",
  cardName: "",
  cardNumber: "",
  cardExp: "",
  cardCvc: "",
  cardZip: "",
};

/** Datos de ejemplo para revisar el diseño. No son datos reales. */
export const exampleForm: FormData = {
  firstName: "María",
  middleName: "Fernanda",
  lastName: "Ruiz Castillo",
  dobDay: "14",
  dobMonth: "3",
  dobYear: "1987",
  phone: "(305) 555-0147",
  email: "maria.ruiz@ejemplo.com",
  street: "2741 SW 8th St",
  unit: "Apt 4B",
  city: "Miami",
  state: "FL",
  zip: "33135",
  ssn: "123-45-6789",
  goals: ["casa", "auto"],
  license: { name: "IMG_2041.png", size: 68, type: "image/png" },
  ssnCard: { name: "IMG_2042.png", size: 68, type: "image/png" },
  proofAddress: { name: "Scan_0412.pdf", size: 48, type: "application/pdf" },
  rightsRead: true,
  termsAccepted: true,
  signature: "María Fernanda Ruiz Castillo",
  cardName: "MARIA F RUIZ",
  cardNumber: "4242 4242 4242 4242",
  cardExp: "08/29",
  cardCvc: "123",
  cardZip: "33135",
};

export type ScreenId =
  "welcome" | "about" | "address" | "identity" | "documents" | "agreement" | "payment" | "done";

export const SCREENS: ScreenId[] = [
  "welcome",
  "about",
  "address",
  "identity",
  "documents",
  "agreement",
  "payment",
  "done",
];

/** Paso al que pertenece cada pantalla. 0 = bienvenida, 4 = terminado. */
export const STEP_OF: Record<ScreenId, 0 | 1 | 2 | 3 | 4> = {
  welcome: 0,
  about: 1,
  address: 1,
  identity: 1,
  documents: 2,
  agreement: 3,
  payment: 3,
  done: 4,
};

/** Posición dentro del paso: [actual, total]. */
export const SUBSTEP: Partial<Record<ScreenId, [number, number]>> = {
  about: [1, 3],
  address: [2, 3],
  identity: [3, 3],
  agreement: [1, 2],
  payment: [2, 2],
};

/** Campos de cada pantalla, en el orden en que aparecen. */
export const SCREEN_FIELDS: Partial<Record<ScreenId, FieldKey[]>> = {
  about: ["firstName", "middleName", "lastName", "dobDay", "dobMonth", "dobYear", "phone", "email"],
  address: ["street", "unit", "city", "state", "zip"],
  identity: ["ssn", "goals"],
  documents: ["license", "ssnCard", "proofAddress"],
  agreement: ["rightsRead", "termsAccepted", "signature"],
  payment: ["cardName", "cardNumber", "cardExp", "cardCvc", "cardZip"],
};

/**
 * NovaCore pidió cobrar al momento ("Pagar ahora"). La ley CROA prohíbe cobrar
 * por reparación de crédito antes de prestar el servicio: NovaCore debe
 * confirmarlo con su abogado. Si deciden cobrar después, cambiar a false y la
 * página pasa a "registrar la tarjeta" sin cobrar hoy.
 */
export const PAY_NOW = true;

export const US_STATES: [string, string][] = [
  ["AL", "Alabama"],
  ["AK", "Alaska"],
  ["AZ", "Arizona"],
  ["AR", "Arkansas"],
  ["CA", "California"],
  ["CO", "Colorado"],
  ["CT", "Connecticut"],
  ["DE", "Delaware"],
  ["DC", "District of Columbia"],
  ["FL", "Florida"],
  ["GA", "Georgia"],
  ["HI", "Hawaii"],
  ["ID", "Idaho"],
  ["IL", "Illinois"],
  ["IN", "Indiana"],
  ["IA", "Iowa"],
  ["KS", "Kansas"],
  ["KY", "Kentucky"],
  ["LA", "Louisiana"],
  ["ME", "Maine"],
  ["MD", "Maryland"],
  ["MA", "Massachusetts"],
  ["MI", "Michigan"],
  ["MN", "Minnesota"],
  ["MS", "Mississippi"],
  ["MO", "Missouri"],
  ["MT", "Montana"],
  ["NE", "Nebraska"],
  ["NV", "Nevada"],
  ["NH", "New Hampshire"],
  ["NJ", "New Jersey"],
  ["NM", "New Mexico"],
  ["NY", "New York"],
  ["NC", "North Carolina"],
  ["ND", "North Dakota"],
  ["OH", "Ohio"],
  ["OK", "Oklahoma"],
  ["OR", "Oregon"],
  ["PA", "Pennsylvania"],
  ["PR", "Puerto Rico"],
  ["RI", "Rhode Island"],
  ["SC", "South Carolina"],
  ["SD", "South Dakota"],
  ["TN", "Tennessee"],
  ["TX", "Texas"],
  ["UT", "Utah"],
  ["VT", "Vermont"],
  ["VA", "Virginia"],
  ["WA", "Washington"],
  ["WV", "West Virginia"],
  ["WI", "Wisconsin"],
  ["WY", "Wyoming"],
];

/** Contacto de NovaCore (confirmado). El número es para llamadas y mensajes de texto: NovaCore no usa WhatsApp. */
export const CONTACT = {
  phone: "(210) 517-7078",
  phoneHref: "tel:+12105177078",
  smsHref: "sms:+12105177078",
  email: "novacorecredit@gmail.com",
};

export const MAX_DOC_MB = 10;
