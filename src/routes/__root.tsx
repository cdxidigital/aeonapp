import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { createIsomorphicFn } from "@tanstack/react-start";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import { xBannerUrl as bannerFromRequest } from "@/lib/og/share-host.server";
import appCss from "../styles.css?url";

const themeBoot = `(function(){try{var t="light";var raw=localStorage.getItem("aeon.private.v1");if(raw){var p=JSON.parse(raw);var theme=p&&p.prefs&&p.prefs.theme;if(theme==="dark"||theme==="light"||theme==="system")t=theme;}var m=t==="system"?(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):t==="dark"?"dark":"light";document.documentElement.dataset.theme=m;var meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute("content",m==="dark"?"#202722":"#f5f2eb");}catch(e){}})();`;

const APP_NAME = "AEON";

function publicAppHost(hostHeader: string | undefined) {
  const host = String(hostHeader ?? "")
    .split(",")[0]
    .trim()
    .split(":")[0]
    .toLowerCase();
  if (!host || !/^[a-z0-9.-]+$/.test(host) || !host.includes(".")) return "";
  if (/^\d{1,3}(?:\.\d{1,3}){3}$/.test(host)) return "";
  if (host === "vercel.app" || host.endsWith(".vercel.app") || host === "vercel.com" || host.endsWith(".vercel.com")) return "";
  return host;
}

const xBannerUrl = createIsomorphicFn()
  .server(() => bannerFromRequest())
  .client(() => {
    const host = publicAppHost(import.meta.env.VITE_PUBLIC_HOSTNAME) || publicAppHost(window.location.host);
    return host ? `https://${host}/x-banner.jpg` : "";
  });

export const Route = createRootRoute({
  head: () => {
    const xBanner = xBannerUrl();
    return {
      meta: [
        { charSet: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
        { title: `${APP_NAME} — Your sky, your perspective` },
        {
          name: "description",
          content:
            "Your sky, your perspective. Explore real birth charts, thoughtful daily readings, private compatibility and a little space to reflect.",
        },
        { name: "theme-color", content: "#f5f2eb" },
        ...(xBanner ? [{ property: "x:game:image", content: xBanner }] : []),
      ],
      links: [
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "stylesheet", href: appCss },
        { rel: "manifest", href: "/__grok/manifest.webmanifest" },
        { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
      ],
    };
  },
  component: () => (
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
        <script dangerouslySetInnerHTML={{ __html: themeBoot }} />
      </head>
      <body>
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
