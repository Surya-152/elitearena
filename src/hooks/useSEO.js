// src/hooks/useSEO.js
// Dynamic SEO meta tags — updates <title>, <meta description>, Open Graph, Twitter Card
// Call useSEO({ title, description, url, image }) in any page component.

import { useEffect } from 'react';

const SITE_NAME    = 'EliteArena';
const SITE_URL     = import.meta.env.VITE_SITE_URL || 'https://yourdomain.com';
const DEFAULT_IMG  = `${SITE_URL}/og-image.png`;
const DEFAULT_DESC = 'India\'s most transparent esports tournament platform. BGMI & Free Fire MAX. Compete, win real prizes, withdraw to UPI.';

export function useSEO({
  title       = SITE_NAME,
  description = DEFAULT_DESC,
  url         = SITE_URL,
  image       = DEFAULT_IMG,
  noIndex     = false,
  structuredData = null,
} = {}) {

  const fullTitle = title === SITE_NAME
    ? `${SITE_NAME} | Esports Tournaments India`
    : `${title} — ${SITE_NAME}`;

  useEffect(() => {
    // Title
    document.title = fullTitle;

    // Helper to set/create meta tags
    const setMeta = (name, content, prop = false) => {
      const attr = prop ? 'property' : 'name';
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };

    // Standard meta
    setMeta('description', description);
    setMeta('robots', noIndex ? 'noindex, nofollow' : 'index, follow');
    setMeta('author', 'EliteArena');

    // Open Graph
    setMeta('og:title',       fullTitle,    true);
    setMeta('og:description', description,  true);
    setMeta('og:url',         url,          true);
    setMeta('og:image',       image,        true);
    setMeta('og:type',        'website',    true);
    setMeta('og:site_name',   SITE_NAME,    true);
    setMeta('og:locale',      'en_IN',      true);

    // Twitter Card
    setMeta('twitter:card',        'summary_large_image');
    setMeta('twitter:title',       fullTitle);
    setMeta('twitter:description', description);
    setMeta('twitter:image',       image);

    // Canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);

    // JSON-LD Structured Data
    const existingScript = document.querySelector('script[data-seo="json-ld"]');
    if (existingScript) existingScript.remove();

    const defaultSchema = {
      '@context': 'https://schema.org',
      '@type':    'WebSite',
      name:       SITE_NAME,
      url:        SITE_URL,
      description: DEFAULT_DESC,
      potentialAction: {
        '@type':     'SearchAction',
        target:      `${SITE_URL}/leaderboard?q={search_term_string}`,
        'query-input': 'required name=search_term_string',
      },
    };

    const schema = structuredData || defaultSchema;
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-seo', 'json-ld');
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);

    // Cleanup on unmount
    return () => {
      const s = document.querySelector('script[data-seo="json-ld"]');
      if (s) s.remove();
    };
  }, [fullTitle, description, url, image, noIndex]);
}

// ── Pre-built SEO configs for each page ──────────────────────────────────────
export const SEO_PAGES = {
  home: {
    title:       'EliteArena',
    description: 'India ka #1 esports tournament platform. BGMI & Free Fire MAX tournaments. Jeeto real prizes. Deposit via UPI. Withdraw in 10 minutes.',
    url:         `${SITE_URL}/`,
  },
  leaderboard: {
    title:       'Hall of Champions — Leaderboard',
    description: 'India ke top BGMI aur Free Fire MAX players ki live ranking. Dekho kaun hai #1 aur compete karo EliteCoins ke liye.',
    url:         `${SITE_URL}/leaderboard`,
    noIndex:     false,
  },
  register: {
    title:       'Free Account Banao — EliteArena',
    description: 'EliteArena pe free account banao. BGMI aur Free Fire MAX tournaments mein join karo. Real prizes jeeto. Ads dekh ke EC kamao.',
    url:         `${SITE_URL}/register`,
  },
  login: {
    title:       'Login — EliteArena',
    description: 'EliteArena mein login karo aur tournaments join karo.',
    url:         `${SITE_URL}/login`,
  },
  privacy: {
    title:       'Privacy Policy — EliteArena',
    description: 'EliteArena ki privacy policy. Janiye hum aapka data kaise use aur protect karte hain.',
    url:         `${SITE_URL}/privacy`,
  },
  terms: {
    title:       'Terms of Service — EliteArena',
    description: 'EliteArena ke terms of service. Platform use karne ke rules aur conditions.',
    url:         `${SITE_URL}/terms`,
  },
};
