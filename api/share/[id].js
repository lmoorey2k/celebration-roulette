import React from 'react';
import { ImageResponse } from '@vercel/og';
import restaurantData from '../../data/restaurants.json';

export const config = {
  runtime: 'edge',
};

const SITE_NAME = 'Visit Celebration';
const APP_NAME = 'Celebration Restaurant Roller';
const OG_WIDTH = 1200;
const OG_HEIGHT = 630;
const SOCIAL_CRAWLER_RE =
  /applebot|baiduspider|bingbot|discordbot|duckduckbot|embedly|facebookexternalhit|facebot|googlebot|linkedinbot|messages|pinterest|quora link preview|redditbot|slackbot|telegrambot|twitterbot|vkshare|whatsapp/i;

const h = React.createElement;

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getBaseUrl(req) {
  const requestUrl = new URL(req.url);
  const forwardedHost = req.headers.get('x-forwarded-host');
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  return requestUrl.origin;
}

function getShareId(url) {
  const queryId = url.searchParams.get('id');
  if (queryId) {
    return Number.parseInt(queryId, 10);
  }

  const parts = url.pathname.split('/').filter(Boolean);
  return Number.parseInt(parts[parts.length - 1] || '', 10);
}

function findRestaurant(id) {
  const restaurants = Array.isArray(restaurantData.restaurants) ? restaurantData.restaurants : [];
  return restaurants.find((restaurant) => restaurant.id === id && restaurant.active !== false);
}

function getLogoUrl(restaurant, baseUrl) {
  const logoPath = restaurant.logoAsset || restaurant.logo_url || '';

  if (!logoPath) {
    return '';
  }

  if (/^https?:\/\//i.test(logoPath)) {
    return logoPath;
  }

  try {
    return new URL(logoPath.replace(/^\//, ''), `${baseUrl}/`).toString();
  } catch {
    return '';
  }
}

function isSocialCrawler(req) {
  return SOCIAL_CRAWLER_RE.test(req.headers.get('user-agent') || '');
}

function metadataHtml({ title, description, appUrl, shareUrl, imageUrl, imageAlt }) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${escapeHtml(title)}</title>
    <meta name="description" content="${escapeHtml(description)}">
    <link rel="canonical" href="${escapeHtml(appUrl)}">
    <meta http-equiv="refresh" content="0; url=${escapeHtml(appUrl)}">

    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${escapeHtml(SITE_NAME)}">
    <meta property="og:url" content="${escapeHtml(shareUrl)}">
    <meta property="og:title" content="${escapeHtml(title)}">
    <meta property="og:description" content="${escapeHtml(description)}">
    <meta property="og:image" content="${escapeHtml(imageUrl)}">
    <meta property="og:image:secure_url" content="${escapeHtml(imageUrl)}">
    <meta property="og:image:width" content="${OG_WIDTH}">
    <meta property="og:image:height" content="${OG_HEIGHT}">
    <meta property="og:image:alt" content="${escapeHtml(imageAlt)}">

    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHtml(title)}">
    <meta name="twitter:description" content="${escapeHtml(description)}">
    <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
  </head>
  <body>
    <script>window.location.replace(${JSON.stringify(appUrl)});</script>
    <p><a href="${escapeHtml(appUrl)}">Open the Restaurant Roller</a></p>
  </body>
</html>`;
}

function winnerLogoImage(restaurant, baseUrl) {
  const logoUrl = getLogoUrl(restaurant, baseUrl);

  return new ImageResponse(
    h(
      'div',
      {
        style: {
          width: OG_WIDTH,
          height: OG_HEIGHT,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: '#FFFFFF',
        },
      },
      h(
        'div',
        {
          style: {
            width: 1040,
            height: 390,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            overflow: 'hidden',
          },
        },
        h('img', {
          src: logoUrl,
          alt: '',
          style: {
            maxWidth: 1040,
            maxHeight: 390,
            objectFit: 'contain',
          },
        })
      )
    ),
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=604800',
      },
    }
  );
}

export default async function handler(req) {
  const url = new URL(req.url);
  const id = getShareId(url);
  const baseUrl = getBaseUrl(req);
  const restaurant = Number.isFinite(id) ? findRestaurant(id) : null;

  if (!restaurant) {
    return Response.redirect(baseUrl, 302);
  }

  if (url.searchParams.get('image') === '1') {
    return winnerLogoImage(restaurant, baseUrl);
  }

  const appUrl = `${baseUrl}/?pick=${restaurant.id}`;
  const shareUrl = `${baseUrl}/share/${restaurant.id}`;
  const imageUrl = `${shareUrl}?image=1`;
  const title = `Join me at ${restaurant.name}`;
  const description = `You found a great place to dine in Celebration. Join me at ${restaurant.name}.`;

  if (!isSocialCrawler(req)) {
    return Response.redirect(appUrl, 302);
  }

  return new Response(
    metadataHtml({
      title,
      description,
      appUrl,
      shareUrl,
      imageUrl,
      imageAlt: `${APP_NAME} picked ${restaurant.name}`,
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    }
  );
}
