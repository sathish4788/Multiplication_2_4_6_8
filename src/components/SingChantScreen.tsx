import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RotateCcw, Volume2, Sparkles, CheckCircle2, ArrowLeft } from 'lucide-react';
import { TableNumber, Language } from '../types/game';
import { TABLES_CONFIG } from '../data/tablesData';
import { BarnabyBrush } from './BarnabyBrush';
import { soundManager } from '../utils/audio';

interface SingChantScreenProps {
  selectedTable: TableNumber;
  language: Language;
  onBack: () => void;
  onEarnDrops: (amount: number) => void;
  onCompletePractice: () => void;
}

export const SingChantScreen: React.FC<SingChantScreenProps> = ({
  selectedTable,
  language,
  onBack,
  onEarnDrops,
  onCompletePractice,
}) => {
  const config = TABLES_CONFIG[selectedTable];
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeBlobIdx, setActiveBlobIdx] = useState<number>(-1);
  const [tapAlongMode, setTapAlongMode] = useState<boolean>(false);
  const [tappedIndices, setTappedIndices] = useState<Set<number>>(new Set());
  const [gapFillMode, setGapFillMode] = useState<boolean>(false); // Mic-free sing-along: gaps to fill
  const [gapIndices, setGapIndices] = useState<Set<number>>(new Set([2, 5, 8])); // Masked gaps
  const [completedCycles, setCompletedCycles] = useState<number>(0);
  const [beatPulse, setBeatPulse] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Stop sound on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      soundManager.stopSpeaking();
    };
  }, []);

  // Update gap indices when gap fill mode is toggled or round completes
  useEffect(() => {
    if (gapFillMode) {
      // Pick 2-3 random blobs to be silent gaps
      const gaps = new Set<number>();
      while (gaps.size < 3) {
        const rand = Math.floor(Math.random() * config.chantBlobs.length);
        if (!config.chantBlobs[rand].isChorus) {
          gaps.add(rand);
        }
      }
      setGapIndices(gaps);
    } else {
      setGapIndices(new Set());
    }
  }, [gapFillMode, selectedTable]);

  const startPlayback = () => {
    setIsPlaying(true);
    setActiveBlobIdx(0);
    playStep(0);
  };

  const pausePlayback = () => {
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    soundManager.stopSpeaking();
  };

  const resetPlayback = () => {
    pausePlayback();
    setActiveBlobIdx(-1);
    setTappedIndices(new Set());
  };

  const playStep = (idx: number) => {
    if (idx >= config.chantBlobs.length) {
      // Completed one chant round
      soundManager.playFanfare();
      onEarnDrops(3);
      onCompletePractice();
      setCompletedCycles((c) => c + 1);
      setIsPlaying(false);
      setActiveBlobIdx(-1);
      return;
    }

    setActiveBlobIdx(idx);
    setBeatPulse(true);
    setTimeout(() => setBeatPulse(false), 200);

    const blob = config.chantBlobs[idx];
    const isGap = gapFillMode && gapIndices.has(idx);

    // Play metronome beat
    soundManager.playBeat(idx % 2 === 0);

    if (isGap) {
      // In gap mode, do not speak out loud! Give 1.4s gap for child to sing
      timerRef.current = setTimeout(() => {
        playStep(idx + 1);
      }, 1400);
    } else {
      // Speak blob text
      const speechText = language === 'ta' ? blob.textTa : blob.text;
      soundManager.speakText(speechText, language, () => {
        // Delay to next beat
        timerRef.current = setTimeout(() => {
          playStep(idx + 1);
        }, 550);
      });
    }
  };

  // Handle tap along mode
  const handleBlobTap = (idx: number) => {
    if (!tapAlongMode && !isPlaying) {
      // Preview tap
      const blob = config.chantBlobs[idx];
      soundManager.playPop(1.2);
      soundManager.speakText(language === 'ta' ? blob.textTa : blob.text, language);
      return;
    }

    if (tapAlongMode) {
      if (!tappedIndices.has(idx)) {
        soundManager.playPop(1.3);
        const next = new Set(tappedIndices);
        next.add(idx);
        setTappedIndices(next);
        onEarnDrops(1);

        if (next.size === config.chantBlobs.length) {
          soundManager.playFanfare();
        }
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-2xl font-bold text-sm border border-slate-700 transition active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'ta' ? 'முதன்மைப் பக்கம்' : 'Back to Studio'}</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Metronome Beat Indicator */}
          <div className="flex items-center gap-2 bg-slate-800/90 px-3.5 py-1.5 rounded-2xl border border-indigo-500/40">
            <span className="text-xs font-bold text-slate-400">
              {language === 'ta' ? 'தாளம்' : 'Metronome'}
            </span>
            <div className="flex items-center gap-1">
              <span
                className={`w-3 h-3 rounded-full transition-transform ${
                  beatPulse ? 'scale-150 bg-pink-500 shadow-lg shadow-pink-500/50' : 'bg-slate-600'
                }`}
              />
              <span
                className={`w-3 h-3 rounded-full transition-transform ${
                  beatPulse ? 'scale-150 bg-amber-400 shadow-lg shadow-amber-400/50' : 'bg-slate-600'
                }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Title & Full Chant Banner */}
      <div className="bg-gradient-to-r from-purple-900/70 via-indigo-900/70 to-pink-900/70 rounded-3xl p-5 border-2 border-indigo-400/30 shadow-xl text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 text-xs font-black uppercase tracking-wider border border-pink-500/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{language === 'ta' ? 'பாடிப் பழகுவோம்' : 'Karaoke Chant'} ×{selectedTable}</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-amber-300 tracking-tight">
          "{language === 'ta' ? config.chantFullText.ta : config.chantFullText.en}"
        </h2>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto">
          {language === 'ta'
            ? 'ஒவ்வொரு எண்ணும் குறிப்பிட்ட வண்ணத்தில் ஒளிரும். தாளத்தோடு பாடி சுழற்சியை உணருங்கள்!'
            : 'Each digit lights up in its fixed signature paint color. Feel the rhythm of the cycles!'}
        </p>
      </div>

      {/* Control Bar: Play / Pause / Modes */}
      <div className="bg-slate-800/90 p-4 rounded-3xl border border-slate-700 shadow-lg flex flex-wrap items-center justify-between gap-4">
        {/* Playback Controls */}
        <div className="flex items-center gap-3">
          {!isPlaying ? (
            <button
              onClick={startPlayback}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black px-6 py-3 rounded-2xl shadow-lg border border-emerald-300/40 text-base active:scale-95 transition cursor-pointer"
            >
              <Play className="w-5 h-5 fill-white" />
              <span>{language === 'ta' ? 'பாடத் தொடங்கு' : 'Sing Chant'}</span>
            </button>
          ) : (
            <button
              onClick={pausePlayback}
              className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-slate-900 font-black px-6 py-3 rounded-2xl shadow-lg text-base active:scale-95 transition cursor-pointer"
            >
              <Pause className="w-5 h-5 fill-slate-900" />
              <span>{language === 'ta' ? 'நிறுத்து' : 'Pause'}</span>
            </button>
          )}

          <button
            onClick={resetPlayback}
            className="p-3 bg-slate-700 hover:bg-slate-600 text-slate-200 rounded-2xl transition cursor-pointer"
            title="Reset to beginning"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Interactive Mode Toggles */}
        <div className="flex items-center gap-3 flex-wrap">
          {/* Tap along toggle */}
          <button
            onClick={() => {
              setTapAlongMode(!tapAlongMode);
              setTappedIndices(new Set());
              soundManager.playPop(1.0);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm border-2 transition active:scale-95 cursor-pointer ${
              tapAlongMode
                ? 'bg-pink-600 text-white border-pink-300 shadow-md shadow-pink-500/30'
                : 'bg-slate-700 text-slate-300 border-slate-600 hover:border-pink-400'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>{language === 'ta' ? 'தொட்டு நிரப்பும் முறை' : 'Tap Along Mode'}</span>
          </button>

          {/* Mic-free sing-along (Gap fill) toggle */}
          <button
            onClick={() => {
              setGapFillMode(!gapFillMode);
              soundManager.playPop(1.1);
            }}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm border-2 transition active:scale-95 cursor-pointer ${
              gapFillMode
                ? 'bg-amber-500 text-slate-900 border-amber-200 shadow-md shadow-amber-500/30'
                : 'bg-slate-700 text-slate-300 border-slate-600 hover:border-amber-400'
            }`}
          >
            <Volume2 className="w-4 h-4" />
            <span>{language === 'ta' ? 'நீங்களே பாடுங்கள் (இடைவெளி)' : 'Mic-Free Sing-Along'}</span>
          </button>
        </div>
      </div>

      {/* Paint Blobs Grid (Rhythm Board) */}
      <div className="bg-slate-800/80 border-2 border-indigo-500/30 rounded-3xl p-6 shadow-2xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6">
          {config.chantBlobs.map((blob, idx) => {
            const isActive = activeBlobIdx === idx;
            const isChorus = blob.isChorus;
            const isGap = gapFillMode && gapIndices.has(idx);
            const isTapped = tappedIndices.has(idx);

            // Determine digit color
            const digitColor = blob.digit !== undefined ? config.cycleDigitColors[blob.digit] : null;
            const paintHex = digitColor ? digitColor.hex : '#8B5CF6';

            return (
              <div
                key={idx}
                onClick={() => handleBlobTap(idx)}
                className={`relative group rounded-3xl p-4 sm:p-5 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 select-none ${
                  isChorus ? 'col-span-2 sm:col-span-3 md:col-span-4 bg-gradient-to-r from-indigo-900/80 via-purple-900/80 to-pink-900/80 border-2 border-pink-400/40' : ''
                } ${
                  isActive
                    ? 'scale-110 shadow-2xl ring-4 ring-amber-300 z-10 animate-blob-bounce'
                    : 'hover:scale-105'
                } ${
                  tapAlongMode && !isTapped && !isActive
                    ? 'opacity-60 bg-slate-800 border-2 border-dashed border-slate-600'
                    : 'bg-slate-900/90 border-2 border-slate-700'
                }`}
                style={{
                  boxShadow: isActive ? `0 0 30px ${paintHex}88` : undefined
                }}
              >
                {/* SVG Paint Blob Background */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                    <path
                      d="M 50,8 C 75,5 92,20 90,48 C 88,75 75,92 48,90 C 20,88 8,75 10,48 C 12,20 25,10 50,8 Z"
                      fill={isGap ? '#334155' : tapAlongMode && !isTapped && !isActive ? '#1E293B' : paintHex}
                      className="transition-colors duration-300"
                    />
                  </svg>

                  {/* Text on Blob */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    {isGap ? (
                      <span className="text-3xl font-black text-amber-300 animate-pulse">
                        ? ?
                      </span>
                    ) : (
                      <div className="flex items-baseline justify-center">
                        {/* Tens Box */}
                        {blob.tens !== undefined && blob.tens > 0 && (
                          <span className="text-2xl sm:text-3xl font-mono font-bold text-white/90 mr-0.5">
                            {blob.tens}
                          </span>
                        )}
                        {/* Ones Digit painted in cycle color */}
                        <span className="text-3xl sm:text-4xl font-black text-white drop-shadow">
                          {blob.digit !== undefined ? blob.digit : blob.text}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subtext / Tamil Meaning */}
                <span className="text-xs sm:text-sm font-extrabold text-slate-200 mt-2">
                  {language === 'ta' ? blob.textTa : blob.text}
                </span>

                {/* Tap along state tick */}
                {tapAlongMode && isTapped && (
                  <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shadow">
                    ✓
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mascot Cheer and Pedagogical Note */}
      <div className="bg-slate-800/80 rounded-3xl p-5 border border-indigo-500/30">
        <BarnabyBrush
          mood={isPlaying ? 'cheering' : 'teaching'}
          message={
            gapFillMode
              ? 'Now singing with gaps! When you see "? ?", sing that number out loud in rhythm!'
              : tapAlongMode
              ? 'Tap along mode active: Tap each blob in time to splash it with paint and earn drops!'
              : config.mascotTip.en
          }
          tipTa={
            gapFillMode
              ? 'இடைவெளி முறை: "? ?" வரும் போது நீங்களே தாளத்தோடு உரக்கப் பாடுங்கள்!'
              : tapAlongMode
              ? 'தொட்டு நிரப்பும் முறை: தாளத்தோடு குமிழ்களைத் தொட்டு வண்ணத்தை நிரப்புங்கள்!'
              : config.mascotTip.ta
          }
          language={language}
          accentColor={config.cycleDigitColors[config.cycle[0]]?.hex}
        />
      </div>
    </div>
  );
};
