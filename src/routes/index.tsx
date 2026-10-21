import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "../components/landing/Landing";
import { landingHead } from "../components/landing/head";

// Landing de NovaCore Credit en español (principal). El botón principal lleva a /inscripcion.
export const Route = createFileRoute("/")({
  head: () => landingHead("es"),
  component: LandingEs,
});

function LandingEs() {
  return <Landing lang="es" />;
}
