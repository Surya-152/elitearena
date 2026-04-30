// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { useSEO } from '../hooks/useSEO';
import { Home, Trophy, Search } from 'lucide-react';

export default function NotFound() {
  useSEO({ title:'404 — Page Not Found', description:'Yeh page exist nahi karta.', noIndex:true });

  return (
    <div className="min-h-screen bg-ea-void flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-cyber-grid opacity-15 pointer-events-none" />

      <div className="relative text-center animate-fade-up max-w-md mx-auto">
        {/* Glitch 404 */}
        <div className="relative mb-6">
          <div className="font-display font-bold leading-none select-none"
               style={{
                 fontSize: 'clamp(100px,20vw,180px)',
                 background:'linear-gradient(135deg,rgba(0,245,255,0.15),rgba(255,0,128,0.15))',
                 WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
               }}>
            404
          </div>
          {/* Glitch layers */}
          <div className="absolute inset-0 font-display font-bold leading-none opacity-30"
               style={{
                 fontSize:'clamp(100px,20vw,180px)',
                 color:'#00f5ff',
                 clipPath:'polygon(0 15%,100% 15%,100% 35%,0 35%)',
                 transform:'translateX(-3px)',
               }}>
            404
          </div>
          <div className="absolute inset-0 font-display font-bold leading-none opacity-20"
               style={{
                 fontSize:'clamp(100px,20vw,180px)',
                 color:'#ff0080',
                 clipPath:'polygon(0 65%,100% 65%,100% 80%,0 80%)',
                 transform:'translateX(3px)',
               }}>
            404
          </div>
        </div>

        <Search className="w-8 h-8 text-ea-muted mx-auto mb-4" />
        <h1 className="font-display font-bold text-2xl text-white mb-2">Page Nahi Mila!</h1>
        <p className="font-body text-ea-muted text-sm mb-8 leading-relaxed">
          Yeh page exist nahi karta ya aap kisi galat URL pe aa gaye hain.
          Arena mein wapas jao aur tournaments khelo!
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/"
            className="btn-neon-cyan px-6 py-3 rounded-xl flex items-center gap-2 font-display font-bold text-sm">
            <Home className="w-4 h-4" /> Home Pe Jao
          </Link>
          <Link to="/dashboard"
            className="btn-ghost px-6 py-3 rounded-xl flex items-center gap-2 font-display font-bold text-sm">
            <Trophy className="w-4 h-4" /> Tournaments Dekho
          </Link>
        </div>
      </div>
    </div>
  );
}
