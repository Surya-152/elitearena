// src/pages/Wallet.jsx — Complete wallet with DailyReward + ElitePass + Fee info
import { Link }                from 'react-router-dom';
import { Zap, Trophy, Target, Crown, Gift, TrendingUp } from 'lucide-react';
import { useAuth }             from '../context/AuthContext';
import { useSEO }              from '../hooks/useSEO';
import { useAdRewards }        from '../hooks/useAdRewards';
import { formatINR, ecToINR, PAYMENT_CONFIG } from '../config/payments';
import { isPassActive, passExpiryInfo }        from '../services/elitePassService';
import AdRewardPanel           from '../components/user/AdRewardPanel';
import DailyRewardPanel        from '../components/user/DailyRewardPanel';
import SpinWheel               from '../components/user/SpinWheel';
import DepositPanel            from '../components/user/DepositPanel';
import WithdrawalPanel         from '../components/user/WithdrawalPanel';
import TransactionHistory      from '../components/user/TransactionHistory';

export default function Wallet() {
  const { userProfile } = useAuth();
  useSEO({ title:'My Wallet', description:'EliteCoins deposit, withdrawal aur earnings.', noIndex:true });

  const { claimedToday, dailyLimit, limitReached } = useAdRewards(userProfile?.uid, userProfile);
  const hasPass  = isPassActive(userProfile);
  const expInfo  = passExpiryInfo(userProfile);

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-ea-void flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border-2 border-ea-cyan/20 border-t-ea-cyan animate-spin" />
      </div>
    );
  }

  const balance    = userProfile.elite_coins_balance ?? 0;
  const inrBalance = ecToINR(balance);
  const feePercent = PAYMENT_CONFIG.withdrawalFeePercent || 5;

  const stats = [
    { label:'EC Balance',     value:`${balance.toLocaleString()} EC`,                          icon:Zap,        color:'gold',    desc:`≈ ${formatINR(inrBalance)}` },
    { label:'Total Winnings', value:`${(userProfile.total_winnings ?? 0).toLocaleString()} EC`, icon:Trophy,     color:'cyan',    desc:'All-time prize earnings' },
    { label:'Matches Played', value:(userProfile.matches_played ?? 0).toString(),               icon:Target,     color:'magenta', desc:'Tournaments joined' },
    { label:'Ads Today',      value:`${claimedToday}/${dailyLimit}`,                           icon:TrendingUp, color: limitReached ? 'muted' : 'green', desc: hasPass ? '👑 ElitePass limit' : 'Regular limit' },
  ];

  const colorMap = {
    gold:   { text:'text-ea-gold',    border:'border-ea-gold/20',    bg:'bg-ea-gold/6'    },
    cyan:   { text:'text-ea-cyan',    border:'border-ea-cyan/20',    bg:'bg-ea-cyan/6'    },
    magenta:{ text:'text-ea-magenta', border:'border-ea-magenta/20', bg:'bg-ea-magenta/6' },
    green:  { text:'text-ea-green',   border:'border-ea-green/20',   bg:'bg-ea-green/6'   },
    muted:  { text:'text-ea-muted',   border:'border-ea-border',     bg:'bg-ea-surface/30'},
  };

  return (
    <div className="min-h-screen bg-ea-void pt-20 pb-12 px-4">
      <div className="fixed inset-0 bg-cyber-grid opacity-20 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto space-y-6 animate-fade-up">

        {/* Header */}
        <div>
          <h1 className="font-display font-bold text-3xl sm:text-4xl text-white">
            My <span className="text-ea-gold">Wallet</span>
          </h1>
          <p className="text-ea-muted font-body mt-1 text-sm">
            EliteCoins · UPI se deposit · UPI pe withdraw
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {stats.map(({ label, value, icon:Icon, color, desc }) => {
            const cls = colorMap[color] || colorMap.muted;
            return (
              <div key={label} className={`rounded-2xl p-4 border ${cls.border} ${cls.bg}`}>
                <Icon className={`w-4 h-4 mb-2 ${cls.text}`} />
                <div className={`font-display font-bold text-xl ${cls.text}`}>{value}</div>
                <div className="font-body text-xs text-ea-muted mt-1">{label}</div>
                {desc && <div className="font-mono text-[10px] text-ea-dim mt-0.5">{desc}</div>}
              </div>
            );
          })}
        </div>

        {/* ElitePass card — show upsell or status */}
        {hasPass ? (
          <div className="rounded-2xl p-4 flex items-center gap-4"
               style={{ background:'rgba(255,184,0,0.06)', border:'1px solid rgba(255,184,0,0.25)' }}>
            <Crown className="w-8 h-8 text-ea-gold flex-shrink-0" fill="currentColor" />
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-ea-gold">👑 ElitePass Active</p>
              <p className="font-mono text-xs text-ea-muted">
                {expInfo ? `${expInfo.days} din baaki · Expires ${expInfo.expiry.toLocaleDateString('en-IN')}` : ''}
                {' · '}15 ads/day · Exclusive tournaments
              </p>
            </div>
            <Link to="/elite-pass" className="font-mono text-xs text-ea-gold hover:underline flex-shrink-0">
              Renew →
            </Link>
          </div>
        ) : (
          <div className="rounded-2xl p-4 flex items-center gap-4 cursor-pointer group"
               style={{ background:'rgba(255,184,0,0.04)', border:'1px dashed rgba(255,184,0,0.2)' }}>
            <Crown className="w-8 h-8 text-ea-gold/50 flex-shrink-0 group-hover:text-ea-gold transition-colors" />
            <div className="flex-1">
              <p className="font-display font-bold text-ea-text text-sm">ElitePass — ₹99/month</p>
              <p className="font-mono text-[11px] text-ea-muted">
                15 ads/day · +50 EC bonus · Exclusive tournaments · 👑 badge
              </p>
            </div>
            <Link to="/elite-pass"
              className="flex-shrink-0 px-3 py-1.5 rounded-xl font-display font-bold text-xs text-ea-void"
              style={{ background:'linear-gradient(135deg,#ffb800,#ff6b00)' }}>
              Activate
            </Link>
          </div>
        )}

        {/* Fee info banner */}
        <div className="rounded-xl px-4 py-2.5 flex items-center gap-2"
             style={{ background:'rgba(0,245,255,0.04)', border:'1px solid rgba(0,245,255,0.12)' }}>
          <Zap className="w-3.5 h-3.5 text-ea-cyan flex-shrink-0" />
          <p className="font-mono text-[11px] text-ea-muted">
            Withdrawal fee: <span className="text-ea-cyan">{feePercent}%</span> platform charge ·{' '}
            Min withdrawal: <span className="text-ea-cyan">{PAYMENT_CONFIG.minWithdrawal} EC</span> ·{' '}
            Min deposit: <span className="text-ea-cyan">₹{PAYMENT_CONFIG.minDeposit}</span>
          </p>
        </div>

        {/* Main content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Left — Deposit + Withdraw */}
          <div className="lg:col-span-2 space-y-5">
            <DepositPanel />
            <WithdrawalPanel />
            <TransactionHistory />
          </div>

          {/* Right — Earn EC */}
          <div className="space-y-4">
            <div className="rounded-2xl p-4" style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
              <div className="flex items-center gap-2 mb-3">
                <Gift className="w-4 h-4 text-ea-green" />
                <span className="font-display font-bold text-white text-sm">Free EC Kamao</span>
              </div>
  <SpinWheel />
            <DailyRewardPanel />
            </div>
            <AdRewardPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
