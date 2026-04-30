// src/components/common/NotificationBell.jsx
import { useState, useRef, useEffect } from 'react';
import { Bell, X, CheckCheck, Trophy, Zap, Radio, AlertCircle } from 'lucide-react';
import { useNotifications }            from '../../hooks/useNotifications';
import { useAuth }                     from '../../context/AuthContext';
import { formatDistanceToNow }         from 'date-fns';

const TYPE_CONFIG = {
  prize_credited:   { icon: Trophy,      color: 'text-ea-gold',  dot: 'bg-ea-gold'  },
  tournament_live:  { icon: Radio,       color: 'text-ea-magenta',  dot: 'bg-ea-magenta'  },
  tournament_full:  { icon: AlertCircle, color: 'text-ea-cyan',  dot: 'bg-ea-cyan'  },
  balance_adjusted: { icon: Zap,         color: 'text-ea-green', dot: 'bg-ea-green' },
  system:           { icon: Bell,        color: 'text-ea-muted', dot: 'bg-ea-dim' },
};

export default function NotificationBell() {
  const { userProfile }                             = useAuth();
  const { notifications, unreadCount, markRead,
          markAllRead }                             = useNotifications(userProfile?.uid);
  const [open, setOpen]                             = useState(false);
  const panelRef                                    = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen(p => !p);
  };

  const handleMarkRead = (id) => {
    markRead(id);
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative p-2 text-ea-muted hover:text-white transition-colors rounded-lg
                   hover:bg-ea-border/50"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-ea-magenta text-white text-[9px]
                           font-mono font-bold rounded-full flex items-center justify-center
                           animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-ea-card border border-ea-border
                        rounded-2xl shadow-card z-50 overflow-hidden animate-slide-up">

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-ea-border">
            <span className="font-display font-bold text-white text-sm">Notifications</span>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllRead}
                  className="text-ea-cyan text-xs font-mono hover:text-cyan-300
                             flex items-center gap-1 transition-colors"
                >
                  <CheckCheck className="w-3 h-3" /> All read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="text-ea-muted hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <Bell className="w-8 h-8 text-ea-border mx-auto mb-2" />
                <p className="text-ea-text text-sm font-bold">All clear</p>
                <p className="text-ea-muted text-xs mt-1">No notifications yet.</p>
              </div>
            ) : (
              notifications.map(n => {
                const cfg  = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.system;
                const Icon = cfg.icon;
                const date = n.createdAt?.toDate ? n.createdAt.toDate() : new Date();

                return (
                  <div
                    key={n.id}
                    onClick={() => !n.read && handleMarkRead(n.id)}
                    className={`flex items-start gap-3 px-4 py-3 border-b border-ea-border/50
                                last:border-0 cursor-pointer transition-colors
                                ${n.read
                                  ? 'hover:bg-ea-deep/30'
                                  : 'bg-ea-cyan/3 hover:bg-ea-cyan/6'}`}
                  >
                    {/* Icon */}
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center
                                     flex-shrink-0 mt-0.5
                                     ${n.read ? 'bg-ea-deep' : 'bg-ea-deep/80 border border-ea-border'}`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-body font-medium leading-tight
                                     ${n.read ? 'text-ea-muted' : 'text-white'}`}>
                        {n.title}
                      </p>
                      {n.body && (
                        <p className="text-ea-muted text-xs mt-0.5 leading-snug line-clamp-2">
                          {n.body}
                        </p>
                      )}
                      <p className="text-ea-muted/60 text-[10px] font-mono mt-1">
                        {formatDistanceToNow(date, { addSuffix: true })}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!n.read && (
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${cfg.dot}`} />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
