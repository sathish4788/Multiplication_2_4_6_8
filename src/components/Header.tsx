import React from 'react';
import { Home, Volume2, VolumeX, Globe, Sparkles, KeyRound, Fish, Waves } from 'lucide-react';
import { GameMode, TableNumber, Language } from '../types/game';
import { PWAInstallBanner } from './PWAInstallBanner';

interface HeaderProps {
  currentMode: GameMode;
  selectedTable: TableNumber;
  paintDrops: number;
  totalStars: number;
  soundEnabled: boolean;
  language: Language;
  onSelectMode: (mode: GameMode) => void;
  onToggleSound: () => void;
  onToggleLanguage: () => void;
  onOpenBackup: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  selectedTable,
  paintDrops,
  totalStars,
  soundEnabled,
  language,
  onSelectMode,
  onToggleSound,
  onToggleLanguage,
  onOpenBackup,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/90 backdrop-blur-md border-b border-indigo-900/60 safe-pt px-3 py-2.5 sm:px-6 transition-all">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Logo & Home Navigation */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => onSelectMode('home')}
            className="flex items-center gap-2 group text-left cursor-pointer"
            title="Go to Home Screen"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-500 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform p-1.5 border border-amber-300/40">
              {/* Paintbrush & palette icon */}
              <svg viewBox="0 0 40 40" className="w-full h-full">
                <circle cx="12" cy="12" r="5" fill="#EC4899" />
                <circle cx="28" cy="12" r="5" fill="#F97316" />
                <circle cx="32" cy="26" r="5" fill="#10B981" />
                <path d="M 10,26 L 22,14 L 26,18 L 14,30 Z" fill="#FDE047" stroke="#78350F" strokeWidth="1.5" />
                <circle cx="10" cy="30" r="3" fill="#EC4899" />
              </svg>
            </div>
            <div>
              <h1 className="text-base sm:text-lg font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-300 to-purple-300">
                {language === 'ta' ? 'மேஜிக் வாய்ப்பாடு' : 'Table Magic'}
              </h1>
              <span className="text-[10px] sm:text-xs font-semibold text-cyan-300 block -mt-0.5">
                {language === 'ta' ? 'வலை வேட்டை அரங்கம்' : 'Net Catch Studio'}
              </span>
            </div>
          </button>

          {currentMode !== 'home' && (
            <div className="hidden md:flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-xl border border-slate-700 text-xs text-slate-300">
              <span className="text-amber-400 font-bold">×{selectedTable}</span>
              <span>Table</span>
            </div>
          )}
        </div>

        {/* Currency & Rewards Counter */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Paint Drops Balance */}
          <div 
            onClick={() => onSelectMode('fish-catch')}
            className="flex items-center gap-1.5 bg-gradient-to-r from-cyan-950/70 to-blue-950/70 border border-cyan-500/40 px-2.5 sm:px-3.5 py-1.5 rounded-2xl shadow-inner cursor-pointer hover:border-cyan-400 active:scale-95 transition"
            title="Paint Drops collected"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5 text-cyan-400 fill-cyan-500 drop-shadow">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
            <span className="text-sm sm:text-base font-black text-cyan-300">{paintDrops}</span>
            <span className="hidden sm:inline text-[11px] font-bold text-cyan-200/80">
              {language === 'ta' ? 'துளிகள்' : 'Drops'}
            </span>
          </div>

          {/* Stars Counter */}
          <div className="flex items-center gap-1 bg-amber-950/60 border border-amber-500/40 px-2.5 sm:px-3 py-1.5 rounded-2xl shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
            <span className="text-sm sm:text-base font-black text-amber-300">{totalStars}/12</span>
          </div>

          {/* "Fish Net Catch" Featured Button */}
          <button
            onClick={() => onSelectMode('fish-catch')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-2xl font-black text-xs sm:text-sm border-2 transition active:scale-95 cursor-pointer shadow-lg ${
              currentMode === 'fish-catch'
                ? 'bg-cyan-400 text-slate-900 border-cyan-200 ring-2 ring-cyan-400/50 scale-102'
                : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-cyan-300/60'
            }`}
          >
            <span className="text-sm">🎣</span>
            <span>{language === 'ta' ? 'மீன் வலை வேட்டை' : 'Fish Net Catch'}</span>
          </button>

          {/* In-app Install banner / button */}
          <PWAInstallBanner />

          {/* Quick Utility Toggles: Sound, Language, Backup */}
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleSound}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition cursor-pointer"
              title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
            </button>

            <button
              onClick={onToggleLanguage}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 transition font-bold text-xs cursor-pointer"
              title="Toggle Language: English / தமிழ்"
            >
              <Globe className="w-3.5 h-3.5 text-sky-400" />
              <span>{language === 'en' ? 'EN' : 'தமிழ்'}</span>
            </button>

            <button
              onClick={onOpenBackup}
              className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-amber-300 hover:bg-slate-700 transition cursor-pointer"
              title="Backup / Restore Progress"
            >
              <KeyRound className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
