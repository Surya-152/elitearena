// src/components/admin/BalanceManager.jsx
import { useState } from 'react';
import { Zap, Loader, Plus, Minus } from 'lucide-react';
import { adminAdjustBalance } from '../../services/walletService';
import toast from 'react-hot-toast';

export default function BalanceManager() {
  const [uid,    setUid]    = useState('');
  const [delta,  setDelta]  = useState('');
  const [reason, setReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!uid.trim())         e.uid   = 'UID is required.';
    if (!delta || isNaN(Number(delta)) || Number(delta) === 0)
                             e.delta = 'Enter a non-zero amount (+/-)';
    return e;
  };

  const handleAdjust = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }

    setSaving(true);
    try {
      await adminAdjustBalance(uid.trim(), Number(delta), reason || 'Admin adjustment');
      const sign = Number(delta) > 0 ? '+' : '';
      toast.success(`Balance adjusted: ${sign}${delta} EC for user.`);
      setUid(''); setDelta(''); setReason(''); setErrors({});
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-ea-card border border-ea-border rounded-2xl p-6">
      <h2 className="font-display font-bold text-white text-xl mb-6 flex items-center gap-2">
        <Zap className="w-5 h-5 text-ea-gold" />
        Adjust User Balance
      </h2>

      <div className="space-y-4">
        <div>
          <label className="block text-ea-text text-sm font-medium mb-1.5">Firebase UID</label>
          <input
            value={uid} onChange={e => { setUid(e.target.value); setErrors(p => ({...p, uid: undefined})); }}
            placeholder="User's Firebase UID…"
            className={`w-full bg-ea-deep border ${errors.uid ? 'border-ea-magenta' : 'border-ea-border'}
                        text-white rounded-xl px-4 py-2.5 text-sm font-mono
                        focus:outline-none focus:border-ea-cyan/60 transition-colors placeholder-ea-muted`}
          />
          {errors.uid && <p className="text-ea-magenta text-xs mt-1">{errors.uid}</p>}
        </div>

        <div>
          <label className="block text-ea-text text-sm font-medium mb-1.5">
            Amount (use negative to deduct)
          </label>
          <div className="flex gap-2">
            <button
              onClick={() => setDelta(v => v.startsWith('-') ? v.slice(1) : v)}
              className="px-3 py-2.5 bg-ea-green/15 border border-ea-green/30 text-ea-green rounded-xl hover:bg-ea-green/25 transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
            <input
              type="number" value={delta}
              onChange={e => { setDelta(e.target.value); setErrors(p => ({...p, delta: undefined})); }}
              placeholder="e.g. 100 or -50"
              className={`flex-1 bg-ea-deep border ${errors.delta ? 'border-ea-magenta' : 'border-ea-border'}
                          text-white rounded-xl px-4 py-2.5 text-sm font-mono
                          focus:outline-none focus:border-ea-cyan/60 transition-colors placeholder-ea-muted`}
            />
            <button
              onClick={() => setDelta(v => v.startsWith('-') ? v : v ? `-${v}` : '-')}
              className="px-3 py-2.5 bg-ea-magenta/15 border border-ea-magenta/30 text-ea-magenta rounded-xl hover:bg-ea-magenta/25 transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
          </div>
          {errors.delta && <p className="text-ea-magenta text-xs mt-1">{errors.delta}</p>}
        </div>

        <div>
          <label className="block text-ea-text text-sm font-medium mb-1.5">Reason (optional)</label>
          <input
            value={reason} onChange={e => setReason(e.target.value)}
            placeholder="e.g. Prize distribution, refund…"
            className="w-full bg-ea-deep border border-ea-border text-white rounded-xl px-4 py-2.5 text-sm font-body
                       focus:outline-none focus:border-ea-cyan/60 transition-colors placeholder-ea-muted"
          />
        </div>

        <button
          onClick={handleAdjust}
          disabled={saving}
          className="w-full py-3 bg-ea-gold/15 border border-ea-gold/40 text-ea-gold font-display font-bold text-sm
                     rounded-xl hover:bg-ea-gold/25 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {saving ? 'Adjusting…' : 'Apply Balance Adjustment'}
        </button>
      </div>
    </div>
  );
}
