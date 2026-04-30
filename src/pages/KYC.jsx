// src/pages/KYC.jsx — Know Your Customer verification for withdrawal eligibility
import { useState } from 'react';
import { Shield, Loader, CheckCircle, Clock, XCircle, AlertTriangle, Upload } from 'lucide-react';
import { useSEO } from '../hooks/useSEO';
import { useAuth }   from '../context/AuthContext';
import { submitKYC } from '../services/kycService';
import toast         from 'react-hot-toast';

const KYC_STATUS_CONFIG = {
  pending:   { label: 'KYC Pending',   color: 'text-ea-muted',  icon: Clock,        bg: 'bg-ea-dim/10  border-ea-dim/25'  },
  submitted: { label: 'Under Review',  color: 'text-ea-gold',   icon: Clock,        bg: 'bg-ea-gold/10   border-ea-gold/25'   },
  approved:  { label: 'KYC Approved',  color: 'text-ea-green',  icon: CheckCircle,  bg: 'bg-ea-green/10  border-ea-green/25'  },
  rejected:  { label: 'KYC Rejected',  color: 'text-ea-magenta',   icon: XCircle,      bg: 'bg-ea-magenta/10   border-ea-magenta/25'   },
};

export default function KYC() {
  useSEO({ title:'KYC Verification', description:'KYC complete karo — withdrawal enable karo.', noIndex:true });
  const { userProfile } = useAuth();
  const kycStatus       = userProfile?.kycStatus || 'pending';
  const cfg             = KYC_STATUS_CONFIG[kycStatus] ?? KYC_STATUS_CONFIG.pending;
  const StatusIcon      = cfg.icon;

  const [form, setForm] = useState({
    fullName:    '',
    panNumber:   '',
    aadharNumber:'',
    dob:         '',
    address:     '',
    city:        '',
    state:       '',
    pincode:     '',
  });
  const [errors,     setErrors]     = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1=Personal, 2=Documents, 3=Address

  const set = (k, v) => { setForm(p => ({...p, [k]: v})); setErrors(p => ({...p, [k]: undefined})); };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())      e.fullName     = 'Full name required.';
    if (!form.panNumber.trim())     e.panNumber    = 'PAN number required.';
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(form.panNumber.toUpperCase()))
                                    e.panNumber    = 'Invalid PAN format (e.g. ABCDE1234F).';
    if (!form.aadharNumber.trim())  e.aadharNumber = 'Aadhar number required.';
    else if (!/^\d{12}$/.test(form.aadharNumber.replace(/\s/g, '')))
                                    e.aadharNumber = 'Aadhar 12 digits ka hona chahiye.';
    if (!form.dob)                  e.dob          = 'Date of birth required.';
    else {
      const age = (Date.now() - new Date(form.dob)) / (365.25 * 24 * 3600 * 1000);
      if (age < 18)                 e.dob          = 'Aapki age 18+ honi chahiye.';
    }
    if (!form.address.trim())       e.address      = 'Address required.';
    if (!form.city.trim())          e.city         = 'City required.';
    if (!form.state.trim())         e.state        = 'State required.';
    if (!form.pincode.trim())       e.pincode      = 'Pincode required.';
    else if (!/^\d{6}$/.test(form.pincode)) e.pincode = '6-digit pincode daalo.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await submitKYC(userProfile.uid, {
        ...form,
        panNumber:    form.panNumber.toUpperCase(),
        aadharNumber: form.aadharNumber.replace(/\s/g, ''),
      });
      toast.success('KYC submitted! Review mein 24-48 hours lagte hain.');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const STATES = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa',
    'Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
    'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan',
    'Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal',
    'Delhi','Jammu & Kashmir','Ladakh'];

  return (
    <div className="min-h-screen bg-ea-void pt-20 pb-12 px-4">
      <div className="fixed inset-0 bg-cyber-grid opacity-20 pointer-events-none" />

      <div className="relative max-w-2xl mx-auto space-y-5 animate-slide-up">

        {/* Header */}
        <div>
          <h1 className="font-display font-black text-3xl text-white">
            KYC <span className="text-ea-cyan">Verification</span>
          </h1>
          <p className="text-ea-muted text-sm mt-1 font-body">
            Withdrawal ke liye KYC zaruri hai · RBI guidelines ke anusar
          </p>
        </div>

        {/* Status card */}
        <div className={`border rounded-2xl p-5 flex items-center gap-4 ${cfg.bg}`}>
          <StatusIcon className={`w-8 h-8 flex-shrink-0 ${cfg.color}`} />
          <div>
            <p className={`font-display font-bold text-base ${cfg.color}`}>{cfg.label}</p>
            <p className="text-ea-muted text-sm mt-0.5">
              {kycStatus === 'pending'   && 'KYC submit karna zaroori hai withdrawal ke liye.'}
              {kycStatus === 'submitted' && 'Aapka KYC review mein hai. 24-48 ghante ka wait karein.'}
              {kycStatus === 'approved'  && 'Aap withdraw kar sakte ho! KYC verified hai.'}
              {kycStatus === 'rejected'  && `Rejected: ${userProfile?.kycRejectReason || 'Details sahi nahi thi. Dobara submit karein.'}`}
            </p>
          </div>
        </div>


        {/* Step Progress Indicator */}
        {(kycStatus === 'pending' || kycStatus === 'rejected') && (
          <div className="flex items-center justify-center gap-0 mb-4">
            {[
              {n:'01', l:'Personal'},
              {n:'02', l:'Documents'},
              {n:'03', l:'Address'},
            ].map(({n, l}, i) => {
              const stepNum = i + 1;
              const done    = currentStep > stepNum;
              const active  = currentStep === stepNum;
              return (
                <div key={n} className="flex items-center">
                  <div className="flex flex-col items-center gap-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center
                                    text-xs font-mono font-bold transition-all
                      ${done   ? 'bg-ea-green text-ea-void'
                        : active ? 'bg-ea-cyan text-ea-void shadow-cyan'
                        : 'bg-ea-border text-ea-muted'}`}>
                      {done ? '✓' : n}
                    </div>
                    <span className={`text-[9px] font-mono whitespace-nowrap hidden sm:block
                      ${active ? 'text-ea-cyan' : done ? 'text-ea-green' : 'text-ea-dim'}`}>
                      {l}
                    </span>
                  </div>
                  {i < 2 && (
                    <div className={`h-px w-8 sm:w-16 mx-1 transition-all
                      ${currentStep > stepNum ? 'bg-ea-green' : 'bg-ea-border'}`} />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Show form only if pending or rejected */}
        {(kycStatus === 'pending' || kycStatus === 'rejected') && (
          <form onSubmit={handleSubmit} noValidate>
            <div className="bg-ea-card border border-ea-border rounded-2xl p-6 space-y-5">

              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-ea-cyan" />
                <h2 className="font-display font-bold text-white text-lg">Personal Details</h2>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-3 flex gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <p className="text-amber-400/90 text-xs font-body leading-relaxed">
                  Sirf <strong>real information</strong> daalo. Fake info se account permanently ban ho sakta hai.
                  Aapki information secure rahegi aur sirf verification ke liye use hogi.
                </p>
              </div>

              {/* Form fields grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                <FormField label="Full Name (as per ID)" error={errors.fullName} className="sm:col-span-2">
                  <input value={form.fullName} onChange={e => set('fullName', e.target.value)}
                    placeholder="Jaise Aadhar/PAN pe likha hai"
                    className={inputCls(errors.fullName)} />
                </FormField>

                <FormField label="PAN Number" error={errors.panNumber}>
                  <input value={form.panNumber} onChange={e => set('panNumber', e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F" maxLength={10}
                    className={`${inputCls(errors.panNumber)} uppercase font-mono`} />
                </FormField>

                <FormField label="Aadhar Number" error={errors.aadharNumber}>
                  <input value={form.aadharNumber} onChange={e => set('aadharNumber', e.target.value.replace(/\D/g,''))}
                    placeholder="12 digit number" maxLength={12}
                    className={`${inputCls(errors.aadharNumber)} font-mono`} />
                </FormField>

                <FormField label="Date of Birth" error={errors.dob}>
                  <input type="date" value={form.dob} onChange={e => set('dob', e.target.value)}
                    max={new Date(Date.now() - 18*365.25*24*3600*1000).toISOString().split('T')[0]}
                    className={inputCls(errors.dob)} />
                </FormField>

                <FormField label="Pincode" error={errors.pincode}>
                  <input value={form.pincode} onChange={e => set('pincode', e.target.value.replace(/\D/g,''))}
                    placeholder="110001" maxLength={6}
                    className={`${inputCls(errors.pincode)} font-mono`} />
                </FormField>

                <FormField label="Full Address" error={errors.address} className="sm:col-span-2">
                  <textarea value={form.address} onChange={e => set('address', e.target.value)}
                    placeholder="House/Flat no., Street, Colony…" rows={2}
                    className={`${inputCls(errors.address)} resize-none`} />
                </FormField>

                <FormField label="City" error={errors.city}>
                  <input value={form.city} onChange={e => set('city', e.target.value)}
                    placeholder="Aapka sheher"
                    className={inputCls(errors.city)} />
                </FormField>

                <FormField label="State" error={errors.state}>
                  <select value={form.state} onChange={e => set('state', e.target.value)}
                    className={`${inputCls(errors.state)} appearance-none`}>
                    <option value="">State select karo…</option>
                    {STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </FormField>

              </div>

              {/* Note about documents */}
              <div className="bg-ea-deep/60 border border-ea-border/50 rounded-xl p-4">
                <p className="text-white text-xs font-display font-bold mb-2 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-ea-cyan" /> Document Upload
                </p>
                <p className="text-ea-muted text-xs font-body leading-relaxed">
                  Abhi document upload optional hai. Admin manually verify karega.
                  Agar documents maange jaayein toh Admin notification se inform karega.
                </p>
              </div>

              <button type="submit" disabled={submitting}
                className="w-full py-3 bg-ea-cyan text-ea-void font-display font-bold text-sm
                           rounded-xl shadow-cyan hover:bg-cyan-300 transition-all
                           active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2">
                {submitting ? <Loader className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {submitting ? 'Submit ho raha hai…' : 'KYC Submit Karo'}
              </button>
            </div>
          </form>
        )}

        {/* Approved state — show summary */}
        {kycStatus === 'approved' && userProfile?.kycData && (
          <div className="bg-ea-card border border-ea-green/25 rounded-2xl p-6">
            <h3 className="font-display font-bold text-white text-base mb-4">Verified Details</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { l: 'Name',    v: userProfile.kycData.fullName    },
                { l: 'PAN',     v: userProfile.kycData.panNumber   },
                { l: 'City',    v: userProfile.kycData.city        },
                { l: 'State',   v: userProfile.kycData.state       },
              ].map(({ l, v }) => (
                <div key={l} className="bg-ea-deep/60 rounded-xl p-3">
                  <p className="text-ea-muted text-xs mb-0.5">{l}</p>
                  <p className="text-white text-sm font-mono font-medium">{v}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function FormField({ label, error, children, className = '' }) {
  return (
    <div className={className}>
      <label className="block text-ea-text text-sm font-medium mb-1.5">{label}</label>
      {children}
      {error && <p className="text-ea-magenta text-xs mt-1">{error}</p>}
    </div>
  );
}
const inputCls = (err) => `w-full bg-ea-deep border ${err ? 'border-ea-magenta' : 'border-ea-border'}
  text-white rounded-xl px-4 py-2.5 text-sm font-body focus:outline-none
  focus:border-ea-cyan/60 transition-all placeholder-ea-muted`;
