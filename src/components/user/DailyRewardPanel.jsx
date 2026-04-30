// src/components/user/DailyRewardPanel.jsx
import { useState } from 'react';
import { Gift, Loader, Flame, CheckCircle } from 'lucide-react';
import { claimDailyReward, getDailyRewardStatus } from '../../services/dailyRewardService';
import { useAuth }    from '../../context/AuthContext';
import toast          from 'react-hot-toast';

export default function DailyRewardPanel() {
  const { userProfile } = useAuth();
  const [claiming, setClaiming] = useState(false);

  const status = getDailyRewardStatus(userProfile);
  const streakDays = [1,2,3,4,5,6,7];

  const handleClaim = async () => {
    if (!userProfile) return;
    setClaiming(true);
    try {
      const result = await claimDailyReward(userProfile.uid);
      toast.success(
        `🎁 Daily reward mila! +${result.ec} EC ${result.streak > 1 ? `(${result.streak} din streak 🔥)` : ''}`,
        { duration: 4000 }
      );
    } catch (e) {
      toast.error(e.message);
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="rounded-2xl overflow-hidden"
         style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
      <div className="h-px bg-gradient-to-r from-transparent via-ea-green/40 to-transparent" />
      <div className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <Gift className="w-4 h-4 text-ea-green" />
          <span className="font-display font-bold text-white text-sm">Daily Reward</span>
          {status.streak > 0 && (
            <span className="ml-auto flex items-center gap-1 font-mono text-xs text-ea-magenta">
              <Flame className="w-3 h-3" /> {status.streak} day streak
            </span>
          )}
        </div>

        {/* Streak dots */}
        <div className="flex gap-1.5 mb-4">
          {streakDays.map(day => (
            <div key={day} className={`flex-1 h-1.5 rounded-full transition-all duration-300
              ${day <= status.streak
                ? 'bg-ea-green'
                : day === status.streak + 1 && status.available
                ? 'bg-ea-green/40 animate-pulse'
                : 'bg-ea-border'}`} />
          ))}
        </div>

        {status.available ? (
          <button onClick={handleClaim} disabled={claiming}
            className="w-full py-2.5 rounded-xl font-display font-bold text-sm
                       flex items-center justify-center gap-2 transition-all active:scale-97 disabled:opacity-60"
            style={{ background:'linear-gradient(135deg,#00ff88,#00c8ff)', color:'#02020a' }}>
            {claiming ? <Loader className="w-4 h-4 animate-spin" /> : <Gift className="w-4 h-4" />}
            {claiming ? 'Claiming…' : `Claim +${status.nextReward} EC`}
          </button>
        ) : (
          <div className="w-full py-2.5 rounded-xl font-display font-bold text-sm text-center"
               style={{ background:'rgba(30,30,58,0.5)', border:'1px solid rgba(30,30,58,0.8)' }}>
            <span className="text-ea-muted flex items-center justify-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 text-ea-green" />
              Claimed • {status.hoursLeft}h baad aao
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
