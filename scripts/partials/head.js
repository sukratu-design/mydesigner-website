const { escapeXml } = require('../lib/utils');

const SITE_URL = 'https://mydesigner.gg';
const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/images/og-image.jpg`;

function absoluteUrl(value = '/') {
  if (/^https?:\/\//i.test(value)) {
    return value.replace(/\.html(?=$|[?#])/i, '');
  }

  const path = value.startsWith('/') ? value : `/${value}`;
  return `${SITE_URL}${path}`.replace(/\.html(?=$|[?#])/i, '');
}

function jsonLdTags(schema) {
  const items = Array.isArray(schema) ? schema : [schema].filter(Boolean);

  return items.map((item) => {
    const json = JSON.stringify(item).replace(/</g, '\\u003c');
    return `  <script type="application/ld+json">${json}</script>`;
  }).join('\n');
}

function analyticsTags() {
  return `  <!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-BJS1P09VE8"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag("js", new Date());
    gtag("config", "G-BJS1P09VE8");
  </script>

  <!-- Meta Pixel Code -->
  <script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '4412177725703271');
  fbq('track', 'PageView');
  </script>
  <noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=4412177725703271&ev=PageView&noscript=1"
  /></noscript>
  <!-- End Meta Pixel Code -->`;
}

function headTags({
  title,
  description,
  canonical = '/',
  ogTitle = title,
  ogDescription = description,
  ogImage = DEFAULT_OG_IMAGE,
  twitterTitle = ogTitle,
  twitterDescription = ogDescription,
  schema = [],
  extra = '',
} = {}) {
  if (!title) throw new Error('headTags requires a title');
  if (!description) throw new Error('headTags requires a description');

  const canonicalUrl = absoluteUrl(canonical);
  const schemaTags = jsonLdTags(schema);

  return `  ${analyticsTags()}
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeXml(title)}</title>
  <meta name="description" content="${escapeXml(description)}">
  <meta name="theme-color" content="#0b0807">
  <link rel="canonical" href="${escapeXml(canonicalUrl)}">
  <link rel="icon" type="image/svg+xml" href="/assets/images/favicon.svg">
  <link rel="icon" type="image/png" href="/assets/images/favicon.png">
  <link rel="apple-touch-icon" href="/assets/images/favicon.png">
  <link rel="stylesheet" href="/css/orbit.css">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeXml(canonicalUrl)}">
  <meta property="og:title" content="${escapeXml(ogTitle)}">
  <meta property="og:description" content="${escapeXml(ogDescription)}">
  <meta property="og:image" content="${escapeXml(ogImage)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeXml(twitterTitle)}">
  <meta name="twitter:description" content="${escapeXml(twitterDescription)}">
  <meta name="twitter:image" content="${escapeXml(ogImage)}">${schemaTags ? `\n${schemaTags}` : ''}${extra ? `\n${extra}` : ''}`;
}

module.exports = {
  SITE_URL,
  DEFAULT_OG_IMAGE,
  absoluteUrl,
  analyticsTags,
  headTags,
};
