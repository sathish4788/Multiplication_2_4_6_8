import React, { useState } from 'react';
import { ArrowLeft, Check, Sparkles, RefreshCw, Eye } from 'lucide-react';
import { TableNumber, Language } from '../types/game';
import { TABLES_CONFIG } from '../data/tablesData';
import { BarnabyBrush } from './BarnabyBrush';
import { soundManager } from '../utils/audio';

interface MissingNumberScreenProps {
  selectedTable: TableNumber;
  language: Language;
  onBack: () => void;
  onEarnDrops: (amount: number) => void;
  onAwardStar: (table: TableNumber, starsEarned: number) => void;
}

interface MissingTile {
  multiplier: number;
  actualTens: number;
  actualOnes: number;
  missingType: 'tens' | 'ones' | 'both';
  userTens: number | null;
  userOnes: number | null;
  isCompleted: boolean;
}

export const MissingNumberScreen: React.FC<MissingNumberScreenProps> = ({
  selectedTable,
  language,
  onBack,
  onEarnDrops,
  onAwardStar,
}) => {
  const config = TABLES_CONFIG[selectedTable];

  // Selected tile index and selected slot ('tens' | 'ones')
  const [selectedTileIdx, setSelectedTileIdx] = useState<number>(1);
  const [activeSlot, setActiveSlot] = useState<'tens' | 'ones'>('ones');
  const [completedTapestry, setCompletedTapestry] = useState<boolean>(false);

  // Generate tiles: multiples 1..12 where ~6 have missing components
  const initTiles = (): MissingTile[] => {
    return Array.from({ length: 12 }, (_, i) => {
      const m = i + 1;
      const actualTens = config.calculateTens(m);
      const actualOnes = config.calculateOnes(m);

      // Multipliers 2, 4, 6, 7, 9, 11 are missing parts
      let missingType: 'tens' | 'ones' | 'both' = 'ones';
      let userTens: number | null = actualTens;
      let userOnes: number | null = actualOnes;
      let isCompleted = true;

      if ([2, 6, 9].includes(m)) {
        missingType = 'ones';
        userOnes = null;
        isCompleted = false;
      } else if ([4, 7].includes(m)) {
        missingType = 'tens';
        userTens = null;
        isCompleted = false;
      } else if ([11].includes(m)) {
        missingType = 'both';
        userTens = null;
        userOnes = null;
        isCompleted = false;
      }

      return {
        multiplier: m,
        actualTens,
        actualOnes,
        missingType,
        userTens,
        userOnes,
        isCompleted,
      };
    });
  };

  const [tiles, setTiles] = useState<MissingTile[]>(initTiles);

  const handleTileClick = (idx: number, slot?: 'tens' | 'ones') => {
    soundManager.playPop(1.0);
    setSelectedTileIdx(idx);
    if (slot) {
      setActiveSlot(slot);
    } else {
      const tile = tiles[idx];
      if (tile.userTens === null) setActiveSlot('tens');
      else if (tile.userOnes === null) setActiveSlot('ones');
    }
  };

  const handleInputDigit = (digit: number) => {
    const tile = tiles[selectedTileIdx];
    if (tile.isCompleted) return;

    if (activeSlot === 'tens') {
      if (digit === tile.actualTens) {
        soundManager.playPop(1.3);
        onEarnDrops(1);
        const updated = [...tiles];
        updated[selectedTileIdx].userTens = digit;
        if (updated[selectedTileIdx].userOnes !== null) {
          updated[selectedTileIdx].isCompleted = true;
        } else {
          setActiveSlot('ones');
        }
        setTiles(updated);
        checkAllDone(updated);
      } else {
        soundManager.playBoop();
      }
    } else {
      // activeSlot === 'ones'
      if (digit === tile.actualOnes) {
        soundManager.playPop(1.4);
        onEarnDrops(1);
        const updated = [...tiles];
        updated[selectedTileIdx].userOnes = digit;
        if (updated[selectedTileIdx].userTens !== null) {
          updated[selectedTileIdx].isCompleted = true;
        } else {
          setActiveSlot('tens');
        }
        setTiles(updated);
        checkAllDone(updated);
      } else {
        soundManager.playBoop();
      }
    }
  };

  const checkAllDone = (list: MissingTile[]) => {
    const allDone = list.every((t) => t.isCompleted);
    if (allDone) {
      soundManager.playFanfare();
      setCompletedTapestry(true);
      onAwardStar(selectedTable, 3);
      onEarnDrops(8);
    }
  };

  const handleReset = () => {
    setTiles(initTiles());
    setSelectedTileIdx(1);
    setActiveSlot('ones');
    setCompletedTapestry(false);
  };

  const currentTile = tiles[selectedTileIdx];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-2xl font-bold text-sm border border-slate-700 transition active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'ta' ? 'முதன்மைப் பக்கம்' : 'Back to Studio'}</span>
        </button>

        <div className="flex items-center gap-2">
          <Eye className="w-4 h-4 text-purple-400" />
          <span className="text-xs font-bold text-slate-300">
            {language === 'ta' ? 'மறைந்த ஓவியம்' : 'Half-Hidden Tapestry'}
          </span>
        </div>
      </div>

      {/* Mascot Instruction */}
      <div className="bg-slate-800/80 rounded-3xl p-5 border-2 border-indigo-500/30 shadow-xl">
        <BarnabyBrush
          mood={completedTapestry ? 'cheering' : 'teaching'}
          message={
            completedTapestry
              ? `Hooray! The complete ×${selectedTable} pattern tapestry is revealed!`
              : `Look at the neighbours to deduce the missing digits! The cycle is ${config.cycle.join('-')}.`
          }
          tipTa={
            completedTapestry
              ? `வாழ்த்துகள்! ×${selectedTable} வாய்ப்பாட்டின் முழு ஓவியமும் வெளிப்பட்டுவிட்டது!`
              : `அருகிலுள்ள எண்களைப் பார்த்து விடுபட்ட எண்ணைக் கண்டுபிடியுங்கள்! சுழற்சி: ${config.cycle.join('-')}.`
          }
          language={language}
          accentColor="#A855F7"
        />
      </div>

      {/* Tapestry Grid of 12 Multiples */}
      <div className="bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {tiles.map((t, idx) => {
            const isSelected = selectedTileIdx === idx;
            const onesColor = config.cycleDigitColors[t.actualOnes]?.hex || '#EC4899';

            return (
              <div
                key={t.multiplier}
                onClick={() => handleTileClick(idx)}
                className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col items-center justify-center ${
                  isSelected
                    ? 'bg-indigo-900/90 border-amber-300 shadow-xl scale-105 ring-2 ring-pink-500/40'
                    : t.isCompleted
                    ? 'bg-slate-800/90 border-slate-700 hover:border-slate-500'
                    : 'bg-purple-950/40 border-purple-500/50 hover:border-purple-400'
                }`}
              >
                <div className="text-xs font-bold text-slate-400 mb-2">
                  <span className="text-amber-400 font-extrabold">{selectedTable}</span> × {t.multiplier}
                </div>

                {/* Number Display with clickable slots */}
                <div className="flex items-center gap-1.5">
                  {/* Tens Slot */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTileClick(idx, 'tens');
                    }}
                    className={`w-9 h-11 rounded-xl flex items-center justify-center font-mono font-black text-xl border-2 transition ${
                      t.userTens !== null
                        ? 'bg-slate-700 text-white border-slate-500'
                        : isSelected && activeSlot === 'tens'
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400 animate-pulse'
                        : 'bg-slate-900 text-amber-400/80 border-dashed border-amber-500/60'
                    }`}
                  >
                    {t.userTens !== null ? t.userTens : '?'}
                  </div>

                  {/* Ones Slot */}
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTileClick(idx, 'ones');
                    }}
                    style={{
                      backgroundColor: t.userOnes !== null ? onesColor : undefined,
                      borderColor: t.userOnes !== null ? '#FFFFFF' : undefined,
                    }}
                    className={`w-9 h-11 rounded-xl flex items-center justify-center font-black text-xl border-2 transition ${
                      t.userOnes !== null
                        ? 'text-white shadow-md'
                        : isSelected && activeSlot === 'ones'
                        ? 'bg-pink-500/20 text-pink-300 border-pink-400 animate-pulse'
                        : 'bg-slate-900 text-pink-400/80 border-dashed border-pink-500/60'
                    }`}
                  >
                    {t.userOnes !== null ? t.userOnes : '?'}
                  </div>
                </div>

                {t.isCompleted && (
                  <span className="text-[10px] font-bold text-emerald-400 mt-2 flex items-center gap-0.5">
                    <Check className="w-3 h-3" /> Solved
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Input Palette for Active Missing Slot */}
      {!completedTapestry ? (
        <div className="bg-slate-800/90 rounded-3xl p-6 border-2 border-indigo-500/40 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-slate-700 pb-3">
            <div>
              <span className="text-xs font-black uppercase text-pink-400">
                {language === 'ta' ? 'தேர்ந்தெடுத்த கட்டம்:' : 'Selected Multiple:'}
              </span>
              <h3 className="text-xl font-black text-white">
                {selectedTable} × {currentTile.multiplier} ={' '}
                <span className="text-amber-300 font-mono">
                  {currentTile.userTens !== null ? currentTile.userTens : '[ ? ]'}
                </span>
                <span className="text-pink-400 font-mono">
                  {currentTile.userOnes !== null ? currentTile.userOnes : '[ ? ]'}
                </span>
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSlot('tens')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border ${
                  activeSlot === 'tens'
                    ? 'bg-amber-500 text-slate-900 border-amber-300 shadow'
                    : 'bg-slate-700 text-slate-300 border-slate-600'
                }`}
              >
                Tens Box
              </button>
              <button
                onClick={() => setActiveSlot('ones')}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer border ${
                  activeSlot === 'ones'
                    ? 'bg-pink-500 text-white border-pink-300 shadow'
                    : 'bg-slate-700 text-slate-300 border-slate-600'
                }`}
              >
                Ones Box (Cycle)
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-300 font-medium">
            {activeSlot === 'tens'
              ? language === 'ta'
                ? 'பத்துகள் எண்ணைத் தொடுங்கள்:'
                : 'Select the missing Tens digit from below:'
              : language === 'ta'
              ? 'வண்ண சுழற்சியிலிருந்து கடைசி எண்ணைத் தொடுங்கள்:'
              : 'Select the missing Ones digit from the cycle:'}
          </p>

          {/* Keypad */}
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap">
            {activeSlot === 'tens'
              ? [0, 1, 2, 3, 4, 5, 6, 7].map((num) => (
                  <button
                    key={num}
                    onClick={() => handleInputDigit(num)}
                    className="w-13 h-13 rounded-2xl bg-slate-700 hover:bg-slate-600 text-white font-mono text-2xl font-black border-2 border-slate-500 shadow-md active:scale-95 transition cursor-pointer"
                  >
                    {num}
                  </button>
                ))
              : config.cycle.map((digit) => {
                  const col = config.cycleDigitColors[digit]?.hex || '#EC4899';
                  return (
                    <button
                      key={digit}
                      onClick={() => handleInputDigit(digit)}
                      style={{ backgroundColor: col }}
                      className="w-14 h-14 rounded-2xl text-white font-black text-2xl border-2 border-white/40 shadow-lg active:scale-95 transition cursor-pointer flex items-center justify-center hover:scale-105"
                    >
                      {digit}
                    </button>
                  );
                })}
          </div>
        </div>
      ) : (
        /* Victory Celebration */
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-pink-900 rounded-3xl p-8 border-4 border-amber-300 text-center space-y-4 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-400 flex items-center justify-center shadow-lg animate-bounce">
            <Sparkles className="w-10 h-10 text-slate-900 fill-slate-900" />
          </div>

          <h3 className="text-3xl font-black text-amber-300">
            {language === 'ta' ? 'அனைத்து எண்களும் கண்டுபிடிக்கப்பட்டன!' : 'Complete Tapestry Unlocked!'}
          </h3>

          <p className="text-base text-slate-200 max-w-md mx-auto">
            {language === 'ta'
              ? 'சுழற்சி மற்றும் தாள விதிகளின் மூலம் மறைந்த எண்கள் அனைத்தையும் அழகாக நிரப்பிவிட்டீர்கள்! 8 வண்ணத் துளிகள் கிடைத்தன!'
              : 'You used the rhythmic cycle logic to uncover every single missing digit! Star & 8 Paint Drops awarded!'}
          </p>

          <div className="flex items-center justify-center gap-4 pt-3">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-3 rounded-2xl border border-slate-600 transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{language === 'ta' ? 'மீண்டும் செய்' : 'Play Again'}</span>
            </button>

            <button
              onClick={onBack}
              className="bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-black px-7 py-3 rounded-2xl shadow-xl border-2 border-amber-200 active:scale-95 transition cursor-pointer"
            >
              {language === 'ta' ? 'ஸ்டூடியோவுக்குத் திரும்பு' : 'Return to Studio'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
