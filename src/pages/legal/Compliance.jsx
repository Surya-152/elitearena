// src/pages/legal/Compliance.jsx — Indian Government Rules Compliance
import { Link }     from 'react-router-dom';
import { Shield, FileText, AlertTriangle, CheckCircle, ArrowLeft } from 'lucide-react';

export default function Compliance() {
  return (
    <div className="min-h-screen bg-ea-void pt-20 pb-16 px-4">
      <div className="relative max-w-3xl mx-auto animate-fade-up">
        <Link to="/" className="flex items-center gap-2 text-ea-muted hover:text-white text-sm mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Home pe wapas jao
        </Link>

        <div className="rounded-2xl p-8" style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
          <div className="flex items-center gap-3 mb-6">
            <Shield className="w-8 h-8 text-ea-cyan" />
            <div>
              <h1 className="font-display font-black text-2xl text-white">Legal Compliance</h1>
              <p className="text-ea-muted text-sm">Indian Government Rules & Regulations</p>
            </div>
          </div>

          {/* Important notice */}
          <div className="rounded-xl p-4 mb-6 flex gap-3"
               style={{ background:'rgba(255,184,0,0.08)', border:'1px solid rgba(255,184,0,0.25)' }}>
            <AlertTriangle className="w-5 h-5 text-ea-gold flex-shrink-0 mt-0.5" />
            <p className="font-body text-sm text-ea-gold">
              EliteArena ek <strong>skill-based gaming platform</strong> hai. Yeh gambling nahi hai.
              Supreme Court of India ne skill-based games ko legal maana hai.
            </p>
          </div>

          <div className="space-y-6 font-body text-sm text-ea-text">

            <Section title="1. TDS on Winnings (Income Tax)" icon="💰">
              <p className="text-ea-muted leading-relaxed mb-3">
                Finance Act 2023 ke anusaar: Online gaming winnings pe <strong className="text-white">30% TDS</strong> lagta hai.
              </p>
              <div className="space-y-2">
                {[
                  'Ek tournament mein ₹10,000 se zyada jeetne pe 30% TDS katega',
                  'TDS amount platform automatically deduct karta hai prize credit karne se pehle',
                  'Form 26AS mein TDS details dikhenge — ITR mein claim kar sakte ho',
                  'Section 194BA ke under yeh rule applicable hai (1 April 2023 se)',
                  'Net winnings = Total prize - Total deposits (us financial year mein)',
                ].map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-ea-green flex-shrink-0 mt-0.5" />
                    <span className="text-ea-muted">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 p-3 rounded-xl" style={{ background:'rgba(0,255,136,0.05)', border:'1px solid rgba(0,255,136,0.15)' }}>
                <p className="text-ea-green text-xs"><strong>Example:</strong> Aap ₹1,000 deposit karte ho, ₹5,000 prize jeette ho → Net winning = ₹4,000 → TDS = ₹1,200 (30%) → Aapko ₹2,800 milega.</p>
              </div>
            </Section>

            <Section title="2. GST Compliance" icon="📊">
              <p className="text-ea-muted leading-relaxed mb-3">
                October 2023 se online gaming platforms pe <strong className="text-white">28% GST</strong> full face value pe lagti hai.
              </p>
              <div className="space-y-2">
                {[
                  'Platform fee (entry fee ka portion) pe 28% GST applicable hai',
                  'GST consumer ke upar indirectly pass hota hai via platform fee structure',
                  'EliteArena GST registered entity hai (GSTIN mention karo)',
                  'GST invoice available on request via Support',
                ].map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-ea-cyan flex-shrink-0 mt-0.5" />
                    <span className="text-ea-muted">{item}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="3. Age Verification (18+ Mandatory)" icon="🔞">
              <p className="text-ea-muted leading-relaxed">
                Real money tournaments sirf 18+ users ke liye hain. KYC (Aadhar + PAN) se age verify hoti hai.
                States jahan skill gaming restricted hai wahan users participate nahi kar sakte:
                <strong className="text-white"> Assam, Andhra Pradesh, Meghalaya, Nagaland, Odisha, Sikkim, Telangana</strong>.
              </p>
            </Section>

            <Section title="4. KYC Requirements" icon="🪪">
              <p className="text-ea-muted leading-relaxed mb-3">
                RBI guidelines ke anusar real money transactions ke liye KYC mandatory hai.
              </p>
              <div className="space-y-2">
                {[
                  'PAN card — Income Tax compliance ke liye mandatory',
                  'Aadhar card — Identity verification ke liye (sirf last 4 digits store hote hain)',
                  'Age 18+ verify hoti hai DOB se',
                  'KYC approved hone ke baad hi withdrawal allowed hai',
                ].map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-ea-gold flex-shrink-0 mt-0.5" />
                    <span className="text-ea-muted">{item}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="5. Restricted States" icon="🗺️">
              <div className="p-3 rounded-xl" style={{ background:'rgba(255,0,128,0.06)', border:'1px solid rgba(255,0,128,0.15)' }}>
                <p className="text-ea-magenta text-xs leading-relaxed">
                  <strong>In states mein real money gaming restricted hai:</strong><br />
                  Assam, Andhra Pradesh, Meghalaya, Nagaland, Odisha, Sikkim, Telangana.<br /><br />
                  In states se users free tournaments mein participate kar sakte hain lekin real money games nahi.
                  Platform aapki location detect karne ki koshish karta hai.
                </p>
              </div>
            </Section>

            <Section title="6. Responsible Gaming" icon="🎮">
              <p className="text-ea-muted leading-relaxed mb-3">
                EliteArena responsible gaming ko promote karta hai:
              </p>
              <div className="space-y-2">
                {[
                  'Monthly deposit limit set kar sakte ho (coming soon)',
                  'Self-exclusion option available via Support',
                  'Addiction helpline: iCall — 9152987821',
                  'Sirf wo paisa lagao jo aap afford kar sakein',
                  'Minor accounts turant ban kiye jaate hain',
                ].map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <CheckCircle className="w-4 h-4 text-ea-green flex-shrink-0 mt-0.5" />
                    <span className="text-ea-muted">{item}</span>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="7. Dispute Resolution" icon="⚖️">
              <p className="text-ea-muted leading-relaxed">
                Koi bhi dispute Support ticket ke through resolve hoga. Agar platform se satisfied nahi hain toh
                Consumer Forum ya IT Act ke under complaint kar sakte hain.
                Governing jurisdiction: <strong className="text-white">Mumbai, Maharashtra, India</strong>.
              </p>
            </Section>
          </div>

          <div className="mt-8 pt-6 border-t border-ea-border">
            <div className="flex flex-wrap gap-3">
              <Link to="/privacy" className="badge-cyan text-xs">Privacy Policy</Link>
              <Link to="/terms"   className="badge-cyan text-xs">Terms of Service</Link>
              <Link to="/support" className="badge-cyan text-xs">Support</Link>
            </div>
            <p className="text-ea-dim text-xs mt-3 font-mono">Last updated: June 2025 • Subject to change as per government notifications</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, icon, children }) {
  return (
    <div className="border-l-2 border-ea-border pl-4">
      <h2 className="font-display font-bold text-white text-base mb-3 flex items-center gap-2">
        <span>{icon}</span>{title}
      </h2>
      {children}
    </div>
  );
}
