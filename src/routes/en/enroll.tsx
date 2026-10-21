import { createFileRoute } from "@tanstack/react-router";
import { Enrollment } from "../../components/enroll/Enrollment";
import { enrollHead } from "../../components/enroll/head";

// Formulario de inscripción en inglés (mismo flujo y misma base de datos que /inscripcion).
export const Route = createFileRoute("/en/enroll")({
  head: () => enrollHead("en"),
  component: EnrollmentEn,
});

function EnrollmentEn() {
  return <Enrollment lang="en" />;
}
