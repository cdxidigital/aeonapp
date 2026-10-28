import { createFileRoute } from "@tanstack/react-router";
import { AeonApp } from "@/components/aeon/AeonApp";

export const Route = createFileRoute("/")({
  loader: () => ({
    iso: new Date().toISOString(),
    zone: Intl.DateTimeFormat().resolvedOptions().timeZone || "Australia/Perth",
  }),
  head: () => ({
    meta: [{ title: "Today · AEON" }],
  }),
  component: Home,
});

function Home() {
  const { iso, zone } = Route.useLoaderData();
  return <AeonApp initialIso={iso} initialZone={zone} />;
}

