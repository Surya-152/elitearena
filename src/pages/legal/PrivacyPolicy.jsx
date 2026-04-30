// src/pages/legal/PrivacyPolicy.jsx
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicy() {
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
            <Shield className="w-8 h-8 text-ea-cyan" />
            <div>
              <h1 className="font-display font-black text-2xl text-white">Privacy Policy</h1>
              <p className="text-ea-muted text-sm">Last updated: June 2025</p>
            </div>
          </div>

          <div className="prose prose-invert max-w-none space-y-6 text-ea-text font-body text-sm leading-relaxed">

            <Section title="1. Information We Collect">
              <p>Hum yeh information collect karte hain:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2 text-ea-muted">
                <li>Account information: Email, username, date of registration</li>
                <li>KYC data: Full name, PAN number (last 4 digits of Aadhar), date of birth, address</li>
                <li>Transaction data: Deposits, withdrawals, tournament entries</li>
                <li>Usage data: Pages visited, tournaments joined, gameplay statistics</li>
                <li>Device information: Browser type, IP address</li>
              </ul>
            </Section>

            <Section title="2. How We Use Your Information">
              <ul className="list-disc pl-5 space-y-1 text-ea-muted">
                <li>Account management aur authentication ke liye</li>
                <li>Financial transactions process karne ke liye</li>
                <li>KYC verification (RBI/legal compliance) ke liye</li>
                <li>Customer support tickets handle karne ke liye</li>
                <li>Fraud prevention aur security ke liye</li>
                <li>Notifications aur updates bhejne ke liye</li>
              </ul>
            </Section>

            <Section title="3. Data Security">
              <p>Aapka data Firebase (Google Cloud) pe store hota hai jo industry-standard encryption use karta hai.
              Aapka Aadhar number kabhi complete store nahi hota — sirf last 4 digits.
              PAN number sirf KYC verification ke liye use hota hai.</p>
            </Section>

            <Section title="4. Data Sharing">
              <p>Hum aapka personal data kisi third party ke saath share <strong>nahi</strong> karte, sirf:</p>
              <ul className="list-disc pl-5 space-y-1 text-ea-muted mt-2">
                <li>Legal requirement hone pe (government/court order)</li>
                <li>Payment processing ke liye UPI details</li>
                <li>Firebase/Google (infrastructure provider)</li>
              </ul>
            </Section>

            <Section title="5. Cookies">
              <p>Hum authentication ke liye Firebase session cookies use karte hain. Yeh zaroori hain login ke liye.</p>
            </Section>

            <Section title="6. Your Rights">
              <ul className="list-disc pl-5 space-y-1 text-ea-muted">
                <li>Apna account delete karne ka haq hai</li>
                <li>Apna data download karne ka haq hai</li>
                <li>Galat information correct karwane ka haq hai</li>
                <li>Support ticket raise karne ka haq hai</li>
              </ul>
            </Section>

            <Section title="7. Age Restriction">
              <p>EliteArena sirf 18+ users ke liye hai. Agar aap 18 se kam hain toh please account mat banao.</p>
            </Section>

            <Section title="8. Contact">
              <p>Privacy related queries ke liye Support Center use karein ya email karein:
              <span className="text-ea-cyan font-mono ml-1">{import.meta.env.VITE_SUPPORT_EMAIL || "support@yourdomain.com"}</span></p>
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
