/**
 * EliteArena — AdManager v3
 * ════════════════════════════════════════════════════════════
 * Architecture:
 *  - AdSense     → Dashboard sidebar (highest traffic, best RPM)
 *  - Media.net   → Stream/TournamentDetail page (contextual ads)
 *  - PropellerAds → News/Blog page (no approval needed, gaming-friendly)
 *  - Flipkart+Amazon → Tournament page (affiliate product cards)
 *
 * Performance:
 *  - useAdReady hook: waits 5s after page-load before injecting any ad
 *    (zero CLS, zero LCP impact, smooth UX)
 *  - Intersection Observer: ads only load when scrolled into view
 *  - Skeleton placeholder during delay (holds layout space)
 *  - Production: real ads | Dev/missing config: silent skeleton
 * ════════════════════════════════════════════════════════════
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Config from .env ────────────────────────────────────────────────────────
const ENV = {
  adsense:   import.meta.env.VITE_ADSENSE_PUBLISHER_ID   || '',
  adSlotS:   import.meta.env.VITE_AD_SLOT_SIDEBAR        || '',
  adSlotB:   import.meta.env.VITE_AD_SLOT_BANNER         || '',
  adSlotI:   import.meta.env.VITE_AD_SLOT_INFEED         || '',
  medianet:  import.meta.env.VITE_MEDIANET_SITE_ID       || '',
  mnSlotS:   import.meta.env.VITE_MEDIANET_SLOT_SIDEBAR  || '',
  mnSlotB:   import.meta.env.VITE_MEDIANET_SLOT_BANNER   || '',
  propeller: import.meta.env.VITE_PROPELLER_ZONE_ID      || '',
  amzTag:    import.meta.env.VITE_AMAZON_AFFILIATE_TAG   || 'elitearena-21',
  flipTag:   import.meta.env.VITE_FLIPKART_AFFILIATE_ID  || '',
};

const AD_DELAY_MS = 5000; // 5 seconds after mount before any ad loads

// ─── Hook: resolves after AD_DELAY_MS (non-blocking) ────────────────────────
function useAdReady(minHeight = 90) {
  const [ready,    setReady]   = useState(false);
  const [visible,  setVisible] = useState(false);
  const containerRef           = useRef(null);

  // Step 1 — 5s page-load delay
  useEffect(() => {
    const t = setTimeout(() => setReady(true), AD_DELAY_MS);
    return () => clearTimeout(t);
  }, []);

  // Step 2 — Intersection Observer: only load when in viewport
  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { rootMargin: '100px' }
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  return { ready: ready && visible, containerRef };
}

// ─── Skeleton placeholder (holds layout, no flash) ──────────────────────────
function AdSkeleton({ height = 90, label = '' }) {
  return (
    <div className="w-full rounded-xl overflow-hidden"
         style={{ height, background:'rgba(16,16,28,0.4)', border:'1px solid rgba(30,30,58,0.3)' }}>
      <div className="h-full flex items-center justify-center">
        {label && (
          <span className="font-mono text-[9px] text-ea-dim opacity-50 select-none">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// 1. ADSENSE — Dashboard sidebar
// Usage: <AdSenseUnit slot={ENV.adSlotS} />
// ════════════════════════════════════════════════════════════
export function AdSenseUnit({ slot, format = 'auto', height = 250, className = '' }) {
  const { ready, containerRef } = useAdReady(height);
  const pushed                  = useRef(false);

  useEffect(() => {
    if (!ready || !ENV.adsense || !slot || pushed.current) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushed.current = true;
    } catch {}
  }, [ready, slot]);

  return (
    <div ref={containerRef} className={`w-full overflow-hidden ${className}`}
         style={{ minHeight: height }}>
      {!ready || !ENV.adsense || !slot ? (
        <AdSkeleton height={height} label={(!ENV.adsense || !slot) ? '' : '⏳'} />
      ) : (
        <ins className="adsbygoogle block"
          style={{ display:'block', minHeight: height }}
          data-ad-client={ENV.adsense}
          data-ad-slot={slot}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// 2. MEDIA.NET — TournamentDetail / Stream page
// Usage: <MediaNetUnit slot={ENV.mnSlotS} width={300} height={250} />
// ════════════════════════════════════════════════════════════
export function MediaNetUnit({ slot, width = 300, height = 250, className = '' }) {
  const { ready, containerRef } = useAdReady(height);
  const injected                = useRef(false);
  const divRef                  = useRef(null);

  useEffect(() => {
    if (!ready || !ENV.medianet || !slot || injected.current) return;
    injected.current = true;
    if (!divRef.current) return;
    // Media.net contextual ad render
    const s = document.createElement('script');
    s.type  = 'text/javascript';
    s.text  = `
      try {
        window._mNHandle.queue.push(function(){
          window._mNDetails.loadTag("${slot}", "${width}x${height}", "${slot}");
        });
      } catch(e) {}
    `;
    divRef.current.appendChild(s);
  }, [ready, slot, width, height]);

  return (
    <div ref={containerRef} className={`w-full overflow-hidden ${className}`}
         style={{ minHeight: height }}>
      {!ready || !ENV.medianet || !slot ? (
        <AdSkeleton height={height} label={(!ENV.medianet || !slot) ? '' : '⏳'} />
      ) : (
        <div ref={divRef} id={slot} style={{ minHeight: height }} />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// 3. PROPELLERADS — News / Blog page
// Usage: <PropellerBannerAd />
// ════════════════════════════════════════════════════════════
export function PropellerBannerAd({ height = 90, className = '' }) {
  const { ready, containerRef } = useAdReady(height);
  const divRef                  = useRef(null);
  const injected                = useRef(false);

  useEffect(() => {
    if (!ready || !ENV.propeller || injected.current) return;
    injected.current = true;
    const s = document.createElement('script');
    s.async = true;
    s.setAttribute('data-cfasync', 'false');
    s.src = `//cdn.propellerads.com/zone/${ENV.propeller}.js`;
    s.onerror = () => {};
    divRef.current?.appendChild(s);
    return () => { try { s.remove(); } catch {} };
  }, [ready]);

  return (
    <div ref={containerRef} className={`w-full overflow-hidden ${className}`}
         style={{ minHeight: height }}>
      {!ready || !ENV.propeller ? (
        <AdSkeleton height={height} label={!ENV.propeller ? '' : '⏳'} />
      ) : (
        <div ref={divRef} style={{ minHeight: height }} />
      )}
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// 4. FLIPKART + AMAZON AFFILIATE CARDS — Tournament page
// Beautifully designed gaming gear cards with affiliate links
// Usage: <AffiliateGamingCards />
// ════════════════════════════════════════════════════════════
const GAMING_PRODUCTS = [
  {
    name:     'Gaming Headset',
    emoji:    '🎧',
    desc:     'Crystal clear audio for BGMI',
    amzQ:     'gaming+headset+bgmi',
    flipQ:    'gaming-headset',
    price:    '₹599 – ₹4,999',
    color:    'cyan',
  },
  {
    name:     'Mobile Controller',
    emoji:    '🎮',
    desc:     'Trigger buttons for Free Fire',
    amzQ:     'mobile+controller+pubg',
    flipQ:    'mobile-controller-trigger',
    price:    '₹149 – ₹999',
    color:    'magenta',
  },
  {
    name:     'Gaming Smartphone',
    emoji:    '📱',
    desc:     '120Hz display, 8GB RAM',
    amzQ:     'gaming+smartphone+india',
    flipQ:    'gaming-mobile',
    price:    '₹12,999 – ₹49,999',
    color:    'gold',
  },
  {
    name:     'Phone Cooling Fan',
    emoji:    '❄️',
    desc:     'No more heating during matches',
    amzQ:     'phone+cooling+fan+gaming',
    flipQ:    'mobile-cooling-fan',
    price:    '₹299 – ₹1,499',
    color:    'green',
  },
];

const COLOR_MAP = {
  cyan:    { text:'text-ea-cyan',    border:'border-ea-cyan/20',    bg:'bg-ea-cyan/6'    },
  magenta: { text:'text-ea-magenta', border:'border-ea-magenta/20', bg:'bg-ea-magenta/6' },
  gold:    { text:'text-ea-gold',    border:'border-ea-gold/20',    bg:'bg-ea-gold/6'    },
  green:   { text:'text-ea-green',   border:'border-ea-green/20',   bg:'bg-ea-green/6'   },
};

export function AffiliateGamingCards({ className = '' }) {
  const { ready, containerRef } = useAdReady(200);

  // Build affiliate URLs
  const amzBase  = `https://www.amazon.in/s?tag=${ENV.amzTag}&k=`;
  const flipBase = ENV.flipTag
    ? `https://www.flipkart.com/search?q=`
    : `https://www.flipkart.com/search?q=`;

  if (!ready) {
    return (
      <div className={`w-full ${className}`} ref={containerRef}>
        <AdSkeleton height={200} label="⏳" />
      </div>
    );
  }

  return (
    <div ref={containerRef} className={`rounded-2xl p-4 ${className}`}
         style={{ background:'linear-gradient(145deg,#0d0d1a,#080812)',
                  border:'1px solid rgba(30,30,58,0.6)' }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🛍️</span>
          <span className="font-display font-bold text-sm text-white">Gaming Gear</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[9px] text-ea-dim px-1.5 py-0.5 rounded"
                style={{ background:'rgba(255,148,0,0.08)', border:'1px solid rgba(255,148,0,0.15)' }}>
            🛒 Flipkart
          </span>
          <span className="font-mono text-[9px] text-ea-dim px-1.5 py-0.5 rounded"
                style={{ background:'rgba(255,145,0,0.08)', border:'1px solid rgba(255,145,0,0.15)' }}>
            📦 Amazon
          </span>
        </div>
      </div>

      {/* Product grid */}
      <div className="grid grid-cols-2 gap-2">
        {GAMING_PRODUCTS.map(p => {
          const cls = COLOR_MAP[p.color] || COLOR_MAP.cyan;
          return (
            <div key={p.name}
                 className={`rounded-xl p-2.5 border ${cls.border} ${cls.bg}
                             hover:opacity-90 transition-all`}>
              <div className="text-lg mb-1">{p.emoji}</div>
              <p className={`font-display font-bold text-xs ${cls.text} mb-0.5`}>{p.name}</p>
              <p className="font-body text-[10px] text-ea-muted mb-1.5 leading-tight">{p.desc}</p>
              <p className="font-mono text-[9px] text-ea-dim mb-2">{p.price}</p>
              <div className="flex gap-1">
                <a href={`${flipBase}${encodeURIComponent(p.flipQ)}`}
                   target="_blank" rel="noopener noreferrer nofollow"
                   className="flex-1 py-1 rounded-lg text-center font-mono text-[9px] font-bold
                              text-white transition-all hover:opacity-80 active:scale-95"
                   style={{ background:'linear-gradient(135deg,#F7941D,#e07a00)' }}>
                  Flipkart
                </a>
                <a href={`${amzBase}${encodeURIComponent(p.amzQ)}`}
                   target="_blank" rel="noopener noreferrer nofollow"
                   className="flex-1 py-1 rounded-lg text-center font-mono text-[9px] font-bold
                              text-white transition-all hover:opacity-80 active:scale-95"
                   style={{ background:'linear-gradient(135deg,#FF9900,#e07a00)' }}>
                  Amazon
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <p className="font-mono text-[8px] text-ea-dim/50 text-center mt-2">
        * Affiliate links — purchasing helps support EliteArena
      </p>
    </div>
  );
}

// ════════════════════════════════════════════════════════════
// CONVENIENCE EXPORTS — named slots for each page
// ════════════════════════════════════════════════════════════

/** Dashboard sidebar — AdSense */
export function DashboardSidebarAd({ className = '' }) {
  return <AdSenseUnit slot={ENV.adSlotS} height={280} className={className} />;
}

/** Dashboard banner — AdSense */
export function DashboardBannerAd({ className = '' }) {
  return <AdSenseUnit slot={ENV.adSlotB} format="horizontal" height={90} className={className} />;
}

/** Stream/Tournament page — Media.net contextual */
export function StreamPageAd({ className = '' }) {
  return <MediaNetUnit slot={ENV.mnSlotS} width={300} height={250} className={className} />;
}

/** Tournament page — Affiliate cards */
export function TournamentAffiliateAd({ className = '' }) {
  return <AffiliateGamingCards className={className} />;
}

/** News/Blog page — PropellerAds */
export function NewsBannerAd({ className = '' }) {
  return <PropellerBannerAd height={90} className={className} />;
}

/** Leaderboard banner — AdSense */
export function LeaderboardBannerAd({ className = '' }) {
  return <AdSenseUnit slot={ENV.adSlotB} format="horizontal" height={90} className={className} />;
}

// Backward-compat legacy exports
export default function GoogleAd({ slot, format, height = 90, className = '' }) {
  return <AdSenseUnit slot={slot} format={format} height={height} className={className} />;
}
export function BannerAd({ className = '' }) {
  return <AdSenseUnit slot={ENV.adSlotB} format="horizontal" height={90} className={className} />;
}
export function SidebarAd({ className = '' }) {
  return <AdSenseUnit slot={ENV.adSlotS} height={250} className={className} />;
}
export function InFeedAd({ className = '' }) {
  return <AdSenseUnit slot={ENV.adSlotI} format="fluid" height={150} className={className} />;
}
