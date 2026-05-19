import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Expo Router HTML template — runs only during static web export (not on native).
 * This is the right place for <head> meta tags: OG, Twitter Card, favicon, etc.
 * Any changes here require a full `npx expo export -p web` rebuild.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* ── Page identity ─────────────────────────────────────── */}
        <title>Celebration Restaurant Roller — Visit Celebration</title>
        <meta
          name="description"
          content="Can't decide where to eat? Let the Celebration Restaurant Roller make the pick for you. Spin for a dining spot in Celebration, FL."
        />

        {/* ── Open Graph (iMessage, Facebook, Slack, etc.) ──────── */}
        <meta property="og:type"        content="website" />
        <meta property="og:url"         content="https://celebration-roulette.vercel.app" />
        <meta property="og:title"       content="Celebration Restaurant Roller" />
        <meta property="og:description" content="Can't decide where to eat in Celebration, FL? Spin the machine and let it choose your next dining spot." />
        {/* og:image must be an absolute URL to a publicly accessible image. */}
        {/* og-preview.png is served from the public/ folder (copied to dist root by Expo). */}
        <meta property="og:image"       content="https://celebration-roulette.vercel.app/og-preview.png" />
        <meta property="og:image:width"  content="1122" />
        <meta property="og:image:height" content="1402" />
        <meta property="og:image:alt"    content="The Visit Celebration slot machine restaurant roller" />
        <meta property="og:site_name"    content="Visit Celebration" />

        {/* ── Twitter / X Card ──────────────────────────────────── */}
        <meta name="twitter:card"        content="summary_large_image" />
        <meta name="twitter:title"       content="Celebration Restaurant Roller" />
        <meta name="twitter:description" content="Can't decide where to eat in Celebration, FL? Spin the machine." />
        <meta name="twitter:image"       content="https://celebration-roulette.vercel.app/og-preview.png" />

        {/* ── Apple / iOS specifics ─────────────────────────────── */}
        <meta name="apple-mobile-web-app-capable"   content="yes" />
        <meta name="apple-mobile-web-app-title"     content="Restaurant Roller" />
        <meta name="theme-color"                    content="#0B5B45" />

        {/* Required by Expo Router static export for scroll behaviour */}
        <ScrollViewStyleReset />
      </head>
      <body>{children}</body>
    </html>
  );
}
