import Script from "next/script";

/**
 * Env-driven analytics (CLAUDE.md / PLAN §1.1). Renders nothing unless
 * NEXT_PUBLIC_ANALYTICS_ID is set — never hardcode a measurement ID.
 */
export function Analytics() {
  const id = process.env.NEXT_PUBLIC_ANALYTICS_ID;
  if (!id) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${id}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${id}');`}
      </Script>
    </>
  );
}
