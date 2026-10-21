import { createFileRoute } from "@tanstack/react-router";
import { Enrollment } from "../components/enroll/Enrollment";
import { enrollHead } from "../components/enroll/head";

// Formulario de inscripción en español: bienvenida + 3 pasos
// (tu información, tus documentos, acuerdo y pago).
export const Route = createFileRoute("/inscripcion")({
  head: () => enrollHead("es"),
  component: EnrollmentEs,
});

function EnrollmentEs() {
  return <Enrollment lang="es" />;
}
