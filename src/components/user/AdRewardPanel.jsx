// src/components/user/AdRewardPanel.jsx
// Real ad reward: shows actual ad network during countdown, awards real EC
import { useState, useRef, useEffect } from 'react';
import { Play, CheckCircle, Clock, Zap, Crown, ExternalLink } from 'lucide-react';
import { claimAdReward }  from '../../services/walletService';
import { useAuth }        from '../../context/AuthContext';
import { useAdRewards }   from '../../hooks/useAdRewards';
import toast              from 'react-hot-toast';

const AD_DURATION  = 15; // seconds user must wait
const PROPELLER_ID = import.meta.env.VITE_PROPELLER_ZONE_ID || '';
const ADSENSE_ID   = import.meta.env.VITE_ADSENSE_PUBLISHER_ID || '';
const HAS_REAL_AD  = !!(PROPELLER_ID || ADSENSE_ID);

// Amazon affiliate gaming gear links shown during ad watch
const GEAR_LINKS = [
  { label:'Gaming Headset', emoji:'🎧', href:`https://www.amazon.in/s?k=gaming+headset&tag=${import.meta.env.VITE_AMAZON_AFFILIATE_TAG || 'elitearena-21'}` },
  { label:'Phone Cooler',   emoji:'❄️', href:`https://www.amazon.in/s?k=phone+cooling+fan&tag=${import.meta.env.VITE_AMAZON_AFFILIATE_TAG || 'elitearena-21'}` },
  { label:'Controller',     emoji:'🎮', href:`https://www.amazon.in/s?k=mobile+controller&tag=${import.meta.env.VITE_AMAZON_AFFILIATE_TAG || 'elitearena-21'}` },
];

export default function AdRewardPanel() {
  const { userProfile } = useAuth();
  const { claimedToday, dailyLimit, remaining, limitReached, hasElitePass }
    = useAdRewards(userProfile?.uid, userProfile);

  const [phase,    setPhase]   = useState('idle');  // idle | playing | cooldown
  const [adSec,    setAdSec]   = useState(AD_DURATION);
  const [coolSec,  setCoolSec] = useState(30);
  const [gearIdx,  setGearIdx] = useState(0);
  const timerRef  = useRef(null);
  const coolRef   = useRef(null);
  const mountedRef= useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      clearInterval(timerRef.current);
      clearInterval(coolRef.current);
    };
  }, []);

  const startAd = () => {
    if (!userProfile || limitReached || phase !== 'idle') return;
    setPhase('playing');
    setAdSec(AD_DURATION);
    setGearIdx(Math.floor(Math.random() * GEAR_LINKS.length));
    clearInterval(timerRef.current);

    timerRef.current = setInterval(async () => {
      setAdSec(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          // Award EC
          claimAdReward(userProfile.uid, userProfile)
            .then(() => { if (mountedRef.current) toast.success('+1 EC mila! 🎯'); })
            .catch(e => { if (mountedRef.current) toast.error(e.message); });
          // Cooldown
          if (mountedRef.current) {
            setPhase('cooldown');
            setCoolSec(30);
            clearInterval(coolRef.current);
            coolRef.current = setInterval(() => {
              setCoolSec(s => {
                if (s <= 1) {
                  clearInterval(coolRef.current);
                  if (mountedRef.current) setPhase('idle');
                  return 30;
                }
                return s - 1;
              });
            }, 1000);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pct = ((dailyLimit - remaining) / dailyLimit) * 100;
  const gear = GEAR_LINKS[gearIdx];

  return (
    <div className="rounded-2xl overflow-hidden"
         style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
      <div className="h-px bg-gradient-to-r from-transparent via-ea-magenta/40 to-transparent" />

      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-ea-magenta" />
            <span className="font-display font-bold text-white text-sm">Watch & Earn</span>
          </div>
          <div className="flex items-center gap-1.5">
            {hasElitePass && (
              <span className="font-mono text-[9px] text-ea-gold flex items-center gap-0.5">
                <Crown className="w-2.5 h-2.5" /> 15/day
              </span>
            )}
            <span className={`font-mono text-xs font-bold ${limitReached ? 'text-ea-muted' : 'text-ea-green'}`}>
              {claimedToday}/{dailyLimit}
            </span>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 rounded-full overflow-hidden mb-3"
             style={{ background:'rgba(30,30,58,0.8)' }}>
          <div className="h-full rounded-full transition-all duration-500"
               style={{
                 width:`${pct}%`,
                 background: pct>=100 ? '#5a5a8a'
                           : pct>=70  ? 'linear-gradient(90deg,#ff0080,#8b2fff)'
                           : 'linear-gradient(90deg,#00f5ff,#00ff88)',
               }} />
        </div>

        {/* Ad area */}
        {phase === 'playing' ? (
          <div className="rounded-xl overflow-hidden mb-3"
               style={{ minHeight:110, background:'rgba(6,6,18,0.9)', border:'1px solid rgba(255,0,128,0.25)' }}>
            {/* Real affiliate ad shown during countdown */}
            <a href={gear.href} target="_blank" rel="noopener noreferrer nofollow"
               className="flex flex-col items-center justify-center p-4 h-full gap-2 group">
              <div className="text-3xl">{gear.emoji}</div>
              <p className="font-display font-bold text-sm text-white group-hover:text-ea-cyan transition-colors text-center">
                {gear.label}
              </p>
              <p className="font-mono text-[10px] text-ea-muted">Amazon pe dekho →</p>
              <ExternalLink className="w-3 h-3 text-ea-dim" />
            </a>
            {/* Timer overlay */}
            <div className="px-3 pb-2">
              <div className="flex items-center justify-between font-mono text-[10px] text-ea-muted mb-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-ea-magenta animate-pulse inline-block" />
                  Ad playing…
                </span>
                <span className="text-ea-magenta font-bold">+1 EC in {adSec}s</span>
              </div>
              <div className="h-1 rounded-full overflow-hidden"
                   style={{ background:'rgba(30,30,58,0.8)' }}>
                <div className="h-full bg-ea-magenta rounded-full transition-all"
                     style={{ width:`${((AD_DURATION - adSec) / AD_DURATION) * 100}%` }} />
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl mb-3 flex flex-col items-center justify-center gap-1"
               style={{ minHeight:110, background:'rgba(6,6,18,0.5)', border:'1px dashed rgba(30,30,58,0.6)' }}>
            <span className="text-2xl">📺</span>
            <span className="font-mono text-[10px] text-ea-muted">Watch ad → +1 EC</span>
            {!HAS_REAL_AD && (
              <span className="font-mono text-[9px] text-ea-dim text-center px-2">
                (Ad network: configure in .env)
              </span>
            )}
          </div>
        )}

        {/* Button */}
        {limitReached ? (
          <div className="w-full py-2.5 rounded-xl text-center font-display font-bold text-sm text-ea-muted border border-ea-border">
            Daily Limit — Kal Wapas Aao
          </div>
        ) : phase === 'cooldown' ? (
          <div className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 font-display font-bold text-sm"
               style={{ background:'rgba(30,30,58,0.4)', border:'1px solid rgba(30,30,58,0.8)' }}>
            <Clock className="w-4 h-4 text-ea-muted" />
            <span className="text-ea-muted">{coolSec}s cooldown</span>
          </div>
        ) : phase === 'playing' ? (
          <div className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 font-display font-bold text-sm"
               style={{ background:'rgba(255,0,128,0.1)', border:'1px solid rgba(255,0,128,0.3)', color:'#ff0080' }}>
            <span className="animate-pulse">●</span>
            {adSec}s mein +1 EC milega
          </div>
        ) : (
          <button onClick={startAd}
            className="w-full py-2.5 rounded-xl font-display font-bold text-sm
                       flex items-center justify-center gap-2 transition-all active:scale-97"
            style={{ background:'linear-gradient(135deg,#ff0080,#8b2fff)', color:'#fff' }}>
            <Play className="w-4 h-4" fill="currentColor" />
            Watch → +1 EC ({remaining} remaining)
          </button>
        )}

        {!hasElitePass && !limitReached && (
          <p className="font-mono text-[9px] text-ea-dim text-center mt-2">
            👑 ElitePass → 15 ads/day instead of 10
          </p>
        )}
      </div>
    </div>
  );
}
