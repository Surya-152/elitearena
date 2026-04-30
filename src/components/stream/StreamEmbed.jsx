// src/components/stream/StreamEmbed.jsx
// YouTube + Twitch live stream embed for tournament pages
import { useState } from 'react';
import { Youtube, Twitch, Tv, ExternalLink, X } from 'lucide-react';

const PLATFORMS = {
  youtube: {
    name:  'YouTube',
    icon:  Youtube,
    color: 'text-red-500',
    bg:    'bg-red-500/10 border-red-500/25',
    embedUrl: (id) => `https://www.youtube.com/embed/${id}?autoplay=1&mute=1`,
  },
  twitch: {
    name:  'Twitch',
    icon:  Twitch,
    color: 'text-purple-400',
    bg:    'bg-purple-500/10 border-purple-500/25',
    // Twitch embed needs parent domain param
    embedUrl: (channel) =>
      `https://player.twitch.tv/?channel=${channel}&parent=${window.location.hostname}&muted=true`,
  },
};

// Extracts YouTube ID from various URL formats
function extractYouTubeId(url) {
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/live\/)([^&?\s]+)/);
  return m ? m[1] : url;
}

export default function StreamEmbed({ tournament }) {
  const [expanded, setExpanded] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [activeStream, setActiveStream] = useState(null);

  // Tournament can have stream_url and stream_platform set by admin
  const streamUrl      = tournament?.stream_url || '';
  const streamPlatform = tournament?.stream_platform || 'youtube';
  const chatUrl        = tournament?.stream_chat_url || '';

  const hasStream = !!streamUrl;
  const cfg = PLATFORMS[streamPlatform] || PLATFORMS.youtube;
  const PlatformIcon = cfg.icon;

  const getEmbedUrl = (url, platform) => {
    if (platform === 'youtube') {
      const id = extractYouTubeId(url);
      return PLATFORMS.youtube.embedUrl(id);
    }
    if (platform === 'twitch') {
      return PLATFORMS.twitch.embedUrl(url);
    }
    return '';
  };

  const embedUrl = activeStream
    ? getEmbedUrl(activeStream.url, activeStream.platform)
    : hasStream ? getEmbedUrl(streamUrl, streamPlatform) : '';

  return (
    <div className="rounded-2xl overflow-hidden"
         style={{ background:'linear-gradient(145deg,#10101f,#0c0c1e)', border:'1px solid rgba(30,30,58,0.8)' }}>

      {/* Header */}
      <div className="px-5 py-4 flex items-center justify-between border-b border-ea-border/50">
        <div className="flex items-center gap-2">
          <Tv className="w-4 h-4 text-ea-magenta" />
          <span className="font-display font-bold text-white text-sm">Live Stream</span>
          {(hasStream || activeStream) && (
            <span className="badge-live text-[10px]">● LIVE</span>
          )}
        </div>
        {(hasStream || activeStream) && (
          <button onClick={() => setExpanded(!expanded)}
            className="font-mono text-xs text-ea-cyan hover:underline">
            {expanded ? 'Collapse' : 'Expand'}
          </button>
        )}
      </div>

      {/* Stream iframe */}
      {(hasStream || activeStream) && (
        <div className={`relative transition-all duration-500 ${expanded ? 'h-72 sm:h-96' : 'h-48 sm:h-64'}`}>
          <iframe
            src={embedUrl}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Live Stream"
          />
        </div>
      )}

      {/* No stream state */}
      {!hasStream && !activeStream && (
        <div className="p-6">
          <div className="text-center py-4">
            <Tv className="w-10 h-10 text-ea-border mx-auto mb-2" />
            <p className="font-body text-sm text-ea-muted">Stream abhi available nahi hai</p>
            <p className="font-body text-xs text-ea-dim mt-1">
              Tournament LIVE hone pe stream yahaan dikhega
            </p>
          </div>

          {/* Manual stream URL input */}
          <div className="mt-4 space-y-2">
            <p className="font-mono text-xs text-ea-muted">Koi aur stream link hai? Enter karo:</p>
            <div className="flex gap-2">
              <input value={manualUrl} onChange={e => setManualUrl(e.target.value)}
                placeholder="YouTube/Twitch URL…"
                className="input-cyber flex-1 text-xs" />
              <button
                onClick={() => {
                  if (!manualUrl.trim()) return;
                  const isYT = manualUrl.includes('youtube') || manualUrl.includes('youtu.be');
                  setActiveStream({ url: manualUrl.trim(), platform: isYT ? 'youtube' : 'twitch' });
                }}
                className="btn-neon-cyan px-3 py-2 rounded-xl text-xs flex-shrink-0">
                Watch
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Platform info + chat link */}
      {(hasStream || activeStream) && (
        <div className="px-5 py-3 flex items-center justify-between border-t border-ea-border/50">
          <div className={`flex items-center gap-1.5 ${cfg.color}`}>
            <PlatformIcon className="w-3.5 h-3.5" />
            <span className="font-mono text-xs">{cfg.name}</span>
          </div>
          {chatUrl && (
            <a href={chatUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 font-mono text-xs text-ea-cyan hover:underline">
              Live Chat <ExternalLink className="w-3 h-3" />
            </a>
          )}
          {activeStream && (
            <button onClick={() => setActiveStream(null)}
              className="text-ea-muted hover:text-ea-magenta transition-colors ml-2">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
