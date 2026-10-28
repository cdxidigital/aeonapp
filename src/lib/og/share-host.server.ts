import { getRequestHost } from "@tanstack/react-start/server";
import { resolvePublicHost } from "../../../scripts/grok-pwa-shared.mjs";

export function xBannerUrl() {
  let header = "";
  try {
    header = getRequestHost({ xForwardedHost: true });
  } catch {
    header = "";
  }
  const host = resolvePublicHost(header);
  return host ? `https://${host}/x-banner.jpg` : "";
}
