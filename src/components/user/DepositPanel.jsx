// src/components/user/DepositPanel.jsx
import { useState }               from 'react';
import { QrCode, Copy, CheckCircle, Loader, AlertTriangle, Info } from 'lucide-react';
import { PAYMENT_CONFIG, inrToEC, formatINR } from '../../config/payments';
import { createDepositRequest }   from '../../services/paymentService';
import { useAuth }                from '../../context/AuthContext';
import toast                      from 'react-hot-toast';

export default function DepositPanel() {
  const { userProfile }           = useAuth();
  const [amount, setAmount]       = useState('');
  const [utr,    setUtr]          = useState('');
  const [step,   setStep]         = useState(1);   // 1=amount, 2=scan+pay, 3=submit UTR, 4=done
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors]       = useState({});
  const [copied, setCopied]       = useState(false);

  const MIN = PAYMENT_CONFIG.minDeposit;
  const MAX = PAYMENT_CONFIG.maxDeposit;
  const num = Number(amount);
  const ecPreview = inrToEC(num);

  // Preset quick amounts
  const PRESETS = [50, 100, 200, 500, 1000, 2000];

  const validateAmount = () => {
    const e = {};
    if (!amount || isNaN(num))    e.amount = 'Enter a valid amount.';
    else if (num < MIN)           e.amount = `Minimum deposit is ₹${MIN}.`;
    else if (num > MAX)           e.amount = `Maximum deposit is ₹${MAX}.`;
    return e;
  };

  const handleProceed = () => {
    const e = validateAmount();
    if (Object.keys(e).length) { setErrors(e); return; }
    setErrors({});
    setStep(2);
  };

  const handleCopyUpi = () => {
    navigator.clipboard?.writeText(PAYMENT_CONFIG.ownerUpiId).catch(() => {});
    setCopied(true);
    toast.success('UPI ID copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmitUTR = async () => {
    const e = {};
    if (!utr.trim() || utr.trim().length < 6) e.utr = 'Enter valid UTR (min 6 chars).';
    if (Object.keys(e).length) { setErrors(e); return; }

    setSubmitting(true);
    try {
      await createDepositRequest(userProfile.uid, num, utr);
      setStep(4);
      toast.success('Deposit request submitted! Admin will verify within 30 minutes.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => { setAmount(''); setUtr(''); setStep(1); setErrors({}); };

  return (
    <div className="bg-ea-card border border-ea-border rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-ea-border flex items-center gap-2">
        <QrCode className="w-5 h-5 text-ea-green" />
        <span className="font-display font-bold text-white text-base">Deposit Money</span>
        <span className="ml-auto text-ea-muted text-xs font-mono">Min ₹{MIN}</span>
      </div>

      <div className="p-5">

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-5">
          {['Amount', 'Scan & Pay', 'Submit UTR'].map((label, i) => (
            <div key={label} className="flex items-center gap-1.5 flex-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center
                               text-xs font-mono font-bold flex-shrink-0 transition-all
                ${step > i + 1 ? 'bg-ea-green text-ea-void'
                : step === i + 1 ? 'bg-ea-cyan text-ea-void'
                : 'bg-ea-border text-ea-muted'}`}>
                {step > i + 1 ? '✓' : i + 1}
              </div>
              <span className={`text-xs font-body hidden sm:block
                ${step === i + 1 ? 'text-white' : 'text-ea-muted'}`}>
                {label}
              </span>
              {i < 2 && <div className="flex-1 h-px bg-ea-border mx-1" />}
            </div>
          ))}
        </div>

        {/* ── Step 1: Amount ──────────────────────────────── */}
        {step === 1 && (
          <div className="space-y-4 animate-slide-up">
            <div>
              <label className="block text-ea-text text-sm font-medium mb-2">
                Amount (₹)
              </label>
              {/* Quick presets */}
              <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-3">
                {PRESETS.map(p => (
                  <button key={p} onClick={() => { setAmount(String(p)); setErrors({}); }}
                    className={`py-2 rounded-xl text-sm font-mono font-bold transition-all border
                      ${amount === String(p)
                        ? 'bg-ea-green/20 border-ea-green/50 text-ea-green'
                        : 'bg-ea-deep border-ea-border text-ea-muted hover:text-white hover:border-ea-border/80'}`}>
                    ₹{p}
                  </button>
                ))}
              </div>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-ea-muted font-bold">₹</span>
                <input
                  type="number" value={amount} min={MIN} max={MAX}
                  onChange={e => { setAmount(e.target.value); setErrors({}); }}
                  placeholder={`${MIN}–${MAX.toLocaleString()}`}
                  className={`w-full bg-ea-deep border ${errors.amount ? 'border-ea-magenta' : 'border-ea-border'}
                              text-white rounded-xl pl-8 pr-4 py-3 text-sm font-mono
                              focus:outline-none focus:border-ea-green/60 transition-all
                              placeholder-ea-muted`}
                />
              </div>
              {errors.amount && <p className="text-ea-magenta text-xs mt-1">{errors.amount}</p>}
              {num >= MIN && (
                <p className="text-ea-green text-xs font-mono mt-1.5">
                  You will receive: <strong>{ecPreview.toLocaleString()} EliteCoins</strong>
                </p>
              )}
            </div>

            <div className="bg-ea-deep/60 border border-ea-border/50 rounded-xl p-3 flex items-start gap-2">
              <Info className="w-4 h-4 text-ea-cyan flex-shrink-0 mt-0.5" />
              <p className="text-ea-muted text-xs font-body leading-relaxed">
                Pay via UPI to <span className="text-white font-mono">{PAYMENT_CONFIG.ownerUpiId}</span>.
                After payment, submit your UTR number here. EC credited within 30 minutes after verification.
              </p>
            </div>

            <button onClick={handleProceed}
              className="w-full py-3 bg-ea-green text-ea-void font-display font-bold text-sm
                         rounded-xl hover:brightness-110 transition-all active:scale-95">
              Proceed to Payment →
            </button>
          </div>
        )}

        {/* ── Step 2: Scan & Pay ──────────────────────────── */}
        {step === 2 && (
          <div className="space-y-4 animate-slide-up">
            <div className="bg-ea-deep border border-ea-border rounded-xl p-4 text-center">
              <p className="text-ea-muted text-xs font-mono mb-3 uppercase tracking-wider">
                Pay {formatINR(num)} to
              </p>

              {/* QR code */}
              <div className="w-48 h-48 mx-auto bg-white rounded-xl p-2 mb-4 flex items-center justify-center">
                {PAYMENT_CONFIG.upiQrUrl ? (
                  <img src={PAYMENT_CONFIG.upiQrUrl} alt="UPI QR Code"
                    className="w-full h-full object-contain" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center
                                  bg-ea-deep rounded-lg border-2 border-dashed border-ea-border">
                    <QrCode className="w-12 h-12 text-ea-muted mb-2" />
                    <p className="text-ea-muted text-[10px] font-mono text-center px-2">
                      Add VITE_UPI_QR_URL<br />in .env file
                    </p>
                  </div>
                )}
              </div>

              {/* UPI ID with copy */}
              <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-white font-mono font-bold">{PAYMENT_CONFIG.ownerUpiId}</span>
                <button onClick={handleCopyUpi}
                  className="text-ea-cyan hover:text-cyan-300 transition-colors">
                  {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-ea-muted text-xs font-body">{PAYMENT_CONFIG.ownerUpiName}</p>

              <div className="mt-3 bg-ea-cyan/10 border border-ea-cyan/25 rounded-lg px-3 py-2">
                <p className="text-ea-cyan text-xs font-mono font-bold">
                  Amount: {formatINR(num)} → {ecPreview} EC
                </p>
              </div>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 flex gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-amber-400/90 text-xs font-body leading-relaxed">
                Pay <strong>{formatINR(num)}</strong> exactly. Screenshot your payment confirmation
                and note the <strong>UTR/Transaction ID</strong> — you'll need it in the next step.
              </p>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep(1)}
                className="flex-1 py-2.5 bg-ea-border/50 text-ea-muted rounded-xl
                           text-sm font-bold hover:bg-ea-border transition-all">
                ← Back
              </button>
              <button onClick={() => setStep(3)}
                className="flex-1 py-2.5 bg-ea-green text-ea-void rounded-xl
                           text-sm font-display font-bold hover:brightness-110 transition-all active:scale-95">
                I've Paid →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Submit UTR ──────────────────────────── */}
        {step === 3 && (
          <div className="space-y-4 animate-slide-up">
            <div>
              <label className="block text-ea-text text-sm font-medium mb-1.5">
                UTR / Transaction Reference Number
              </label>
              <input
                value={utr}
                onChange={e => { setUtr(e.target.value.toUpperCase()); setErrors({}); }}
                placeholder="e.g. 426112345678 or T2406211234567"
                maxLength={30}
                className={`w-full bg-ea-deep border ${errors.utr ? 'border-ea-magenta' : 'border-ea-border'}
                            text-white rounded-xl px-4 py-3 text-sm font-mono uppercase
                            focus:outline-none focus:border-ea-green/60 transition-all
                            placeholder-ea-muted`}
              />
              {errors.utr && <p className="text-ea-magenta text-xs mt-1">{errors.utr}</p>}
              <p className="text-ea-muted text-xs mt-1 font-body">
                Find this in your UPI app → Transaction details → UTR Number
              </p>
            </div>

            <div className="bg-ea-deep/60 border border-ea-border/50 rounded-xl p-3">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-ea-muted">Amount Paid</span>
                <span className="text-white font-bold">{formatINR(num)}</span>
              </div>
              <div className="flex justify-between text-xs font-mono mt-1">
                <span className="text-ea-muted">EC to Credit</span>
                <span className="text-ea-green font-bold">+{ecPreview} EC</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep(2)}
                className="flex-1 py-2.5 bg-ea-border/50 text-ea-muted rounded-xl
                           text-sm font-bold hover:bg-ea-border transition-all">
                ← Back
              </button>
              <button onClick={handleSubmitUTR} disabled={submitting}
                className="flex-1 py-2.5 bg-ea-green text-ea-void rounded-xl
                           text-sm font-display font-bold hover:brightness-110 transition-all
                           active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                {submitting && <Loader className="w-4 h-4 animate-spin" />}
                {submitting ? 'Submitting…' : 'Submit Request ✓'}
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4: Done ─────────────────────────────────── */}
        {step === 4 && (
          <div className="text-center py-6 animate-slide-up">
            <div className="w-16 h-16 bg-ea-green/20 border border-ea-green/40 rounded-full
                            flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-ea-green" />
            </div>
            <h3 className="font-display font-bold text-white text-lg mb-2">Request Submitted!</h3>
            <p className="text-ea-muted text-sm font-body mb-1">
              Your deposit of <span className="text-white font-bold">{formatINR(num)}</span> is under review.
            </p>
            <p className="text-ea-green text-sm font-mono">
              +{ecPreview} EC will be credited after admin verification.
            </p>
            <p className="text-ea-muted text-xs mt-3">Expected within 30 minutes</p>
            <button onClick={reset}
              className="mt-5 px-6 py-2.5 bg-ea-card border border-ea-border rounded-xl
                         text-white text-sm font-bold hover:bg-ea-border transition-all">
              New Deposit
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
