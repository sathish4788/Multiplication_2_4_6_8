import React, { useState, useEffect } from 'react';
import { Volume2 } from 'lucide-react';
import { soundManager } from '../utils/audio';

export type MascotMood = 'happy' | 'cheering' | 'thinking' | 'splat' | 'teaching';

interface BarnabyBrushProps {
  mood?: MascotMood;
  message?: string;
  tipTa?: string;
  language?: 'en' | 'ta';
  accentColor?: string;
  size?: 'sm' | 'md' | 'lg';
  showBubble?: boolean;
}

export const BarnabyBrush: React.FC<BarnabyBrushProps> = ({
  mood = 'happy',
  message,
  tipTa,
  language = 'en',
  accentColor = '#EC4899',
  size = 'md',
  showBubble = true
}) => {
  const [blink, setBlink] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Automatic gentle eye blinking
  useEffect(() => {
    const timer = setInterval(() => {
      setBlink(true);
      setTimeout(() => setBlink(false), 220);
    }, 3500 + Math.random() * 2000);
    return () => clearInterval(timer);
  }, []);

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!message) return;
    setIsSpeaking(true);
    const textToSpeak = language === 'ta' && tipTa ? tipTa : message;
    soundManager.speakText(textToSpeak, language, () => {
      setIsSpeaking(false);
    });
  };

  const scale = size === 'sm' ? 'w-14 h-14' : size === 'lg' ? 'w-28 h-28' : 'w-20 h-20';

  return (
    <div className="flex items-center gap-3">
      {/* SVG Pixar Brush Character */}
      <div 
        onClick={handleSpeak}
        title="Tap me to hear my advice!"
        className={`relative ${scale} shrink-0 cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95 ${
          mood === 'cheering' ? 'animate-bounce' : mood === 'splat' ? 'animate-brush-wiggle' : ''
        }`}
      >
        <svg viewBox="0 0 120 120" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id="brushBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#F59E0B" />
              <stop offset="50%" stop-color="#D97706" />
              <stop offset="100%" stop-color="#B45309" />
            </linearGradient>
            <linearGradient id="metalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stop-color="#CBD5E1" />
              <stop offset="50%" stop-color="#F8FAFC" />
              <stop offset="100%" stop-color="#94A3B8" />
            </linearGradient>
            <filter id="brushGlow">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Wooden Handle Body (tilted playfully) */}
          <g transform="translate(60, 60) rotate(-15) translate(-60, -60)">
            {/* Wooden handle */}
            <path
              d="M 52,65 L 68,65 L 64,112 C 64,118 56,118 56,112 Z"
              fill="url(#brushBodyGrad)"
              stroke="#78350F"
              strokeWidth="2.5"
            />
            {/* Handle highlight */}
            <path d="M 56,68 L 56,108" stroke="#FDE68A" strokeWidth="1.5" opacity="0.6" strokeLinecap="round" />

            {/* Silver Metal Ferrule (holds the cute character face) */}
            <rect
              x="46"
              y="38"
              width="28"
              height="28"
              rx="4"
              fill="url(#metalGrad)"
              stroke="#475569"
              strokeWidth="2"
            />
            {/* Ferrule engraved lines */}
            <line x1="46" y1="46" x2="74" y2="46" stroke="#64748B" strokeWidth="1.5" />
            <line x1="46" y1="56" x2="74" y2="56" stroke="#64748B" strokeWidth="1.5" />

            {/* Yellow Soft Bristles */}
            <path
              d="M 47,38 C 45,22 42,-2 60,-2 C 78,-2 75,22 73,38 Z"
              fill="#FEF08A"
              stroke="#CA8A04"
              strokeWidth="2"
            />

            {/* Colorful Dipped Paint Tip */}
            <path
              d="M 50,15 C 47,4 60,-2 60,-2 C 60,-2 73,4 70,15 C 64,22 56,22 50,15 Z"
              fill={accentColor}
              filter="url(#brushGlow)"
            />
            {/* Magic highlight tip */}
            <circle cx="60" cy="-1" r="3.5" fill="#FFFFFF" opacity="0.9" />

            {/* Rosy Cheeks */}
            <circle cx="51" cy="54" r="3" fill="#FB7185" opacity="0.75" />
            <circle cx="69" cy="54" r="3" fill="#FB7185" opacity="0.75" />

            {/* Expressive Pixar Eyes */}
            {blink ? (
              // Closed eye curves
              <g stroke="#0F172A" strokeWidth="2" strokeLinecap="round" fill="none">
                <path d="M 50,50 Q 53,52 56,50" />
                <path d="M 64,50 Q 67,52 70,50" />
              </g>
            ) : mood === 'cheering' ? (
              // Happy crescent upward arches
              <g stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none">
                <path d="M 50,51 Q 53,47 56,51" />
                <path d="M 64,51 Q 67,47 70,51" />
              </g>
            ) : mood === 'thinking' ? (
              // One raised brow, eyes looking upper-right
              <g>
                <circle cx="53" cy="49" r="3.2" fill="#0F172A" />
                <circle cx="67" cy="47" r="3.2" fill="#0F172A" />
                <circle cx="54" cy="48" r="1.2" fill="#FFFFFF" />
                <circle cx="68" cy="46" r="1.2" fill="#FFFFFF" />
                <path d="M 64,43 Q 67,40 71,43" stroke="#0F172A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
              </g>
            ) : mood === 'splat' ? (
              // X eyes for splat
              <g stroke="#0F172A" strokeWidth="2" strokeLinecap="round">
                <line x1="50" y1="48" x2="56" y2="54" />
                <line x1="56" y1="48" x2="50" y2="54" />
                <line x1="64" y1="48" x2="70" y2="54" />
                <line x1="70" y1="48" x2="64" y2="54" />
              </g>
            ) : (
              // Standard warm happy eyes with catchlights
              <g>
                <ellipse cx="53" cy="49" rx="3" ry="4" fill="#0F172A" />
                <ellipse cx="67" cy="49" rx="3" ry="4" fill="#0F172A" />
                <circle cx="52" cy="47" r="1.3" fill="#FFFFFF" />
                <circle cx="66" cy="47" r="1.3" fill="#FFFFFF" />
                <circle cx="54" cy="50" r="0.7" fill="#FFFFFF" />
                <circle cx="68" cy="50" r="0.7" fill="#FFFFFF" />
              </g>
            )}

            {/* Mouth */}
            {mood === 'cheering' ? (
              <path d="M 56,57 Q 60,63 64,57 Z" fill="#E11D48" stroke="#0F172A" strokeWidth="1.5" />
            ) : mood === 'splat' ? (
              <path d="M 57,59 Q 60,56 63,59" stroke="#0F172A" strokeWidth="2" fill="none" strokeLinecap="round" />
            ) : (
              <path d="M 56,57 Q 60,61 64,57" stroke="#0F172A" strokeWidth="2" fill="none" strokeLinecap="round" />
            )}
          </g>
        </svg>

        {isSpeaking && (
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-pink-500"></span>
          </span>
        )}
      </div>

      {/* Speech / Tip Bubble */}
      {showBubble && message && (
        <div className="relative flex-1 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-2xl p-3 px-4 shadow-lg border border-pink-200 dark:border-pink-900/40 text-slate-800 dark:text-slate-100 max-w-xl transition-all">
          <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-r-8 border-r-white dark:border-r-slate-800" />
          
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm md:text-base font-medium leading-relaxed">
              {language === 'ta' && tipTa ? tipTa : message}
            </p>
            <button
              onClick={handleSpeak}
              className="p-1.5 rounded-full hover:bg-pink-100 dark:hover:bg-slate-700 text-pink-600 dark:text-pink-400 shrink-0 transition"
              title="Hear aloud"
            >
              <Volume2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
