// src/pages/Home.jsx — STUNNING ESPORTS LANDING PAGE
import { Link }        from 'react-router-dom';
import { useAuth }     from '../context/AuthContext';
import { useSEO, SEO_PAGES } from '../hooks/useSEO';
import { Zap, Trophy, Shield, Users, ChevronRight, Star, TrendingUp, Clock, Target } from 'lucide-react';
import { usePlatformStats } from '../hooks/usePlatformStats';
export default function Home() {
  const { isLoggedIn } = useAuth();
  const { stats: pStats } = usePlatformStats();
  useSEO(SEO_PAGES.home);

  return (
    <div className="min-h-screen bg-ea-void overflow-x-hidden">

      {/* ── HERO ──────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center px-4 pt-20">

        {/* Multi-layer background */}
        <div className="absolute inset-0 bg-cyber-grid opacity-20" />
        <div className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(0,245,255,0.05) 0%, transparent 70%)' }} />
        <div className="absolute bottom-0 inset-x-0 h-64"
          style={{ background: 'linear-gradient(to top, #02020a, transparent)' }} />

        {/* Animated corner decorations */}
        <div className="absolute top-24 left-8 w-32 h-32 opacity-20 pointer-events-none">
          <div className="absolute inset-0 border-l-2 border-t-2 border-ea-cyan rounded-tl-2xl" />
          <div className="absolute top-3 left-3 w-2 h-2 bg-ea-cyan rounded-full animate-pulse" />
        </div>
        <div className="absolute top-24 right-8 w-32 h-32 opacity-20 pointer-events-none">
          <div className="absolute inset-0 border-r-2 border-t-2 border-ea-magenta rounded-tr-2xl" />
          <div className="absolute top-3 right-3 w-2 h-2 bg-ea-magenta rounded-full animate-pulse" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto text-center">

          {/* Status pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8
                          bg-ea-surface/80 border border-ea-cyan/20 backdrop-blur-sm
                          animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-ea-green animate-pulse" />
            <span className="font-mono text-xs text-ea-cyan tracking-wider">
              LIVE — India's #1 Esports Platform
            </span>
          </div>

          {/* Main headline */}
          <h1 className="font-display font-bold leading-none mb-6 animate-fade-up"
              style={{ fontSize: 'clamp(48px, 8vw, 96px)' }}>
            <div className="text-white mb-2">COMPETE.</div>
            <div className="mb-2" style={{
              background: 'linear-gradient(135deg, #00f5ff 0%, #8b2fff 50%, #ff0080 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>DOMINATE.</div>
            <div className="text-white">WIN REAL PRIZES.</div>
          </h1>

          <p className="font-body text-ea-muted text-lg sm:text-xl max-w-2xl mx-auto mb-10
                        leading-relaxed animate-fade-up" style={{ animationDelay: '0.1s' }}>
            India's most transparent esports platform.
            BGMI, Free Fire MAX, COD Mobile tournaments with{' '}
            <span className="text-ea-gold font-medium">real prize pools</span>,
            UPI deposit & instant withdrawal.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16
                          animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <Link to={isLoggedIn ? '/dashboard' : '/register'}
              className="btn-neon-cyan px-8 py-4 rounded-xl text-base flex items-center gap-2 w-full sm:w-auto justify-center">
              <Zap className="w-5 h-5" fill="currentColor" />
              {isLoggedIn ? 'Enter Arena' : 'Start for Free'}
              <ChevronRight className="w-4 h-4" />
            </Link>
            <Link to="/leaderboard"
              className="btn-ghost px-8 py-4 rounded-xl text-base flex items-center gap-2 w-full sm:w-auto justify-center">
              <Trophy className="w-5 h-5" />
              View Rankings
            </Link>
          </div>

          {/* Live stats strip */}
          <div className="flex items-center justify-center gap-8 sm:gap-16 animate-fade-up"
               style={{ animationDelay: '0.3s' }}>
            {[
              {
                label: 'Active Tournaments',
                value: pStats ? (pStats.activeTourneys > 0 ? `${pStats.activeTourneys}` : '0') : '…',
                color: 'text-ea-cyan',
              },
              {
                label: 'Prize Pool (EC)',
                value: pStats ? (pStats.totalPrizeEC > 0 ? `${pStats.totalPrizeEC.toLocaleString()}` : '0') : '…',
                color: 'text-ea-gold',
              },
              {
                label: 'Registered Players',
                value: pStats ? (pStats.totalUsers > 0 ? pStats.totalUsers.toLocaleString() : '0') : '…',
                color: 'text-ea-magenta',
              },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <div className={`font-display font-bold text-2xl sm:text-3xl ${color}`}>{value}</div>
                <div className="font-mono text-[10px] text-ea-muted uppercase tracking-widest mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2
                        opacity-50 animate-float">
          <div className="w-px h-8 bg-gradient-to-b from-ea-cyan to-transparent" />
          <div className="w-1.5 h-1.5 rounded-full bg-ea-cyan" />
        </div>
      </section>

      {/* ── GAMES SECTION ─────────────────────────────────────────────────── */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-12">
            <span className="font-mono text-xs text-ea-cyan tracking-widest uppercase">Supported Games</span>
            <h2 className="font-display font-bold text-4xl text-white mt-2">
              Pick Your <span className="grad-magenta">Arena</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                name: 'BGMI',      emoji: '🎯',
                desc: 'Battlegrounds Mobile India — Team & Solo tournaments',
                color: 'from-blue-900/40 to-cyan-900/20',
                accent: 'ea-cyan', glow: 'cyan',
                prize: 'View Live →',
              },
              {
                name: 'Free Fire MAX', emoji: '🔥',
                desc: 'Garena Free Fire MAX — Fast-paced BR action',
                color: 'from-pink-900/40 to-red-900/20',
                accent: 'ea-magenta', glow: 'magenta',
                prize: 'View Live →',
                featured: true,
              },
              {
                name: 'COD Mobile', emoji: '💥',
                desc: 'Call of Duty Mobile — TDM & Battle Royale',
                color: 'from-green-900/40 to-teal-900/20',
                accent: 'ea-green', glow: 'green',
                prize: 'View Live →',
              },
            ].map((g, i) => (
              <div key={g.name}
                className={`relative rounded-2xl overflow-hidden bg-gradient-to-br ${g.color}
                             border transition-all duration-300 group cursor-pointer
                             hover:-translate-y-1
                             ${g.featured ? 'border-ea-magenta/40' : 'border-ea-border hover:border-ea-border/80'}`}
                style={{ animationDelay: `${i * 0.1}s` }}>
                {g.featured && (
                  <div className="absolute top-0 inset-x-0 text-center">
                    <span className="inline-block bg-ea-magenta text-white font-mono text-[10px]
                                     px-4 py-1 uppercase tracking-widest">Most Popular</span>
                  </div>
                )}
                <div className="p-6 pt-8">
                  <div className="text-4xl mb-3">{g.emoji}</div>
                  <h3 className="font-display font-bold text-xl text-white mb-1">{g.name}</h3>
                  <p className="font-body text-sm text-ea-muted mb-4 leading-relaxed">{g.desc}</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-mono text-[10px] text-ea-muted uppercase tracking-wider">Prize Pool</div>
                      <div className={`font-display font-bold text-lg text-${g.accent}`}>{g.prize}</div>
                    </div>
                    <Link to={isLoggedIn ? '/dashboard' : '/register'}
                      className="px-4 py-2 rounded-xl font-display font-bold text-xs tracking-wide
                                 transition-all duration-200 group-hover:scale-105"
                      style={{
                        background: g.glow === 'cyan'    ? 'linear-gradient(135deg,#00f5ff,#0080ff)' :
                                    g.glow === 'magenta' ? 'linear-gradient(135deg,#ff0080,#8b2fff)' :
                                                           'linear-gradient(135deg,#00ff88,#00c8ff)',
                        color: '#02020a',
                      }}>
                      Play Now →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────── */}
      <section className="relative py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-3">
              Kaise Kaam Karta Hai?
            </h2>
            <p className="font-body text-ea-muted">4 simple steps mein paise kamao</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { step:'01', icon:'📝', title:'Register Karo',    desc:'Free account banao. Google se ek click mein ya email se.',      color:'cyan'    },
              { step:'02', icon:'💰', title:'EC Deposit Karo',  desc:'UPI se deposit karo ya ads dekh ke free EC kamao.',             color:'gold'    },
              { step:'03', icon:'🎮', title:'Tournament Join',  desc:'BGMI, Free Fire ya COD Mobile tournament join karo.',           color:'magenta' },
              { step:'04', icon:'🏆', title:'Jeet aur Withdraw',desc:'Prize jeeto aur 10 minute mein UPI pe withdraw karo.',          color:'green'   },
            ].map(({step,icon,title,desc,color}) => (
              <div key={step} className="relative rounded-2xl p-5 text-center"
                   style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
                <div className={`font-mono text-xs font-bold mb-3 inline-block px-2 py-1 rounded-lg
                  ${color==='cyan'?'text-ea-cyan bg-ea-cyan/10':color==='gold'?'text-ea-gold bg-ea-gold/10':color==='magenta'?'text-ea-magenta bg-ea-magenta/10':'text-ea-green bg-ea-green/10'}`}>
                  Step {step}
                </div>
                <div className="text-4xl mb-3">{icon}</div>
                <h3 className="font-display font-bold text-white text-base mb-2">{title}</h3>
                <p className="font-body text-ea-muted text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>



      {/* ── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section className="relative py-20 px-4">
        <div className="absolute inset-0 bg-ea-deep/40" />
        <div className="relative max-w-5xl mx-auto">

          <div className="text-center mb-14">
            <span className="font-mono text-xs text-ea-magenta tracking-widest uppercase">Simple Process</span>
            <h2 className="font-display font-bold text-4xl text-white mt-2">
              4 Steps to <span className="grad-gold">Victory</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {[
              { n:'01', icon: Users,    title:'Register Free',     desc:'Account banao — 30 seconds',          color:'cyan'    },
              { n:'02', icon: Zap,      title:'Earn EliteCoins',   desc:'Deposit via UPI or watch ads',         color:'gold'    },
              { n:'03', icon: Target,   title:'Join Tournament',   desc:'Entry fee pay karo, match join karo',  color:'magenta' },
              { n:'04', icon: Trophy,   title:'Win & Withdraw',    desc:'Jeeto, UPI pe withdraw karo 10 min mein', color:'green' },
            ].map(({ n, icon: Icon, title, desc, color }, i) => (
              <div key={n} className="relative text-center">
                {/* Connector line */}
                {i < 3 && (
                  <div className="hidden sm:block absolute top-8 left-[calc(50%+2rem)] right-0
                                  h-px bg-gradient-to-r from-ea-border to-transparent" />
                )}

                <div className={`w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4
                                  relative overflow-hidden
                  ${color==='cyan'    ? 'bg-ea-cyan/10 border border-ea-cyan/25' :
                    color==='gold'    ? 'bg-ea-gold/10 border border-ea-gold/25' :
                    color==='magenta' ? 'bg-ea-magenta/10 border border-ea-magenta/25' :
                                        'bg-ea-green/10 border border-ea-green/25'}`}>
                  <Icon className={`w-7 h-7
                    ${color==='cyan'    ? 'text-ea-cyan'    :
                      color==='gold'    ? 'text-ea-gold'    :
                      color==='magenta' ? 'text-ea-magenta' : 'text-ea-green'}`} />
                  <div className="absolute top-0 right-0 font-mono text-[10px] font-bold
                                   text-ea-dim leading-none p-1">{n}</div>
                </div>
                <h3 className="font-display font-bold text-sm text-white mb-1">{title}</h3>
                <p className="font-body text-xs text-ea-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ─────────────────────────────────────────────────── */}
      <section className="relative py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <span className="font-mono text-xs text-ea-green tracking-widest uppercase">Why EliteArena</span>
            <h2 className="font-display font-bold text-4xl text-white mt-2">
              Built for <span className="grad-cyan">Champions</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon:'⚡', title:'Real-time Slots',       desc:'onSnapshot — slot updates instantly across all players. No refresh needed.',                             color:'cyan'    },
              { icon:'🔒', title:'Atomic Transactions',   desc:'Firestore runTransaction prevents double-spend or over-filling. Bank-level guarantee.',                  color:'green'   },
              { icon:'💸', title:'10-Min Withdrawal',     desc:'Cloud Function auto-processes UPI payout in 10 minutes. Scheduled, not manual.',                        color:'gold'    },
              { icon:'🏆', title:'Live Leaderboard',      desc:'Real-time Hall of Champions. Rankings update every second via Firebase.',                               color:'magenta' },
              { icon:'🔔', title:'Push Notifications',    desc:'In-app alerts — prize credited, match live, deposit approved. Never miss anything.',                     color:'purple'  },
              { icon:'📱', title:'Mobile First',          desc:'Designed for phone gamers. Every pixel optimized for BGMI & Free Fire players.',                        color:'cyan'    },
            ].map(({ icon, title, desc, color }) => (
              <div key={title}
                className="group p-5 rounded-2xl border border-ea-border
                           bg-ea-card/60 backdrop-blur-sm
                           hover:border-ea-rim transition-all duration-300
                           hover:-translate-y-1 hover:shadow-card-hover">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 text-xl
                                  transition-all duration-300 group-hover:scale-110
                  ${color==='cyan'    ? 'bg-ea-cyan/10 border border-ea-cyan/20'    :
                    color==='green'   ? 'bg-ea-green/10 border border-ea-green/20'  :
                    color==='gold'    ? 'bg-ea-gold/10 border border-ea-gold/20'    :
                    color==='magenta' ? 'bg-ea-magenta/10 border border-ea-magenta/20':
                    color==='purple'  ? 'bg-purple-500/10 border border-purple-500/20':
                                        'bg-ea-cyan/10 border border-ea-cyan/20'}`}>
                  {icon}
                </div>
                <h3 className="font-display font-bold text-base text-white mb-2">{title}</h3>
                <p className="font-body text-sm text-ea-muted leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ────────────────────────────────────────────────────── */}
      <section className="relative py-20 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl p-10 text-center"
               style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.06), rgba(255,0,128,0.06))' }}>
            <div className="absolute inset-0 rounded-3xl"
                 style={{ background: 'linear-gradient(135deg, rgba(0,245,255,0.1), transparent, rgba(255,0,128,0.1))',
                          WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                          WebkitMaskComposite: 'xor', maskComposite: 'exclude', padding: '1px' }} />

            <Star className="w-8 h-8 mx-auto mb-4 text-ea-gold" fill="currentColor" />
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mb-3">
              Ready to be a <span className="grad-gold">Champion?</span>
            </h2>
            <p className="font-body text-ea-muted mb-8">
              Join {pStats && pStats.totalUsers > 0 ? `${pStats.totalUsers.toLocaleString()}+` : 'thousands of'} players already competing on EliteArena.
            </p>
            <Link to={isLoggedIn ? '/dashboard' : '/register'}
              className="btn-neon-magenta inline-flex items-center gap-2 px-10 py-4 rounded-xl text-lg">
              <Zap className="w-5 h-5" fill="currentColor" />
              {isLoggedIn ? 'Go to Dashboard' : 'Create Free Account'}
            </Link>
            <p className="font-mono text-[11px] text-ea-dim mt-4">No credit card required • Free to register</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-ea-border py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-gradient-to-br from-ea-cyan to-ea-magenta
                              flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-ea-void" fill="currentColor" />
              </div>
              <span className="font-display font-bold text-sm text-white">Elite<span className="text-ea-cyan">Arena</span></span>
            </div>
            <div className="flex items-center gap-6">
              {[{to:'/privacy',l:'Privacy'},{to:'/terms',l:'Terms'},{to:'/support',l:'Support'},{to:'/leaderboard',l:'Leaderboard'}].map(({to,l}) => (
                <Link key={to} to={to} className="font-body text-xs text-ea-muted hover:text-ea-text transition-colors">{l}</Link>
              ))}
            </div>
            <p className="font-mono text-[11px] text-ea-dim">© {new Date().getFullYear()} EliteArena • All rights reserved</p>
          </div>
          <div className="mt-6 pt-6 border-t border-ea-border/50 text-center">
            <p className="font-body text-[11px] text-ea-dim max-w-2xl mx-auto">
              EliteArena is a skill-based gaming platform. Real money transactions require 18+ age and KYC.
              This is not gambling — prizes are awarded based on gaming skill.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
