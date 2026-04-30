// src/pages/news/ArticleDetail.jsx — Full article page with Firestore data
import { useEffect, useState } from 'react';
import { useParams, Link }     from 'react-router-dom';
import { useSEO }              from '../../hooks/useSEO';
import { fetchArticle, incrementViews, BLOG_CATEGORIES } from '../../services/blogService';
import { ArrowLeft, Clock, Eye, Tag, Calendar, User } from 'lucide-react';
import { formatDistanceToNow }  from 'date-fns';

const colorMap = {
  cyan:   'text-ea-cyan   bg-ea-cyan/10   border-ea-cyan/20',
  magenta:'text-ea-magenta bg-ea-magenta/10 border-ea-magenta/20',
  gold:   'text-ea-gold   bg-ea-gold/10   border-ea-gold/20',
  green:  'text-ea-green  bg-ea-green/10  border-ea-green/20',
  purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
  muted:  'text-ea-muted  bg-ea-surface   border-ea-border',
};

function Spinner() {
  return (
    <div className="min-h-screen bg-ea-void flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-ea-cyan/20 border-t-ea-cyan animate-spin" />
    </div>
  );
}

export default function ArticleDetail() {
  const { id }         = useParams();
  const [article, setArticle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useSEO({
    title:       article ? article.title : 'Article — EliteArena',
    description: article?.excerpt || 'EliteArena esports news aur tips.',
  });

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchArticle(id)
      .then(a => { setArticle(a); setLoading(false); incrementViews(id); })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [id]);

  if (loading) return <Spinner />;

  if (notFound || !article) {
    return (
      <div className="min-h-screen bg-ea-void flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-6xl mb-4">📰</div>
          <h1 className="font-display font-bold text-2xl text-white mb-2">Article Nahi Mila</h1>
          <p className="text-ea-muted mb-6">Yeh article exist nahi karta ya delete ho gaya.</p>
          <Link to="/news" className="btn-neon-cyan px-6 py-2.5 rounded-xl text-sm">
            ← Sab Articles Dekho
          </Link>
        </div>
      </div>
    );
  }

  const catInfo = BLOG_CATEGORIES.find(c => c.id === article.category) || BLOG_CATEGORIES[7];
  const cls     = colorMap[catInfo.color] || colorMap.muted;
  const date    = article.publishedAt?.toDate ? article.publishedAt.toDate() : new Date();

  return (
    <div className="min-h-screen bg-ea-void pt-20 pb-16 px-4">
      <div className="fixed inset-0 bg-cyber-grid opacity-15 pointer-events-none" />

      <div className="relative max-w-3xl mx-auto animate-fade-up">

        {/* Back */}
        <Link to="/news"
          className="inline-flex items-center gap-2 text-ea-muted hover:text-white text-sm mb-6 transition-colors group">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          News & Guides
        </Link>

        {/* Hero */}
        <div className="rounded-2xl overflow-hidden mb-6"
             style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
          <div className="h-1 bg-gradient-to-r from-ea-cyan/40 via-ea-cyan to-ea-cyan/40" />

          <div className="p-6 sm:p-8">
            {/* Category + emoji */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-mono font-bold ${cls}`}>
                {catInfo.emoji} {catInfo.label}
              </span>
              <span className="text-ea-dim font-mono text-[11px] flex items-center gap-1">
                <Clock className="w-3 h-3" /> {article.readMin} min read
              </span>
              <span className="text-ea-dim font-mono text-[11px] flex items-center gap-1">
                <Eye className="w-3 h-3" /> {(article.views || 0).toLocaleString()} views
              </span>
            </div>

            {/* Title */}
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-white leading-tight mb-4">
              {article.coverEmoji && <span className="mr-2">{article.coverEmoji}</span>}
              {article.title}
            </h1>

            {/* Meta */}
            <div className="flex items-center gap-4 pb-5 border-b border-ea-border/50 flex-wrap">
              <div className="flex items-center gap-1.5 text-ea-muted text-sm">
                <User className="w-3.5 h-3.5" />
                <span className="font-body">{article.author || 'EliteArena Team'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-ea-muted text-sm">
                <Calendar className="w-3.5 h-3.5" />
                <span className="font-mono text-xs">{formatDistanceToNow(date, { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Article content */}
        <div className="rounded-2xl p-6 sm:p-8 mb-6"
             style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
          <div className="prose-ea">
            {/* Render content — split by double newline = paragraphs */}
            {article.content.split('\n\n').map((para, i) => {
              // Headings
              if (para.startsWith('## ')) {
                return (
                  <h2 key={i} className="font-display font-bold text-xl text-white mt-6 mb-3">
                    {para.slice(3)}
                  </h2>
                );
              }
              if (para.startsWith('### ')) {
                return (
                  <h3 key={i} className="font-display font-bold text-base text-ea-cyan mt-5 mb-2">
                    {para.slice(4)}
                  </h3>
                );
              }
              // Bullet list
              if (para.startsWith('- ') || para.startsWith('* ')) {
                const items = para.split('\n').filter(l => l.trim());
                return (
                  <ul key={i} className="my-3 space-y-1.5 pl-4">
                    {items.map((item, j) => (
                      <li key={j} className="font-body text-sm text-ea-text leading-relaxed flex gap-2">
                        <span className="text-ea-cyan mt-1 flex-shrink-0">•</span>
                        <span>{item.replace(/^[-*]\s+/, '')}</span>
                      </li>
                    ))}
                  </ul>
                );
              }
              // Numbered list
              if (/^\d+\./.test(para)) {
                const items = para.split('\n').filter(l => l.trim());
                return (
                  <ol key={i} className="my-3 space-y-1.5 pl-4">
                    {items.map((item, j) => (
                      <li key={j} className="font-body text-sm text-ea-text leading-relaxed flex gap-2">
                        <span className="text-ea-gold font-mono text-xs mt-1 flex-shrink-0 w-4">{j+1}.</span>
                        <span>{item.replace(/^\d+\.\s+/, '')}</span>
                      </li>
                    ))}
                  </ol>
                );
              }
              // Normal paragraph
              if (para.trim()) {
                return (
                  <p key={i} className="font-body text-sm text-ea-text leading-relaxed my-3">
                    {para}
                  </p>
                );
              }
              return null;
            })}
          </div>

          {/* Tags */}
          {article.tags?.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mt-6 pt-5 border-t border-ea-border/50">
              <Tag className="w-3.5 h-3.5 text-ea-muted" />
              {article.tags.map(tag => (
                <span key={tag} className="font-mono text-[11px] px-2.5 py-1 rounded-lg border border-ea-border text-ea-muted">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Back to news */}
        <div className="text-center">
          <Link to="/news"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-display font-bold text-sm transition-all"
            style={{ background:'linear-gradient(135deg,#00f5ff,#0080ff)', color:'#02020a' }}>
            ← Aur Articles Padho
          </Link>
        </div>
      </div>
    </div>
  );
}
