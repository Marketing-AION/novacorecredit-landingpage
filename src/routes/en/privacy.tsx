import { createFileRoute } from "@tanstack/react-router";
import { PrivacyPage } from "../../components/legal/PrivacyPage";
import { privacyHead } from "../../components/legal/head";

// Política de privacidad en inglés.
export const Route = createFileRoute("/en/privacy")({
  head: () => privacyHead("en"),
  component: PrivacyEn,
});

function PrivacyEn() {
  return <PrivacyPage lang="en" />;
}
