import { createFileRoute } from "@tanstack/react-router";
import { SchedulePage } from "../components/schedule/SchedulePage";

const TITLE = "Agenda tu consulta gratis · NovaCore Credit";
const DESCRIPTION =
  "Agenda una llamada gratis de 15 minutos con NovaCore Credit. Te llamamos para conocer tu caso y resolver tus dudas sobre tu crédito, en español.";

// Calendario de la consulta gratis (GoHighLevel) dentro del sitio.
export const Route = createFileRoute("/agendar")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
    ],
  }),
  component: SchedulePage,
});
