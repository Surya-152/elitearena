// src/components/common/Footer.jsx
// Social links: update VITE_SOCIAL_* in .env after deploy
import { Link } from 'react-router-dom';
import { Zap, MessageCircle, Instagram, Youtube, Send } from 'lucide-react';

// Social links from .env — aapke actual links daalo .env mein
const SOCIAL = {
  whatsapp:  import.meta.env.VITE_SOCIAL_WHATSAPP  || '',
  instagram: import.meta.env.VITE_SOCIAL_INSTAGRAM  || '',
  youtube:   import.meta.env.VITE_SOCIAL_YOUTUBE    || '',
  telegram:  import.meta.env.VITE_SOCIAL_TELEGRAM   || '',
};

const SOCIAL_LINKS = [
  { icon: MessageCircle, label:'WhatsApp',  color:'#25D366', href: SOCIAL.whatsapp,  show: !!SOCIAL.whatsapp  },
  { icon: Instagram,     label:'Instagram', color:'#E1306C', href: SOCIAL.instagram, show: !!SOCIAL.instagram },
  { icon: Youtube,       label:'YouTube',   color:'#FF0000', href: SOCIAL.youtube,   show: !!SOCIAL.youtube   },
  { icon: Send,          label:'Telegram',  color:'#2CA5E0', href: SOCIAL.telegram,  show: !!SOCIAL.telegram  },
].filter(s => s.show);

export default function Footer() {
  return (
    <footer className="border-t border-ea-border bg-ea-void py-10 px-4">
      <div className="max-w-7xl mx-auto">

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-8">

          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-ea-cyan to-ea-magenta flex items-center justify-center">
                <Zap className="w-4 h-4 text-ea-void" fill="currentColor" />
              </div>
              <span className="font-display font-bold text-white">Elite<span className="text-ea-cyan">Arena</span></span>
            </div>
            <p className="font-body text-xs text-ea-muted leading-relaxed mb-4">
              India's #1 skill-based esports tournament platform. BGMI, Free Fire MAX, COD Mobile.
            </p>
            {/* Social links — only show if configured in .env */}
            {SOCIAL_LINKS.length > 0 && (
              <div className="flex gap-2">
                {SOCIAL_LINKS.map(({ icon:Icon, label, color, href }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    title={label}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    style={{ background:`${color}20`, border:`1px solid ${color}40` }}>
                    <Icon className="w-4 h-4" style={{ color }} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* Platform */}
          <div>
            <p className="font-mono text-xs text-ea-dim uppercase tracking-wider mb-3">Platform</p>
            <div className="space-y-2">
              {[
                { to:'/dashboard',    l:'Tournaments'  },
                { to:'/leaderboard',  l:'Rankings'     },
                { to:'/news',         l:'News & Tips'  },
                { to:'/team',         l:'Teams'        },
                { to:'/achievements', l:'Achievements' },
              ].map(({to,l}) => (
                <Link key={to} to={to} className="block font-body text-xs text-ea-muted hover:text-ea-text transition-colors">{l}</Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <p className="font-mono text-xs text-ea-dim uppercase tracking-wider mb-3">Account</p>
            <div className="space-y-2">
              {[
                { to:'/elite-pass', l:'ElitePass 👑' },
                { to:'/stats',      l:'My Stats'    },
                { to:'/wallet',     l:'Wallet'       },
                { to:'/kyc',        l:'KYC'          },
                { to:'/support',    l:'Support'      },
              ].map(({to,l}) => (
                <Link key={to} to={to} className="block font-body text-xs text-ea-muted hover:text-ea-text transition-colors">{l}</Link>
              ))}
            </div>
          </div>

          {/* Legal */}
          <div>
            <p className="font-mono text-xs text-ea-dim uppercase tracking-wider mb-3">Legal</p>
            <div className="space-y-2">
              {[
                { to:'/privacy',    l:'Privacy Policy'   },
                { to:'/terms',      l:'Terms of Service' },
                { to:'/compliance', l:'TDS & GST Info'   },
              ].map(({to,l}) => (
                <Link key={l} to={to} className="block font-body text-xs text-ea-muted hover:text-ea-text transition-colors">{l}</Link>
              ))}
            </div>
          </div>
        </div>

        <div className="h-px w-full mb-5"
             style={{ background:'linear-gradient(90deg,transparent,rgba(30,30,58,0.8) 30%,rgba(30,30,58,0.8) 70%,transparent)' }} />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-mono text-[11px] text-ea-dim">© {new Date().getFullYear()} EliteArena • All rights reserved</p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="font-mono text-[10px] text-ea-dim">🇮🇳 Made in India</span>
            <span className="font-mono text-[10px] text-ea-dim">18+ only</span>
            <span className="font-mono text-[10px] text-ea-dim">Skill-based Gaming</span>
          </div>
        </div>

        <p className="font-body text-[10px] text-ea-dim text-center mt-4 max-w-3xl mx-auto leading-relaxed">
          EliteArena ek skill-based gaming platform hai. 18+ age aur KYC required hai real money transactions ke liye.
          30% TDS applicable on winnings above ₹10,000 (Finance Act 2023, Sec 194BA). 28% GST applicable.
          Restricted: Assam, Andhra Pradesh, Meghalaya, Nagaland, Odisha, Sikkim, Telangana.
          Responsible Gaming helpline: iCall — 9152987821.
        </p>
      </div>
    </footer>
  );
}
