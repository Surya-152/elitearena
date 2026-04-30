// src/components/chat/TournamentChat.jsx — Real-time Firestore-powered chat
import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Smile }  from 'lucide-react';
import {
  collection, addDoc, onSnapshot,
  query, orderBy, limit, serverTimestamp,
} from 'firebase/firestore';
import { db }     from '../../config/firebase';
import { useAuth } from '../../context/AuthContext';
import toast       from 'react-hot-toast';

const EMOJIS = ['🔥','💥','🎮','👑','⚡','🏆','💪','👏','😎','🚀'];
const BAD_WORDS = ['fuck','shit','bastard','mc','bc','chutiya','madarchod','bhenchod'];

function filterMsg(txt) {
  let out = txt;
  BAD_WORDS.forEach(w => { out = out.replace(new RegExp(w,'gi'), '***'); });
  return out;
}

export default function TournamentChat({ tournamentId, isRegistered }) {
  const { userProfile } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input,    setInput]    = useState('');
  const [sending,  setSending]  = useState(false);
  const [showEmoji,setEmoji]    = useState(false);
  const bottomRef  = useRef(null);
  const inputRef   = useRef(null);

  useEffect(() => {
    if (!tournamentId) return;
    const q = query(
      collection(db, 'tournament_chats', tournamentId, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(100)
    );
    const unsub = onSnapshot(q, snap => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, () => {});
    return unsub;
  }, [tournamentId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [messages]);

  const sendMsg = async (e) => {
    e?.preventDefault();
    if (!input.trim() || !userProfile || sending) return;
    if (!isRegistered) { toast.error('Chat ke liye tournament join karo.'); return; }

    const text = filterMsg(input.trim().slice(0, 200));
    if (!text) return;

    setSending(true);
    setInput('');
    try {
      await addDoc(collection(db, 'tournament_chats', tournamentId, 'messages'), {
        uid:        userProfile.uid,
        username:   userProfile.username,
        text,
        createdAt:  serverTimestamp(),
        hasPass:    userProfile.elitePassActive || false,
      });
    } catch { toast.error('Message nahi gaya.'); }
    finally { setSending(false); inputRef.current?.focus(); }
  };

  const addEmoji = (emoji) => {
    setInput(p => (p + emoji).slice(0, 200));
    setEmoji(false);
    inputRef.current?.focus();
  };

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden"
         style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)', height:'400px' }}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-ea-border/50 flex items-center gap-2 flex-shrink-0">
        <MessageSquare className="w-4 h-4 text-ea-cyan" />
        <span className="font-display font-bold text-white text-sm">Match Chat</span>
        <span className="ml-auto font-mono text-[10px] text-ea-dim">{messages.length} msgs</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="w-8 h-8 text-ea-border mx-auto mb-2" />
            <p className="font-body text-xs text-ea-muted">
              {isRegistered ? 'Pehla message bhejo!' : 'Join karo chat ke liye'}
            </p>
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.uid === userProfile?.uid;
          const time = msg.createdAt?.toDate
            ? msg.createdAt.toDate().toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit'})
            : '';
          return (
            <div key={msg.id} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center
                              flex-shrink-0 font-mono text-[10px] font-bold
                ${isMe ? 'bg-ea-cyan/20 text-ea-cyan' : 'bg-ea-surface text-ea-muted'}`}>
                {(msg.username||'?')[0].toUpperCase()}
              </div>
              <div className={`max-w-[75%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                <div className="flex items-center gap-1.5">
                  <span className={`font-mono text-[10px] ${isMe ? 'text-ea-cyan' : 'text-ea-muted'}`}>
                    {msg.username}
                    {msg.hasPass && ' 👑'}
                  </span>
                  <span className="font-mono text-[9px] text-ea-dim">{time}</span>
                </div>
                <div className={`px-3 py-1.5 rounded-xl font-body text-sm leading-relaxed
                  ${isMe
                    ? 'bg-ea-cyan/15 border border-ea-cyan/20 text-white'
                    : 'bg-ea-surface/80 border border-ea-border/50 text-ea-text'}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="px-3 py-3 border-t border-ea-border/50 flex-shrink-0 relative">
        {showEmoji && (
          <div className="absolute bottom-full left-0 right-0 p-2 mb-1 rounded-xl flex flex-wrap gap-1
                          bg-ea-deep border border-ea-border shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
            {EMOJIS.map(e => (
              <button key={e} onClick={() => addEmoji(e)}
                className="w-8 h-8 text-lg hover:bg-ea-surface rounded-lg transition-all">{e}</button>
            ))}
          </div>
        )}
        <form onSubmit={sendMsg} className="flex gap-2">
          <button type="button" onClick={() => setEmoji(!showEmoji)}
            className="p-2 rounded-lg text-ea-muted hover:text-ea-cyan transition-colors flex-shrink-0">
            <Smile className="w-4 h-4" />
          </button>
          <input ref={inputRef} value={input}
            onChange={e => setInput(e.target.value)}
            disabled={!isRegistered}
            placeholder={isRegistered ? 'Message likhein…' : 'Join karo chat ke liye'}
            maxLength={200}
            className="input-cyber flex-1 text-sm py-2 disabled:opacity-50 disabled:cursor-not-allowed" />
          <button type="submit" disabled={!input.trim() || sending || !isRegistered}
            className="p-2 rounded-xl flex-shrink-0 transition-all disabled:opacity-40"
            style={{ background:'linear-gradient(135deg,#00f5ff,#0080ff)' }}>
            <Send className="w-4 h-4 text-ea-void" />
          </button>
        </form>
      </div>
    </div>
  );
}
