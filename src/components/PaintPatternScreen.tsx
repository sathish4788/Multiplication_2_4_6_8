import React, { useState } from 'react';
import { ArrowLeft, Check, Sparkles, RefreshCw, Palette } from 'lucide-react';
import { TableNumber, Language } from '../types/game';
import { TABLES_CONFIG } from '../data/tablesData';
import { BarnabyBrush } from './BarnabyBrush';
import { soundManager } from '../utils/audio';

interface PaintPatternScreenProps {
  selectedTable: TableNumber;
  language: Language;
  onBack: () => void;
  onEarnDrops: (amount: number) => void;
  onAwardStar: (table: TableNumber, starsEarned: number) => void;
}

interface CanvasStepState {
  multiplier: number;
  paintedOnes: boolean;
  paintedTens: boolean;
  selectedOnes?: number;
  selectedTens?: number;
}

export const PaintPatternScreen: React.FC<PaintPatternScreenProps> = ({
  selectedTable,
  language,
  onBack,
  onEarnDrops,
  onAwardStar,
}) => {
  const config = TABLES_CONFIG[selectedTable];

  // Currently active canvas index (0 to 11)
  const [activeIdx, setActiveIdx] = useState<number>(0);
  const [activeBrushColor, setActiveBrushColor] = useState<number>(config.cycle[0]);
  const [mascotMood, setMascotMood] = useState<'happy' | 'thinking' | 'cheering' | 'splat'>('happy');
  const [mascotMessage, setMascotMessage] = useState<string>(
    `Pick the cycle color to paint the last digit of ${selectedTable} × 1!`
  );
  const [mascotMessageTa, setMascotMessageTa] = useState<string>(
    `${selectedTable} × 1 இன் கடைசி எண்ணை வண்ணச் சுழற்சியிலிருந்து தேர்ந்தெடுங்கள்!`
  );

  // States for each of the 12 canvases
  const [canvases, setCanvases] = useState<CanvasStepState[]>(
    Array.from({ length: 12 }, (_, i) => ({
      multiplier: i + 1,
      paintedOnes: false,
      paintedTens: false,
    }))
  );

  const [completedAll, setCompletedAll] = useState<boolean>(false);

  const currentMultiplier = activeIdx + 1;
  const targetAnswer = selectedTable * currentMultiplier;
  const targetTens = config.calculateTens(currentMultiplier);
  const targetOnes = config.calculateOnes(currentMultiplier);

  // Handle color bucket / palette tap to select paint color
  const handleSelectColor = (digit: number) => {
    setActiveBrushColor(digit);
    soundManager.playPop(1.1);

    // Apply color to active canvas ones digit
    if (!canvases[activeIdx].paintedOnes) {
      if (digit === targetOnes) {
        // Correct ones digit!
        soundManager.playPop(1.4);
        onEarnDrops(1);
        setMascotMood('cheering');
        setMascotMessage(`Spot on! The last digit is ${targetOnes}. Now choose the tens digit!`);
        setMascotMessageTa(`அற்புதம்! கடைசி எண் ${targetOnes}. இப்போது பத்துகள் எண்ணைத் தேர்ந்தெடுங்கள்!`);

        const updated = [...canvases];
        updated[activeIdx].paintedOnes = true;
        updated[activeIdx].selectedOnes = digit;
        setCanvases(updated);
      } else {
        // Wrong color chosen
        soundManager.playSplat();
        soundManager.playBoop();
        setMascotMood('splat');
        setMascotMessage(`Oops! Remember the cycle sequence: ${config.cycle.join(' → ')}. Try again!`);
        setMascotMessageTa(`அச்சச்சோ! சுழற்சி வரிசையை நினைவில் கொள்ளுங்கள்: ${config.cycle.join(' → ')}!`);
      }
    }
  };

  // Handle tens digit button tap
  const handleSelectTens = (tens: number) => {
    if (canvases[activeIdx].paintedTens) return;

    if (tens === targetTens) {
      // Correct tens!
      soundManager.playPop(1.6);
      onEarnDrops(1);

      const updated = [...canvases];
      updated[activeIdx].paintedTens = true;
      updated[activeIdx].selectedTens = tens;
      setCanvases(updated);

      if (activeIdx < 11) {
        setMascotMood('happy');
        setMascotMessage(`Great job! ${selectedTable} × ${currentMultiplier} = ${targetAnswer}. Moving to next canvas!`);
        setMascotMessageTa(`அருமை! ${selectedTable} × ${currentMultiplier} = ${targetAnswer}. அடுத்த கேன்வாஸுக்குச் செல்வோம்!`);
        setTimeout(() => {
          setActiveIdx(activeIdx + 1);
        }, 600);
      } else {
        // Finished all 12!
        soundManager.playFanfare();
        setCompletedAll(true);
        setMascotMood('cheering');
        setMascotMessage(`Incredible! You painted the entire 12-canvas pattern for Table ×${selectedTable}!`);
        setMascotMessageTa(`அபார சாதனை! ×${selectedTable} வாய்ப்பாட்டின் 12 கேன்வாஸ்களையும் வெற்றிகரமாக வரைந்துவிட்டீர்கள்!`);
        onAwardStar(selectedTable, 1);
        onEarnDrops(5);
      }
    } else {
      soundManager.playBoop();
      setMascotMood('thinking');
      setMascotMessage(`Not quite. Tens pattern: ${config.tensGroupsPattern}. Try another tens!`);
      setMascotMessageTa(`சரியில்லை. பத்துகளின் வரிசையைக் கவனியுங்கள்: ${config.tensGroupsPatternTa}`);
    }
  };

  const handleReset = () => {
    setActiveIdx(0);
    setCompletedAll(false);
    setCanvases(
      Array.from({ length: 12 }, (_, i) => ({
        multiplier: i + 1,
        paintedOnes: false,
        paintedTens: false,
      }))
    );
    setMascotMood('happy');
    setMascotMessage(`Let's paint Table ×${selectedTable} again!`);
    setMascotMessageTa(`மீண்டும் ×${selectedTable} வாய்ப்பாட்டை வரைவோம்!`);
  };

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
          <span className="text-xs font-black text-slate-400 uppercase tracking-wider">
            {language === 'ta' ? 'முன்னேற்றம்' : 'Progress'}:
          </span>
          <span className="px-3 py-1 rounded-full bg-pink-500/20 text-pink-300 font-mono font-bold text-sm border border-pink-500/30">
            {canvases.filter((c) => c.paintedOnes && c.paintedTens).length} / 12
          </span>
        </div>
      </div>

      {/* Mascot Guidance */}
      <div className="bg-slate-800/80 rounded-3xl p-5 border-2 border-indigo-500/30 shadow-xl">
        <BarnabyBrush
          mood={mascotMood}
          message={mascotMessage}
          tipTa={mascotMessageTa}
          language={language}
          accentColor={config.cycleDigitColors[activeBrushColor]?.hex || '#EC4899'}
        />
      </div>

      {/* The 12 Canvases Gallery Row */}
      <div className="bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-black text-amber-300 flex items-center gap-2">
            <Palette className="w-5 h-5 text-pink-400" />
            <span>{language === 'ta' ? '12 கேன்வாஸ்கள்' : 'The 12 Canvases (×1 to ×12)'}</span>
          </h3>
          <span className="text-xs text-slate-400">
            {language === 'ta' ? 'ஒவ்வொரு கட்டத்திலும் வண்ணத்தை நிரப்பவும்' : 'Tap canvas to inspect or paint'}
          </span>
        </div>

        {/* 12 Canvases Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
          {canvases.map((c, idx) => {
            const isCurrent = idx === activeIdx;
            const isDone = c.paintedOnes && c.paintedTens;
            const m = c.multiplier;
            const onesVal = config.calculateOnes(m);
            const tensVal = config.calculateTens(m);
            const onesColor = config.cycleDigitColors[onesVal];

            return (
              <div
                key={m}
                onClick={() => {
                  if (idx <= canvases.findIndex((x) => !x.paintedOnes || !x.paintedTens) || isDone) {
                    setActiveIdx(idx);
                    soundManager.playPop(1.0);
                  }
                }}
                className={`relative rounded-2xl p-3.5 flex flex-col items-center justify-center border-2 transition-all duration-300 cursor-pointer ${
                  isCurrent
                    ? 'bg-gradient-to-b from-indigo-800 to-purple-900 border-amber-300 shadow-xl scale-105 ring-2 ring-pink-500/40 z-10'
                    : isDone
                    ? 'bg-slate-800/90 border-emerald-500/50 hover:border-emerald-400 shadow'
                    : 'bg-slate-800/50 border-slate-700/60 opacity-65'
                }`}
              >
                {/* Multiplication equation header */}
                <div className="text-xs font-bold text-slate-300 mb-2">
                  <span className="text-amber-400 font-extrabold">{selectedTable}</span> × {m} =
                </div>

                {/* Answer Display: [Tens Box][Ones Box] */}
                <div className="flex items-center gap-1.5">
                  {/* Tens Box */}
                  <div
                    className={`w-8 h-10 sm:w-9 sm:h-11 rounded-xl flex items-center justify-center text-lg sm:text-xl font-mono font-black border-2 transition-all ${
                      c.paintedTens
                        ? 'bg-slate-700 text-white border-slate-500'
                        : isCurrent && c.paintedOnes
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400 animate-pulse'
                        : 'bg-slate-900 text-slate-600 border-slate-700 border-dashed'
                    }`}
                  >
                    {c.paintedTens ? tensVal : '?'}
                  </div>

                  {/* Ones Box (Painted in cycle color) */}
                  <div
                    style={{
                      backgroundColor: c.paintedOnes ? onesColor.hex : undefined,
                      borderColor: c.paintedOnes ? '#FFFFFF' : undefined,
                    }}
                    className={`w-8 h-10 sm:w-9 sm:h-11 rounded-xl flex items-center justify-center text-lg sm:text-xl font-black transition-all ${
                      c.paintedOnes
                        ? 'text-white border-2 shadow-md animate-paint-splat'
                        : isCurrent
                        ? 'bg-pink-500/20 text-pink-300 border-2 border-pink-400 animate-pulse'
                        : 'bg-slate-900 text-slate-600 border-2 border-slate-700 border-dashed'
                    }`}
                  >
                    {c.paintedOnes ? onesVal : '?'}
                  </div>
                </div>

                {/* Completion checkmark */}
                {isDone && (
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-bold text-emerald-400">
                    <Check className="w-3.5 h-3.5" />
                    <span>Done</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Interactive Painting Studio Console */}
      {!completedAll ? (
        <div className="bg-slate-800/90 rounded-3xl p-6 border-2 border-indigo-500/40 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-pink-400">
                {language === 'ta' ? 'தற்போது வரைவது' : 'Active Canvas'}:
              </span>
              <h3 className="text-2xl font-black text-white mt-0.5">
                {selectedTable} × {currentMultiplier} ={' '}
                <span className="font-mono text-amber-300">
                  {canvases[activeIdx].paintedTens ? targetTens : '[ ? ]'}
                </span>
                <span
                  style={{
                    color: canvases[activeIdx].paintedOnes
                      ? config.cycleDigitColors[targetOnes]?.hex
                      : '#EC4899',
                  }}
                  className="font-mono"
                >
                  {canvases[activeIdx].paintedOnes ? targetOnes : '[ ? ]'}
                </span>
              </h3>
            </div>

            {/* Cycle reminder strip */}
            <div className="flex items-center gap-2 bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-700">
              <span className="text-xs font-bold text-slate-400">
                {language === 'ta' ? 'சுழற்சி:' : 'Cycle:'}
              </span>
              <div className="flex items-center gap-1.5">
                {config.cycle.map((digit, i) => (
                  <span
                    key={i}
                    style={{ backgroundColor: config.cycleDigitColors[digit]?.hex }}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                  >
                    {digit}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Step 1: Color Palette for Ones Digit */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs">
                  1
                </span>
                <span>
                  {language === 'ta'
                    ? 'கடைசி எண்ணின் வண்ணத்தைத் தொடுங்கள்:'
                    : 'Paint the Last Digit with its Cycle Color:'}
                </span>
              </h4>
              {canvases[activeIdx].paintedOnes && (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-4 h-4" /> Painted!
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {config.cycle.map((digit) => {
                const colorObj = config.cycleDigitColors[digit];
                const isSelected = activeBrushColor === digit;

                return (
                  <button
                    key={digit}
                    onClick={() => handleSelectColor(digit)}
                    style={{ backgroundColor: colorObj.hex }}
                    className={`p-3.5 sm:p-4 rounded-2xl text-white font-black flex items-center justify-between shadow-lg transform transition-all active:scale-95 cursor-pointer border-2 ${
                      isSelected ? 'border-white scale-105 ring-4 ring-white/40' : 'border-white/20 hover:scale-102'
                    }`}
                  >
                    <div className="text-left">
                      <span className="text-2xl sm:text-3xl font-black block drop-shadow">
                        {digit}
                      </span>
                      <span className="text-[10px] sm:text-xs font-bold opacity-90 block">
                        {language === 'ta' ? colorObj.nameTa : colorObj.name}
                      </span>
                    </div>

                    {/* Paint splash icon */}
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white opacity-85">
                      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
                    </svg>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Tens Digit Selector (Unlocked after ones is painted) */}
          <div
            className={`space-y-3 pt-4 border-t border-slate-700/80 transition-opacity ${
              canvases[activeIdx].paintedOnes ? 'opacity-100' : 'opacity-40 pointer-events-none'
            }`}
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-extrabold text-slate-200 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs">
                  2
                </span>
                <span>
                  {language === 'ta'
                    ? 'பத்துகள் எண்ணைத் தேர்ந்தெடுங்கள்:'
                    : 'Pick the Tens Digit (from the tens group rhythm):'}
                </span>
              </h4>
              <span className="text-xs text-amber-300 font-mono">
                Pattern: {config.tensGroupsPattern}
              </span>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-4 flex-wrap">
              {[0, 1, 2, 3, 4, 5, 6, 7].map((num) => {
                const isCorrect = canvases[activeIdx].paintedTens && targetTens === num;

                return (
                  <button
                    key={num}
                    onClick={() => handleSelectTens(num)}
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl font-mono text-xl sm:text-2xl font-black flex items-center justify-center border-2 transition-all active:scale-95 cursor-pointer shadow-md ${
                      isCorrect
                        ? 'bg-emerald-600 text-white border-emerald-300 scale-105'
                        : 'bg-slate-700 hover:bg-slate-600 text-slate-100 border-slate-500'
                    }`}
                  >
                    {num}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Completion Victory Card */
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-pink-900 rounded-3xl p-8 border-4 border-amber-300 text-center space-y-4 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-400 flex items-center justify-center shadow-lg animate-bounce">
            <Sparkles className="w-10 h-10 text-slate-900 fill-slate-900" />
          </div>

          <h3 className="text-3xl font-black text-amber-300">
            {language === 'ta' ? 'அற்புதம்! 12 கேன்வாஸ்களும் தயார்!' : 'Masterpiece Completed!'}
          </h3>

          <p className="text-base text-slate-200 max-w-lg mx-auto">
            {language === 'ta'
              ? `×${selectedTable} வாய்ப்பாட்டின் வண்ண சுழற்சியை அழகாக வரைந்து முடித்தீர்கள். 1 நட்சத்திரமும் 5 வண்ணத் துளிகளும் பெற்றீர்கள்!`
              : `You painted all 12 multiples of Table ×${selectedTable}! You earned 1 Star and 5 Paint Drops to spend in My Home!`}
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            <button
              onClick={handleReset}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-3 rounded-2xl border border-slate-600 transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{language === 'ta' ? 'மீண்டும் வரை' : 'Paint Again'}</span>
            </button>

            <button
              onClick={onBack}
              className="bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-black px-7 py-3 rounded-2xl shadow-xl border-2 border-amber-200 active:scale-95 transition cursor-pointer"
            >
              {language === 'ta' ? 'முடித்தேன்' : 'Return to Studio'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
