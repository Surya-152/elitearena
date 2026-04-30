// src/pages/legal/TermsOfService.jsx
import { Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-ea-void pt-20 pb-16 px-4">
      <div className="fixed inset-0 bg-cyber-grid opacity-20 pointer-events-none" />
      <div className="relative max-w-3xl mx-auto animate-slide-up">
        <Link to="/" className="flex items-center gap-2 text-ea-muted hover:text-white
                                text-sm mb-8 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Home pe wapas jao
        </Link>

        <div className="bg-ea-card border border-ea-border rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <FileText className="w-8 h-8 text-ea-magenta" />
            <div>
              <h1 className="font-display font-black text-2xl text-white">Terms of Service</h1>
              <p className="text-ea-muted text-sm">Last updated: June 2025</p>
            </div>
          </div>

          <div className="space-y-6 text-ea-text font-body text-sm leading-relaxed">

            <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4 text-amber-300 text-xs">
              ⚠️ <strong>Important:</strong> EliteArena ek skill-based esports tournament platform hai.
              Yeh gambling nahi hai. Prizes milte hain gaming skill ki wajah se. Platform ka use karke
              aap in terms ko accept karte ho.
            </div>

            <Section title="1. Eligibility (Yogyata)">
              <ul className="list-disc pl-5 space-y-1 text-ea-muted">
                <li>Aapki age 18 saal ya usse zyada honi chahiye</li>
                <li>Aap India ke resident hone chahiye</li>
                <li>Ek person ek hi account rakh sakta hai</li>
                <li>Fake information se account banana ban hai</li>
              </ul>
            </Section>

            <Section title="2. EliteCoins (EC) System">
              <ul className="list-disc pl-5 space-y-1 text-ea-muted">
                <li>1 EliteCoin = ₹1 (admin ke discretion pe change ho sakta hai)</li>
                <li>EC real money nahi hai — yeh platform currency hai</li>
                <li>EC deposit karne par milta hai, ads dekhne par, ya tournaments jeetnee par</li>
                <li>EC ka withdrawal minimum ₹500 hai</li>
                <li>EC non-transferable hai — ek account se doosre mein transfer nahi hoga</li>
              </ul>
            </Section>

            <Section title="3. Deposits & Withdrawals">
              <ul className="list-disc pl-5 space-y-1 text-ea-muted">
                <li>Minimum deposit: ₹50</li>
                <li>Minimum withdrawal: ₹500 (500 EC)</li>
                <li>Withdrawal ke liye KYC mandatory hai</li>
                <li>Fake UTR submit karna fraud hai — account ban hoga</li>
                <li>Withdrawal 10 minutes mein process hota hai</li>
                <li>Platform kisi bhi suspicious transaction ko hold kar sakta hai</li>
              </ul>
            </Section>

            <Section title="4. Tournament Rules">
              <ul className="list-disc pl-5 space-y-1 text-ea-muted">
                <li>Entry fee join karte waqt deduct hoti hai — refundable nahi</li>
                <li>Cheating, hacking, ya emulators ka use ban hai</li>
                <li>Admin ka decision final hai</li>
                <li>Prize Admin ke verification ke baad credit hoti hai</li>
                <li>Match join karne ke baad withdraw nahi kar sakte</li>
              </ul>
            </Section>

            <Section title="5. Prohibited Activities">
              <ul className="list-disc pl-5 space-y-1 text-ea-muted">
                <li>Multiple accounts banana</li>
                <li>Fake UPI transactions submit karna</li>
                <li>Cheating ya hacking</li>
                <li>Platform ko commercially exploit karna</li>
                <li>Abusive language ya harassment</li>
              </ul>
              <p className="text-ea-muted mt-2">
                In activities pe immediate account ban aur pending balance forfeit ho sakta hai.
              </p>
            </Section>

            <Section title="6. Platform Rights">
              <ul className="list-disc pl-5 space-y-1 text-ea-muted">
                <li>Platform kisi bhi waqt tournaments cancel kar sakta hai (full refund milega)</li>
                <li>Platform suspicious accounts ko without notice suspend kar sakta hai</li>
                <li>Terms kisi bhi waqt update ho sakte hain — website pe notification milegi</li>
              </ul>
            </Section>

            <Section title="7. Disclaimer">
              <p className="text-ea-muted">
                EliteArena ek entertainment platform hai. Platform kisi bhi financial loss ke liye
                responsible nahi hai. Sirf wo paisa lagao jo aap afford kar sako. Responsible gaming karo.
              </p>
            </Section>

            <Section title="8. Governing Law">
              <p className="text-ea-muted">
                Yeh terms Indian law ke anusar governed hain. Koi bhi dispute Mumbai, Maharashtra ke
                courts mein settle hoga.
              </p>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div>
      <h2 className="text-white font-display font-bold text-base mb-2">{title}</h2>
      {children}
    </div>
  );
}
