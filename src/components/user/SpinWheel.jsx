// src/components/user/SpinWheel.jsx — Daily lucky spin wheel
import { useState, useRef, useEffect } from 'react';
import { useAuth }        from '../../context/AuthContext';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, runTransaction } from 'firebase/firestore';
import { db }             from '../../config/firebase';
import toast              from 'react-hot-toast';
import { Gift, Loader }   from 'lucide-react';

const PRIZES = [
  { label:'+5 EC',    ec:5,   color:'#00f5ff', prob:0.35 },
  { label:'+10 EC',   ec:10,  color:'#00ff88', prob:0.25 },
  { label:'+2 EC',    ec:2,   color:'#5a5a8a', prob:0.20 },
  { label:'+25 EC',   ec:25,  color:'#ffb800', prob:0.10 },
  { label:'+1 EC',    ec:1,   color:'#3a3a5a', prob:0.06 },
  { label:'+50 EC',   ec:50,  color:'#ff0080', prob:0.03 },
  { label:'+3 EC',    ec:3,   color:'#5a5a8a', prob:0.009},
  { label:'🎁 100 EC',ec:100, color:'#8b2fff', prob:0.001},
];
const TOTAL_SEGMENTS = PRIZES.length;

function pickPrize() {
  let r = Math.random(), cum = 0;
  for (const p of PRIZES) { cum += p.prob; if (r <= cum) return p; }
  return PRIZES[0];
}

function todayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
}

export default function SpinWheel() {
  const { userProfile }      = useAuth();
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [result,   setResult]   = useState(null);
  const [canSpin,  setCanSpin]  = useState(false);
  const [checking, setChecking] = useState(true);
  const spinRef  = useRef(false);

  useEffect(() => {
    if (!userProfile?.uid) return;
    getDoc(doc(db, 'users', userProfile.uid)).then(snap => {
      const data = snap.data() || {};
      const lastSpin = data.lastSpinDate || '';
      setCanSpin(lastSpin !== todayKey());
      setChecking(false);
    }).catch(() => setChecking(false));
  }, [userProfile?.uid]);

  const spin = async () => {
    if (!canSpin || spinning || spinRef.current) return;
    spinRef.current = true;
    setSpinning(true);
    setResult(null);

    const prize = pickPrize();
    // Calculate rotation: multiple full spins + land on prize segment
    const prizeIdx    = PRIZES.indexOf(prize);
    const segDeg      = 360 / TOTAL_SEGMENTS;
    const targetAngle = 360 - (prizeIdx * segDeg + segDeg / 2);
    const fullSpins   = 5 + Math.floor(Math.random() * 3);
    const finalRot    = rotation + fullSpins * 360 + targetAngle;
    setRotation(finalRot);

    // Wait for animation (4s CSS transition)
    setTimeout(async () => {
      try {
        await runTransaction(db, async tx => {
          const uSnap = await tx.get(doc(db, 'users', userProfile.uid));
          if (!uSnap.exists()) throw new Error('User not found');
          const u = uSnap.data();
          if (u.lastSpinDate === todayKey()) throw new Error('Already spun today!');
          tx.update(doc(db, 'users', userProfile.uid), {
            elite_coins_balance: u.elite_coins_balance + prize.ec,
            lastSpinDate:        todayKey(),
            updatedAt:           serverTimestamp(),
          });
        });
        await addDoc(collection(db, 'transactions'), {
          userId:    userProfile.uid,
          delta:     prize.ec,
          reason:    `Lucky Spin — ${prize.label}`,
          type:      'spin_reward',
          createdAt: serverTimestamp(),
        });
        setResult(prize);
        setCanSpin(false);
        toast.success(`🎉 ${prize.label} mila spin se!`, { duration: 4000 });
      } catch (e) {
        toast.error(e.message);
      } finally {
        setSpinning(false);
        spinRef.current = false;
      }
    }, 4200);
  };

  const segDeg = 360 / TOTAL_SEGMENTS;

  return (
    <div className="rounded-2xl overflow-hidden"
         style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
      <div className="h-px bg-gradient-to-r from-transparent via-ea-purple/40 to-transparent" />
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Gift className="w-4 h-4 text-purple-400" />
          <span className="font-display font-bold text-white text-sm">Daily Lucky Spin</span>
          {canSpin && <span className="ml-auto badge-green text-[9px]">1 spin available</span>}
        </div>

        {/* Wheel */}
        <div className="relative flex items-center justify-center mb-3">
          {/* Pointer */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10 w-0 h-0"
               style={{ borderLeft:'8px solid transparent', borderRight:'8px solid transparent', borderTop:'16px solid #ffb800' }} />
          
          {/* Wheel SVG */}
          <div className="relative w-44 h-44 sm:w-52 sm:h-52">
            <svg
              viewBox="0 0 200 200"
              className="w-full h-full"
              style={{
                transition: spinning ? 'transform 4s cubic-bezier(0.17,0.67,0.12,0.99)' : 'none',
                transform: `rotate(${rotation}deg)`,
                transformOrigin: '100px 100px',
              }}>
              {PRIZES.map((prize, i) => {
                const startAngle = i * segDeg - 90;
                const endAngle   = startAngle + segDeg;
                const s1 = Math.sin(startAngle * Math.PI / 180);
                const c1 = Math.cos(startAngle * Math.PI / 180);
                const s2 = Math.sin(endAngle   * Math.PI / 180);
                const c2 = Math.cos(endAngle   * Math.PI / 180);
                const x1 = 100 + 95 * c1, y1 = 100 + 95 * s1;
                const x2 = 100 + 95 * c2, y2 = 100 + 95 * s2;
                const midAngle = (startAngle + endAngle) / 2;
                const tx = 100 + 68 * Math.cos(midAngle * Math.PI / 180);
                const ty = 100 + 68 * Math.sin(midAngle * Math.PI / 180);
                return (
                  <g key={i}>
                    <path d={`M 100 100 L ${x1} ${y1} A 95 95 0 0 1 ${x2} ${y2} Z`}
                          fill={prize.color} stroke="#02020a" strokeWidth="1.5" opacity="0.9" />
                    <text x={tx} y={ty} textAnchor="middle" dominantBaseline="middle"
                          fontSize={prize.ec >= 50 ? "8" : "9"} fontWeight="bold" fill="#fff"
                          transform={`rotate(${midAngle + 90}, ${tx}, ${ty})`}
                          style={{ fontFamily:'monospace', textShadow:'0 1px 2px rgba(0,0,0,0.8)' }}>
                      {prize.label}
                    </text>
                  </g>
                );
              })}
              <circle cx="100" cy="100" r="12" fill="#02020a" stroke="#ffb800" strokeWidth="2" />
            </svg>
          </div>
        </div>

        {/* Result */}
        {result && !spinning && (
          <div className="text-center mb-3 py-2 rounded-xl animate-fade-in"
               style={{ background:'rgba(255,184,0,0.08)', border:'1px solid rgba(255,184,0,0.25)' }}>
            <p className="font-display font-bold text-ea-gold">🎉 {result.label} Mila!</p>
            <p className="font-mono text-[10px] text-ea-muted">Kal dobara spin karo</p>
          </div>
        )}

        {/* Button */}
        {checking ? (
          <div className="w-full py-2.5 rounded-xl flex items-center justify-center">
            <Loader className="w-4 h-4 animate-spin text-ea-muted" />
          </div>
        ) : canSpin ? (
          <button onClick={spin} disabled={spinning}
            className="w-full py-2.5 rounded-xl font-display font-bold text-sm
                       flex items-center justify-center gap-2 transition-all active:scale-97 disabled:opacity-60"
            style={{ background:'linear-gradient(135deg,#8b2fff,#ff0080)', color:'#fff' }}>
            {spinning ? <><Loader className="w-4 h-4 animate-spin" /> Spinning…</> : '🎰 Spin Karo!'}
          </button>
        ) : (
          <div className="w-full py-2.5 rounded-xl text-center font-display font-bold text-sm text-ea-muted border border-ea-border">
            Kal Wapas Aao ✓
          </div>
        )}
      </div>
    </div>
  );
}
