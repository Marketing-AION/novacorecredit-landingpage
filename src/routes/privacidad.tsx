import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "../components/legal/PrivacyPage";
import { privacyHead } from "../components/legal/head";

// Política de privacidad en español.
export const Route = createFileRoute("/privacidad")({
  head: () => privacyHead("es"),
  component: PrivacyEs,
});

function PrivacyEs() {
  return <PrivacyPage lang="es" />;
}
