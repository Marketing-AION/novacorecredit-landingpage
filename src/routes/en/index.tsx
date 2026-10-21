import { createFileRoute } from "@tanstack/react-router";
import { Landing } from "../../components/landing/Landing";
import { landingHead } from "../../components/landing/head";

// Landing de NovaCore Credit en inglés. El botón principal lleva a /en/enroll.
export const Route = createFileRoute("/en/")({
  head: () => landingHead("en"),
  component: LandingEn,
});

function LandingEn() {
  return <Landing lang="en" />;
}
