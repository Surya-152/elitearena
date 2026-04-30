// src/components/common/AmbientSound.jsx
// Subtle esports ambient background sound using Web Audio API
// No external files needed — generates procedural ambient sound
import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX } from 'lucide-react';

const STORAGE_KEY = 'ea_ambient_enabled';

function createAmbientAudio(ctx) {
  const nodes = [];

  // ── Deep sub-bass drone (60 Hz) ──────────────────────────────────────────
  const bass = ctx.createOscillator();
  const bassGain = ctx.createGain();
  bass.type = 'sine';
  bass.frequency.value = 60;
  bassGain.gain.value = 0.015;
  bass.connect(bassGain);
  bassGain.connect(ctx.destination);
  bass.start();
  nodes.push(bass, bassGain);

  // ── Mid drone (120 Hz, slightly detuned) ─────────────────────────────────
  const mid = ctx.createOscillator();
  const midGain = ctx.createGain();
  mid.type = 'sine';
  mid.frequency.value = 120.3;
  midGain.gain.value = 0.008;
  mid.connect(midGain);
  midGain.connect(ctx.destination);
  mid.start();
  nodes.push(mid, midGain);

  // ── High shimmer (480 Hz, very quiet) ────────────────────────────────────
  const shimmer = ctx.createOscillator();
  const shimmerGain = ctx.createGain();
  shimmer.type = 'sine';
  shimmer.frequency.value = 480;
  shimmerGain.gain.value = 0.003;
  // Slow LFO modulation
  const lfo = ctx.createOscillator();
  const lfoGain = ctx.createGain();
  lfo.frequency.value = 0.1;
  lfoGain.gain.value = 0.002;
  lfo.connect(lfoGain);
  lfoGain.connect(shimmerGain.gain);
  lfo.start();
  shimmer.connect(shimmerGain);
  shimmerGain.connect(ctx.destination);
  shimmer.start();
  nodes.push(shimmer, shimmerGain, lfo, lfoGain);

  // ── Subtle noise (atmosphere) ─────────────────────────────────────────────
  const bufferSize = ctx.sampleRate * 2;
  const buffer     = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data       = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) data[i] = (Math.random() * 2 - 1) * 0.004;
  const noise     = ctx.createBufferSource();
  noise.buffer    = buffer;
  noise.loop      = true;
  const noiseFilter = ctx.createBiquadFilter();
  noiseFilter.type = 'bandpass';
  noiseFilter.frequency.value  = 200;
  noiseFilter.Q.value          = 0.5;
  const noiseGain = ctx.createGain();
  noiseGain.gain.value = 0.4;
  noise.connect(noiseFilter);
  noiseFilter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start();
  nodes.push(noise, noiseFilter, noiseGain);

  return nodes;
}

export default function AmbientSound() {
  const [enabled, setEnabled] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) === 'true'; } catch { return false; }
  });
  const [started,  setStarted]  = useState(false);
  const [volume,   setVolume]   = useState(0.4);
  const [showSlider, setShowSlider] = useState(false);
  const ctxRef    = useRef(null);
  const nodesRef  = useRef([]);
  const masterRef = useRef(null);

  const start = useCallback(() => {
    if (ctxRef.current) return;
    try {
      const ctx    = new (window.AudioContext || window.webkitAudioContext)();
      const master = ctx.createGain();
      master.gain.value = volume * 0.3; // overall volume cap
      master.connect(ctx.destination);
      ctxRef.current  = ctx;
      masterRef.current = master;
      // Rewire destination through master gain
      const nodes = createAmbientAudio(ctx);
      nodesRef.current = nodes;
      setStarted(true);
    } catch (e) {
      // Web Audio not supported
    }
  }, [volume]);

  const stop = useCallback(() => {
    try {
      nodesRef.current.forEach(n => { try { n.stop?.(); n.disconnect?.(); } catch {} });
      ctxRef.current?.close();
    } catch {}
    ctxRef.current  = null;
    masterRef.current = null;
    nodesRef.current  = [];
    setStarted(false);
  }, []);

  useEffect(() => {
    if (enabled) start();
    else stop();
    try { localStorage.setItem(STORAGE_KEY, String(enabled)); } catch {}
    return () => { if (!enabled) stop(); };
  }, [enabled]);

  // Update volume in real time
  useEffect(() => {
    if (ctxRef.current && masterRef.current) {
      masterRef.current.gain.setTargetAtTime(volume * 0.3, ctxRef.current.currentTime, 0.1);
    }
  }, [volume]);

  const toggle = () => setEnabled(p => !p);

  return (
    <div className="fixed bottom-5 right-5 z-40 flex items-end gap-2"
         style={{ pointerEvents:'auto' }}>

      {/* Volume slider — visible on hover */}
      {showSlider && enabled && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl animate-fade-in"
             style={{ background:'rgba(10,10,20,0.95)', border:'1px solid rgba(0,245,255,0.2)' }}>
          <span className="font-mono text-[10px] text-ea-muted">VOL</span>
          <input type="range" min="0" max="1" step="0.05" value={volume}
            onChange={e => setVolume(parseFloat(e.target.value))}
            className="w-20 h-1 accent-cyan-400 cursor-pointer" />
        </div>
      )}

      {/* Sound button */}
      <button
        onClick={toggle}
        onMouseEnter={() => setShowSlider(true)}
        onMouseLeave={() => setShowSlider(false)}
        title={enabled ? 'Ambient sound off' : 'Ambient sound on'}
        className={`w-10 h-10 rounded-xl flex items-center justify-center
                    transition-all duration-300 active:scale-95 shadow-[0_4px_16px_rgba(0,0,0,0.5)]
          ${enabled
            ? 'bg-ea-cyan/15 border border-ea-cyan/35 text-ea-cyan hover:bg-ea-cyan/25'
            : 'bg-ea-deep/80 border border-ea-border text-ea-dim hover:text-ea-muted hover:border-ea-rim'}`}>
        {enabled
          ? <Volume2 className="w-4 h-4 animate-pulse" style={{ animationDuration:'3s' }} />
          : <VolumeX className="w-4 h-4" />}
      </button>
    </div>
  );
}
