// src/components/user/WalletPanel.jsx
import { useAuth }  from '../../context/AuthContext';
import { Trophy, TrendingUp, Target, Zap } from 'lucide-react';

export default function WalletPanel() {
  const { userProfile } = useAuth();
  if (!userProfile) return null;

  const stats = [
    { label:'EliteCoins',     value:`${(userProfile.elite_coins_balance??0).toLocaleString()} EC`, icon:Zap,         cls:'cyan'    },
    { label:'Total Winnings', value:`${(userProfile.total_winnings??0).toLocaleString()} EC`,       icon:Trophy,      cls:'gold'    },
    { label:'Matches Played', value:(userProfile.matches_played??0).toLocaleString(),               icon:Target,      cls:'magenta' },
    { label:'Win Rate',       value:userProfile.matches_played>0?'—':'—',                           icon:TrendingUp,  cls:'green'   },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map(({ label, value, icon:Icon, cls }) => (
        <div key={label} className={`stat-card ${cls}`}>
          <Icon className={`w-4 h-4 mb-2
            ${cls==='cyan'?'text-ea-cyan':cls==='gold'?'text-ea-gold':cls==='magenta'?'text-ea-magenta':'text-ea-green'}`} />
          <div className={`font-display font-bold text-xl leading-tight
            ${cls==='cyan'?'text-ea-cyan':cls==='gold'?'text-ea-gold':cls==='magenta'?'text-ea-magenta':'text-ea-green'}`}>
            {value}
          </div>
          <div className="font-body text-xs text-ea-muted mt-1">{label}</div>
        </div>
      ))}
    </div>
  );
}
