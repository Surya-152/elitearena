// src/components/admin/BlogPanel.jsx — Admin: Create/Edit/Delete blog articles
import { useState, useEffect }   from 'react';
import {
  createArticle, updateArticle, deleteArticle,
  subscribeAllArticles, BLOG_CATEGORIES,
} from '../../services/blogService';
import {
  Plus, Edit2, Trash2, Eye, EyeOff, Loader,
  Save, X, CheckCircle, FileText,
} from 'lucide-react';
import { formatDistanceToNow }   from 'date-fns';
import toast                     from 'react-hot-toast';

const EMPTY_FORM = {
  title:'', excerpt:'', content:'', category:'bgmi',
  coverEmoji:'🎯', tags:'', author:'EliteArena Team', published:true,
};

export default function BlogPanel() {
  const [articles, setArticles] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [view,     setView]     = useState('list'); // list | create | edit
  const [editing,  setEditing]  = useState(null);
  const [form,     setForm]     = useState(EMPTY_FORM);
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const unsub = subscribeAllArticles(data => {
      setArticles(data);
      setLoading(false);
    });
    return unsub;
  }, []);

  const handleChange = ({ target: { name, value, type, checked } }) => {
    setForm(p => ({ ...p, [name]: type === 'checkbox' ? checked : value }));
  };

  const openCreate = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setView('create');
  };

  const openEdit = (article) => {
    setEditing(article);
    setForm({
      title:       article.title      || '',
      excerpt:     article.excerpt    || '',
      content:     article.content    || '',
      category:    article.category   || 'bgmi',
      coverEmoji:  article.coverEmoji || '🎯',
      tags:        (article.tags || []).join(', '),
      author:      article.author     || 'EliteArena Team',
      published:   article.published  !== false,
    });
    setView('edit');
  };

  const handleSave = async () => {
    if (!form.title.trim())   { toast.error('Title daalo.'); return; }
    if (!form.content.trim()) { toast.error('Content daalo.'); return; }
    setSaving(true);
    try {
      const data = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      };
      if (view === 'edit' && editing) {
        await updateArticle(editing.id, data);
        toast.success('Article update ho gaya! ✅');
      } else {
        await createArticle(data);
        toast.success('Article publish ho gaya! 🚀');
      }
      setView('list');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (article) => {
    try {
      await updateArticle(article.id, { published: !article.published });
      toast.success(article.published ? 'Draft mein move kiya.' : 'Published! 🚀');
    } catch (e) {
      toast.error(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yeh article permanently delete karna chahte ho?')) return;
    setDeleting(id);
    try {
      await deleteArticle(id);
      toast.success('Article delete ho gaya.');
    } catch (e) {
      toast.error(e.message);
    } finally {
      setDeleting(null);
    }
  };

  const inp = (err) =>
    `w-full bg-ea-deep border ${err ? 'border-ea-magenta' : 'border-ea-border'} text-white rounded-xl
    px-4 py-2.5 text-sm font-body focus:outline-none focus:border-ea-cyan/50 transition-all placeholder-ea-muted`;

  // ── Form View ──────────────────────────────────────────────────────────────
  if (view === 'create' || view === 'edit') {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setView('list')}
            className="text-ea-muted hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
          <h2 className="font-display font-bold text-white text-lg">
            {view === 'edit' ? '✏️ Article Edit Karo' : '✍️ Naya Article Likho'}
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Main content — left 2/3 */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <label className="block font-body text-sm font-medium text-ea-text mb-1.5">Title *</label>
              <input name="title" value={form.title} onChange={handleChange}
                placeholder="Article ka headline daalo…" className={inp()} />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-ea-text mb-1.5">
                Excerpt <span className="text-ea-dim text-xs">(Short summary — cards mein dikhega)</span>
              </label>
              <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={2}
                placeholder="Article ka short summary (150 chars approx)…"
                className={`${inp()} resize-none`} />
            </div>
            <div>
              <label className="block font-body text-sm font-medium text-ea-text mb-1.5">
                Content *
                <span className="text-ea-dim text-xs ml-2">
                  (Markdown supported: ## Heading, ### Sub, - bullet list, 1. numbered)
                </span>
              </label>
              <textarea name="content" value={form.content} onChange={handleChange} rows={16}
                placeholder={`## Introduction\n\nYahan se likho...\n\n## Tips\n\n- Tip 1\n- Tip 2\n- Tip 3\n\n## Conclusion\n\nSummary yahan...`}
                className={`${inp()} resize-y font-mono text-xs leading-relaxed`} />
              <p className="font-mono text-[10px] text-ea-dim mt-1">
                Words: {form.content.trim().split(/\s+/).filter(Boolean).length} ·
                Estimated read: ~{Math.ceil(form.content.trim().split(/\s+/).filter(Boolean).length / 200)} min
              </p>
            </div>
          </div>

          {/* Settings — right 1/3 */}
          <div className="space-y-4">
            <div>
              <label className="block font-body text-sm font-medium text-ea-text mb-1.5">Category *</label>
              <div className="space-y-1.5">
                {BLOG_CATEGORIES.map(cat => (
                  <button key={cat.id} type="button"
                    onClick={() => setForm(p => ({ ...p, category: cat.id }))}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl border text-left
                      font-body text-sm transition-all
                      ${form.category === cat.id
                        ? 'border-ea-cyan/40 bg-ea-cyan/8 text-white'
                        : 'border-ea-border text-ea-muted hover:text-ea-text'}`}>
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                    {form.category === cat.id && <CheckCircle className="w-3.5 h-3.5 text-ea-cyan ml-auto" />}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-body text-sm font-medium text-ea-text mb-1.5">Cover Emoji</label>
              <div className="flex gap-2 flex-wrap">
                {['🎯','🔥','💥','💰','🚀','🏆','📰','📝','⚔️','🎮','🛡️','⚡'].map(e => (
                  <button key={e} type="button"
                    onClick={() => setForm(p => ({ ...p, coverEmoji: e }))}
                    className={`w-9 h-9 rounded-lg text-lg transition-all
                      ${form.coverEmoji === e ? 'bg-ea-cyan/15 border border-ea-cyan/30 scale-110' : 'hover:bg-ea-surface border border-transparent'}`}>
                    {e}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-body text-sm font-medium text-ea-text mb-1.5">
                Tags <span className="text-ea-dim text-xs">(comma separated)</span>
              </label>
              <input name="tags" value={form.tags} onChange={handleChange}
                placeholder="BGMI, Tips, Settings"
                className={inp()} />
            </div>

            <div>
              <label className="block font-body text-sm font-medium text-ea-text mb-1.5">Author</label>
              <input name="author" value={form.author} onChange={handleChange}
                className={inp()} />
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl border border-ea-border">
              <input type="checkbox" id="published" name="published"
                checked={form.published} onChange={handleChange}
                className="w-4 h-4 accent-cyan-400 cursor-pointer" />
              <label htmlFor="published" className="font-body text-sm text-ea-text cursor-pointer">
                Publish immediately
              </label>
            </div>

            <button onClick={handleSave} disabled={saving}
              className="w-full py-3 rounded-xl font-display font-bold text-sm
                         flex items-center justify-center gap-2 transition-all active:scale-97 disabled:opacity-50"
              style={{ background:'linear-gradient(135deg,#00f5ff,#0080ff)', color:'#02020a' }}>
              {saving ? <Loader className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving…' : view === 'edit' ? 'Save Changes' : 'Publish Article'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── List View ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-ea-cyan" />
          <h2 className="font-display font-bold text-white text-lg">Blog Articles</h2>
          <span className="font-mono text-xs text-ea-muted">({articles.length} total)</span>
        </div>
        <button onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl font-display font-bold text-sm transition-all"
          style={{ background:'linear-gradient(135deg,#00f5ff,#0080ff)', color:'#02020a' }}>
          <Plus className="w-4 h-4" /> Naya Article
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader className="w-6 h-6 animate-spin text-ea-cyan mx-auto" />
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-12 rounded-2xl border border-ea-border"
             style={{ background:'rgba(16,16,31,0.5)' }}>
          <FileText className="w-10 h-10 text-ea-border mx-auto mb-3" />
          <p className="font-display font-bold text-ea-text">Koi article nahi hai</p>
          <p className="text-ea-muted text-sm mt-1">Pehla article likhne ke liye "Naya Article" button dabao</p>
          <button onClick={openCreate}
            className="mt-4 px-6 py-2.5 rounded-xl font-display font-bold text-sm"
            style={{ background:'linear-gradient(135deg,#00f5ff,#0080ff)', color:'#02020a' }}>
            <Plus className="w-4 h-4 inline mr-1" /> Likho
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {articles.map(article => {
            const cat  = BLOG_CATEGORIES.find(c => c.id === article.category) || BLOG_CATEGORIES[7];
            const date = article.createdAt?.toDate ? article.createdAt.toDate() : new Date();
            return (
              <div key={article.id}
                className="flex items-center gap-3 p-4 rounded-2xl"
                style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>
                {/* Emoji */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl flex-shrink-0"
                     style={{ background:'rgba(6,6,18,0.6)' }}>
                  {article.coverEmoji || cat.emoji}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p className="font-display font-bold text-sm text-white truncate">{article.title}</p>
                    {!article.published && (
                      <span className="badge-magenta text-[9px]">DRAFT</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 font-mono text-[10px] text-ea-muted">
                    <span>{cat.emoji} {cat.label}</span>
                    <span>·</span>
                    <span>{formatDistanceToNow(date, { addSuffix: true })}</span>
                    <span>·</span>
                    <span>👁 {article.views || 0}</span>
                    <span>·</span>
                    <span>~{article.readMin || 3} min</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 flex-shrink-0">
                  {/* Toggle publish */}
                  <button onClick={() => togglePublish(article)}
                    title={article.published ? 'Draft mein le jao' : 'Publish karo'}
                    className="p-2 rounded-lg transition-all hover:bg-ea-surface">
                    {article.published
                      ? <Eye className="w-4 h-4 text-ea-green" />
                      : <EyeOff className="w-4 h-4 text-ea-muted" />}
                  </button>
                  {/* Edit */}
                  <button onClick={() => openEdit(article)}
                    className="p-2 rounded-lg hover:bg-ea-surface transition-all">
                    <Edit2 className="w-4 h-4 text-ea-cyan" />
                  </button>
                  {/* Delete */}
                  <button onClick={() => handleDelete(article.id)}
                    disabled={deleting === article.id}
                    className="p-2 rounded-lg hover:bg-ea-magenta/10 transition-all disabled:opacity-50">
                    {deleting === article.id
                      ? <Loader className="w-4 h-4 animate-spin text-ea-magenta" />
                      : <Trash2 className="w-4 h-4 text-ea-magenta" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
