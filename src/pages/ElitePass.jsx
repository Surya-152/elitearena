// src/pages/ElitePass.jsx — Premium Membership page
import { useState, useEffect }    from 'react';
import { useSEO }                 from '../hooks/useSEO';
import { useAuth }                from '../context/AuthContext';
import {
  purchaseElitePass, isPassActive, passExpiryInfo,
} from '../services/elitePassService';
import { ELITE_PASS }             from '../config/payments';
import {
  Crown, Zap, Check, Loader, Star, Shield,
  Calendar, TrendingUp, Gift,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function ElitePass() {
  const { userProfile } = useAuth();
  useSEO({ title:'ElitePass Premium', description:'EliteArena ka premium membership. Extra EC, exclusive tournaments aur ad-free experience.' });

  const [buying, setBuying] = useState(false);
  const active  = isPassActive(userProfile);
  const expInfo = passExpiryInfo(userProfile);
  const balance = userProfile?.elite_coins_balance || 0;
  const canAfford = balance >= ELITE_PASS.priceEC;

  const handleBuy = async () => {
    if (!userProfile) { toast.error('Login karo pehle.'); return; }
    setBuying(true);
    try {
      await purchaseElitePass(userProfile.uid);
      toast.success(`👑 ElitePass active ho gaya! +${ELITE_PASS.monthlyBonusEC} EC bonus mila!`, { duration: 5000 });
    } catch (e) {
      toast.error(e.message);
    } finally {
      setBuying(false);
    }
  };

  return (
    <div className="min-h-screen bg-ea-void pt-20 pb-16 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-cyber-grid opacity-15 pointer-events-none" />
      {/* Gold glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full pointer-events-none"
           style={{ background:'radial-gradient(#ffb800, transparent)', opacity:0.04, filter:'blur(60px)' }} />

      <div className="relative max-w-2xl mx-auto animate-fade-up">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-5"
               style={{ background:'linear-gradient(135deg,#ffb800,#ff6b00)', boxShadow:'0 0 40px rgba(255,184,0,0.3)' }}>
            <Crown className="w-10 h-10 text-white" fill="white" />
          </div>
          <h1 className="font-display font-bold text-4xl sm:text-5xl text-white mb-2">
            Elite<span style={{ background:'linear-gradient(135deg,#ffb800,#ff6b00)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>Pass</span>
          </h1>
          <p className="font-body text-ea-muted text-lg">Arena ka premium membership — ek mahine ke liye</p>
        </div>

        {/* Active status banner */}
        {active && expInfo && (
          <div className="rounded-2xl p-5 mb-6 flex items-center gap-4"
               style={{ background:'rgba(255,184,0,0.08)', border:'1px solid rgba(255,184,0,0.3)' }}>
            <Crown className="w-8 h-8 text-ea-gold flex-shrink-0" fill="currentColor" />
            <div>
              <p className="font-display font-bold text-ea-gold text-lg">ElitePass Active! 👑</p>
              <p className="text-ea-muted text-sm">
                {expInfo.days} din baaki hain •{' '}
                Expires: {expInfo.expiry.toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}
              </p>
            </div>
          </div>
        )}

        {/* Main card */}
        <div className="rounded-3xl overflow-hidden mb-6"
             style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(255,184,0,0.2)' }}>
          {/* Top gradient bar */}
          <div className="h-1" style={{ background:'linear-gradient(90deg,#ffb800,#ff6b00,#ffb800)' }} />

          <div className="p-7">
            {/* Price */}
            <div className="flex items-end justify-between mb-6">
              <div>
                <div className="font-display font-bold text-3xl sm:text-5xl text-white">
                  {ELITE_PASS.priceEC}
                  <span className="text-ea-gold text-2xl ml-1">EC</span>
                </div>
                <div className="font-mono text-ea-muted text-sm mt-1">= ₹{ELITE_PASS.priceINR} / month</div>
              </div>
              <div className="text-right">
                <div className="badge-gold text-sm px-3 py-1">1 Month</div>
                <p className="text-ea-dim text-xs mt-1">Auto-expires</p>
              </div>
            </div>

            {/* Features */}
            <div className="space-y-3 mb-7">
              {ELITE_PASS.features.map((f, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                       style={{ background:'rgba(255,184,0,0.15)', border:'1px solid rgba(255,184,0,0.3)' }}>
                    <Check className="w-3 h-3 text-ea-gold" />
                  </div>
                  <span className="font-body text-sm text-ea-text">{f}</span>
                </div>
              ))}
            </div>

            {/* Balance display */}
            <div className="rounded-xl p-3 mb-5 flex items-center justify-between"
                 style={{ background:'rgba(6,6,18,0.6)' }}>
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-ea-gold" />
                <span className="font-body text-sm text-ea-muted">Your balance:</span>
              </div>
              <span className="font-mono font-bold text-ea-gold">{balance.toLocaleString()} EC</span>
            </div>

            {active ? (
              <div className="w-full py-4 rounded-2xl font-display font-bold text-center text-lg"
                   style={{ background:'rgba(255,184,0,0.1)', border:'1px solid rgba(255,184,0,0.3)', color:'#ffb800' }}>
                👑 ElitePass Active — {expInfo?.days} din baaki
              </div>
            ) : !canAfford ? (
              <div className="space-y-3">
                <div className="w-full py-4 rounded-2xl font-display font-bold text-center text-ea-muted cursor-not-allowed"
                     style={{ background:'rgba(30,30,58,0.5)', border:'1px solid rgba(30,30,58,0.8)' }}>
                  Balance Insufficient ({balance}/{ELITE_PASS.priceEC} EC)
                </div>
                <p className="text-center text-ea-muted text-xs font-body">
                  {ELITE_PASS.priceEC - balance} EC aur chahiye.{' '}
                  <a href="/wallet" className="text-ea-cyan underline">Deposit karo →</a>
                </p>
              </div>
            ) : (
              <button onClick={handleBuy} disabled={buying}
                className="w-full py-4 rounded-2xl font-display font-bold text-lg
                           flex items-center justify-center gap-3 transition-all active:scale-97"
                style={{ background:'linear-gradient(135deg,#ffb800,#ff6b00)',
                         boxShadow: buying ? 'none' : '0 0 30px rgba(255,184,0,0.4)', color:'#02020a' }}>
                {buying ? <Loader className="w-5 h-5 animate-spin" /> : <Crown className="w-5 h-5" fill="currentColor" />}
                {buying ? 'Activating…' : `Activate ElitePass — ${ELITE_PASS.priceEC} EC`}
              </button>
            )}
          </div>
        </div>

        {/* Benefits grid */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon:Gift,       title:`+${ELITE_PASS.monthlyBonusEC} EC Bonus`,   desc:'Activate hone pe turant',      color:'gold'    },
            { icon:Star,       title:'Exclusive Tournaments', desc:'Only ElitePass members ke liye',     color:'magenta' },
            { icon:TrendingUp, title:`${10+ELITE_PASS.adLimitBonus} Ads/Day`,  desc:'Extra 5 ads earn kar sakte ho', color:'cyan'    },
            { icon:Shield,     title:'Priority Registration', desc:'Tournaments mein pehle slot milta hai', color:'green' },
          ].map(({ icon:Icon, title, desc, color }) => (
            <div key={title} className="rounded-2xl p-4"
                 style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
              <Icon className={`w-5 h-5 mb-2
                ${color==='gold'?'text-ea-gold':color==='magenta'?'text-ea-magenta':color==='cyan'?'text-ea-cyan':'text-ea-green'}`} />
              <p className="font-display font-bold text-white text-sm">{title}</p>
              <p className="font-body text-ea-muted text-xs mt-1">{desc}</p>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div className="mt-6 rounded-2xl p-5"
             style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
          <h3 className="font-display font-bold text-white mb-4">Aksar Puche Jaane Wale Sawaal</h3>
          <div className="space-y-4">
            {[
              { q:'ElitePass kaise khareedein?', a:`${ELITE_PASS.priceEC} EC chahiye. "Activate" button dabao — EC turant deduct hoga aur pass active ho jayega.` },
              { q:'Auto-renewal hota hai?', a:'Nahi. Ek mahine baad automatically expire ho jaata hai. Dobara manually renew karna hoga.' },
              { q:'Kya refund milta hai?', a:'Ek baar activate hone ke baad refund nahi hota. Carefully decide karo.' },
              { q:'EC kahan se aata hai?', a:'Tournaments jeeto, ads dekho, ya UPI se deposit karo EC pane ke liye.' },
            ].map(({ q, a }) => (
              <div key={q}>
                <p className="font-body text-sm text-white font-medium">Q: {q}</p>
                <p className="font-body text-sm text-ea-muted mt-0.5">A: {a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
