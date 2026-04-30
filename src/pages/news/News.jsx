// src/pages/news/News.jsx — Dynamic: Articles Firestore se + static fallback
import { useState, useEffect }  from 'react';
import { Link }                 from 'react-router-dom';
import { useSEO }               from '../../hooks/useSEO';
import {
  subscribeArticles, BLOG_CATEGORIES,
} from '../../services/blogService';
import { NewsBannerAd }         from '../../components/common/AdManager';
import {
  Newspaper, Youtube, TrendingUp, ChevronRight,
  ExternalLink, Clock, Eye, Loader,
} from 'lucide-react';

// Fallback articles shown while Firestore loads or if empty
const SEED_ARTICLES = [
  {
    id:'bgmi-settings-guide',
    title:'BGMI Best Settings 2025 — Sensitivity, Controls, Graphics',
    excerpt:'Best sensitivity settings jo sabse zyada pro players use karte hain. In settings se aapka game dramatically improve hoga aur aiming bahut accurate ho jaayegi.',
    category:'bgmi', coverEmoji:'🎯', readMin:5,
    publishedAt:{ toDate:() => new Date('2025-06-01') }, views:1240,
    tags:['BGMI','Settings','Tips'], published:true,
  },
  {
    id:'free-fire-booyah-guide',
    title:'Free Fire MAX Booyah Tips — Pro Strategies 2025',
    excerpt:'Har game mein survive karne aur Booyah lane ke best tips. Landing spots, loot routes, aur final zone strategies jo pros use karte hain.',
    category:'freefire', coverEmoji:'🔥', readMin:7,
    publishedAt:{ toDate:() => new Date('2025-05-28') }, views:876,
    tags:['Free Fire','Strategy'], published:true,
  },
  {
    id:'gaming-income-guide',
    title:'Gaming Se Paise Kaise Kamao — Complete Guide 2025',
    excerpt:'Tournaments, streaming, coaching, aur content creation se gaming mein career kaise banayein. Practical steps with real numbers aur income estimates.',
    category:'earning', coverEmoji:'💰', readMin:10,
    publishedAt:{ toDate:() => new Date('2025-05-20') }, views:2100,
    tags:['Earning','Career'], published:true,
  },
  {
    id:'cod-ranked-push',
    title:'COD Mobile Ranked Mode — Grandmaster Tak Kaise Pahunchein',
    excerpt:'Ranked mode mein fast push karne ke strategies. Best loadout, positioning, aur team coordination tips jo aapko legend rank tak pahuncha denge.',
    category:'codmobile', coverEmoji:'💥', readMin:6,
    publishedAt:{ toDate:() => new Date('2025-05-15') }, views:654,
    tags:['COD Mobile','Ranked'], published:true,
  },
  {
    id:'tournament-strategy',
    title:'Online Tournament Kaise Jeetein — Insider Strategy',
    excerpt:'Tournament psychology, pre-match preparation, aur clutch moments mein sahi decisions lene ka guide. Pro mindset develop karo.',
    category:'tournament', coverEmoji:'🏆', readMin:8,
    publishedAt:{ toDate:() => new Date('2025-05-05') }, views:432,
    tags:['Tournament','Mental'], published:true,
  },
  {
    id:'esports-career-india',
    title:'India Mein Esports Career — 2025 Complete Roadmap',
    excerpt:'Pro player se coach, analyst, caster, aur organizer tak — Indian esports mein har role ka detailed guide with salary expectations.',
    category:'career', coverEmoji:'🚀', readMin:12,
    publishedAt:{ toDate:() => new Date('2025-05-10') }, views:1876,
    tags:['Career','India'], published:true,
  },
];

const COLOR_MAP = {
  cyan:   { text:'text-ea-cyan',    bg:'bg-ea-cyan/8',    border:'border-ea-cyan/20'    },
  magenta:{ text:'text-ea-magenta', bg:'bg-ea-magenta/8', border:'border-ea-magenta/20' },
  gold:   { text:'text-ea-gold',    bg:'bg-ea-gold/8',    border:'border-ea-gold/20'    },
  green:  { text:'text-ea-green',   bg:'bg-ea-green/8',   border:'border-ea-green/20'   },
  purple: { text:'text-purple-400', bg:'bg-purple-500/8', border:'border-purple-500/20' },
  muted:  { text:'text-ea-muted',   bg:'bg-ea-surface',   border:'border-ea-border'     },
};

const YOUTUBE_LINKS = [
  { title:'BGMI Pro Settings Tutorial',  url:'https://www.youtube.com/results?search_query=bgmi+pro+settings+2025',    emoji:'🎯' },
  { title:'Free Fire Tournament Tricks', url:'https://www.youtube.com/results?search_query=free+fire+tournament+tips', emoji:'🔥' },
  { title:'Gaming Income Guide India',   url:'https://www.youtube.com/results?search_query=gaming+income+india+2025',  emoji:'💰' },
];

export default function News() {
  useSEO({
    title:       'Esports News & Tips — EliteArena',
    description: 'BGMI tips, Free Fire MAX strategies, COD Mobile ranked guide, aur India mein gaming career guide.',
    url:         `${import.meta.env.VITE_SITE_URL || ''}/news`,
  });

  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState('all');

  // Subscribe to Firestore articles
  useEffect(() => {
    const unsub = subscribeArticles(
      data => {
        // If Firestore has articles, use them; else show seed fallback
        setArticles(data.length > 0 ? data : SEED_ARTICLES);
        setLoading(false);
      },
      () => {
        // On error (offline / no rules), use seed articles
        setArticles(SEED_ARTICLES);
        setLoading(false);
      }
    );
    return unsub;
  }, []);

  const filtered = filter === 'all'
    ? articles
    : articles.filter(a => a.category === filter);

  const featured = filtered[0];
  const rest     = filtered.slice(1);

  const getCat = (catId) => BLOG_CATEGORIES.find(c => c.id === catId) || BLOG_CATEGORIES[7];

  return (
    <div className="min-h-screen bg-ea-void pt-20 pb-16 px-4">
      <div className="fixed inset-0 bg-cyber-grid opacity-15 pointer-events-none" />

      <div className="relative max-w-5xl mx-auto space-y-8 animate-fade-up">

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Newspaper className="w-5 h-5 text-ea-cyan" />
            <span className="font-mono text-xs text-ea-cyan tracking-widest uppercase">Esports Hub</span>
          </div>
          <h1 className="font-display font-bold text-4xl text-white mb-2">
            News &{' '}
            <span style={{ background:'linear-gradient(135deg,#00f5ff,#0080ff)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent' }}>
              Guides
            </span>
          </h1>
          <p className="font-body text-ea-muted">
            BGMI tips, Free Fire strategies, aur Indian esports ki latest khabar
          </p>
        </div>

        {/* Category filters */}
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-full font-mono text-xs transition-all
              ${filter==='all' ? 'text-ea-void' : 'text-ea-muted border border-ea-border hover:text-white'}`}
            style={filter==='all' ? { background:'linear-gradient(135deg,#00f5ff,#0080ff)' } : {}}>
            All
          </button>
          {BLOG_CATEGORIES.map(cat => {
            const cls = COLOR_MAP[cat.color] || COLOR_MAP.muted;
            const active = filter === cat.id;
            return (
              <button key={cat.id} onClick={() => setFilter(cat.id)}
                className={`px-3 py-1.5 rounded-full font-mono text-xs transition-all border
                  ${active ? `${cls.text} ${cls.bg} ${cls.border}` : 'text-ea-muted border-ea-border hover:text-ea-text'}`}>
                {cat.emoji} {cat.label}
              </button>
            );
          })}
        </div>

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[0,1,2,3,4,5].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden animate-pulse"
                   style={{ background:'rgba(16,16,31,0.8)', border:'1px solid rgba(30,30,58,0.6)' }}>
                <div className="h-2 skeleton" />
                <div className="p-5 space-y-3">
                  <div className="h-5 skeleton rounded w-4/5" />
                  <div className="h-4 skeleton rounded w-full" />
                  <div className="h-4 skeleton rounded w-3/4" />
                  <div className="h-3 skeleton rounded w-1/3 mt-4" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Featured article */}
        {!loading && featured && (
          <Link to={`/news/${featured.id}`}
            className="block rounded-2xl overflow-hidden group transition-all hover:-translate-y-0.5"
            style={{ background:'linear-gradient(145deg,rgba(0,80,160,0.2),rgba(0,245,255,0.05))', border:'1px solid rgba(0,245,255,0.2)' }}>
            <div className="h-px bg-gradient-to-r from-ea-cyan/40 via-ea-cyan to-ea-cyan/40" />
            <div className="p-6 sm:p-8">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                <span className="badge-cyan text-xs">📌 Featured</span>
                {(() => {
                  const cat = getCat(featured.category);
                  const cls = COLOR_MAP[cat.color] || COLOR_MAP.muted;
                  return (
                    <span className={`font-mono text-xs px-2.5 py-0.5 rounded-full border ${cls.text} ${cls.bg} ${cls.border}`}>
                      {cat.emoji} {cat.label}
                    </span>
                  );
                })()}
              </div>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mb-3 leading-tight group-hover:text-ea-cyan transition-colors">
                {featured.coverEmoji} {featured.title}
              </h2>
              <p className="font-body text-ea-muted leading-relaxed mb-4 max-w-2xl">{featured.excerpt}</p>
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-mono text-xs text-ea-dim flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {featured.readMin} min read
                </span>
                <span className="font-mono text-xs text-ea-dim flex items-center gap-1">
                  <Eye className="w-3 h-3" /> {(featured.views||0).toLocaleString()}
                </span>
                <span className="ml-auto text-ea-cyan font-mono text-xs flex items-center gap-1 group-hover:gap-2 transition-all">
                  Read Full Article <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </Link>
        )}

        {/* Articles grid */}
        {!loading && rest.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map(article => {
              const cat = getCat(article.category);
              const cls = COLOR_MAP[cat.color] || COLOR_MAP.muted;
              const date = article.publishedAt?.toDate ? article.publishedAt.toDate() : new Date();
              return (
                <Link key={article.id} to={`/news/${article.id}`}
                  className="rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 group"
                  style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
                  {/* Category strip */}
                  <div className={`px-4 py-2 flex items-center gap-2 border-b border-ea-border/50
                                  text-xs font-mono ${cls.text} ${cls.bg}`}>
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                    <span className="ml-auto flex items-center gap-1">
                      <Clock className="w-2.5 h-2.5" /> {article.readMin}m
                    </span>
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-bold text-base text-white mb-2 leading-tight
                                   group-hover:text-ea-cyan transition-colors line-clamp-2">
                      {article.coverEmoji && <span className="mr-1">{article.coverEmoji}</span>}
                      {article.title}
                    </h3>
                    <p className="font-body text-sm text-ea-muted leading-relaxed mb-4 line-clamp-2">
                      {article.excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-ea-dim flex items-center gap-1">
                        <Eye className="w-2.5 h-2.5" /> {(article.views||0).toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 font-mono text-xs text-ea-cyan group-hover:gap-2 transition-all">
                        Read <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {/* Empty state */}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📰</div>
            <p className="font-display font-bold text-ea-text">Is category mein koi article nahi hai</p>
            <p className="text-ea-muted text-sm mt-1">Admin panel se naya article add karo</p>
          </div>
        )}

        {/* PropellerAds between content */}
        <NewsBannerAd />

        {/* YouTube Resources */}
        <div className="rounded-2xl p-6"
             style={{ background:'linear-gradient(145deg,rgba(255,0,0,0.05),#10101f)', border:'1px solid rgba(255,0,0,0.15)' }}>
          <h3 className="font-display font-bold text-white text-lg mb-4 flex items-center gap-2">
            <Youtube className="w-5 h-5 text-red-400" /> Video Tutorials
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {YOUTUBE_LINKS.map(v => (
              <a key={v.title} href={v.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl border border-ea-border
                           hover:border-red-500/30 hover:bg-red-500/5 transition-all group">
                <span className="text-2xl">{v.emoji}</span>
                <span className="font-body text-sm text-ea-text group-hover:text-white transition-colors flex-1">{v.title}</span>
                <ExternalLink className="w-3.5 h-3.5 text-ea-muted flex-shrink-0" />
              </a>
            ))}
          </div>
        </div>

        {/* Amazon Affiliate Gaming Gear */}
        <div className="rounded-2xl p-6"
             style={{ background:'linear-gradient(145deg,rgba(255,184,0,0.05),#10101f)', border:'1px solid rgba(255,184,0,0.15)' }}>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-ea-gold" />
            <span className="font-mono text-xs text-ea-gold uppercase tracking-wider">Recommended Gaming Gear</span>
            <span className="font-mono text-[10px] text-ea-dim">(Affiliate)</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name:'Gaming Headphones', emoji:'🎧', q:'gaming+headphones+bgmi',   price:'₹500-5000'   },
              { name:'Gaming Chair',      emoji:'🪑', q:'gaming+chair+india',        price:'₹5000-20000' },
              { name:'Gaming Phone',      emoji:'📱', q:'gaming+smartphone+india',   price:'₹10k-50k'    },
              { name:'Controller',        emoji:'🎮', q:'mobile+controller+trigger', price:'₹149-999'    },
            ].map(p => (
              <a key={p.name}
                href={`https://www.amazon.in/s?k=${encodeURIComponent(p.q)}&tag=${import.meta.env.VITE_AMAZON_AFFILIATE_TAG || 'elitearena-21'}`}
                target="_blank" rel="noopener noreferrer nofollow"
                className="rounded-xl p-3 text-center border border-ea-border
                           hover:border-ea-gold/30 hover:bg-ea-gold/5 transition-all group">
                <div className="text-3xl mb-2">{p.emoji}</div>
                <p className="font-body text-xs text-white font-medium group-hover:text-ea-gold transition-colors">{p.name}</p>
                <p className="font-mono text-[10px] text-ea-muted mt-1">{p.price}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
