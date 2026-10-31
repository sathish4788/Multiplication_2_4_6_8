import React, { useState, useEffect } from 'react';
import { ArrowLeft, Check, Sparkles, AlertCircle, Shuffle, ArrowRight } from 'lucide-react';
import { TableNumber, Language } from '../types/game';
import { TABLES_CONFIG } from '../data/tablesData';
import { BarnabyBrush } from './BarnabyBrush';
import { soundManager } from '../utils/audio';

interface BuildItScreenProps {
  selectedTable: TableNumber;
  language: Language;
  onBack: () => void;
  onEarnDrops: (amount: number) => void;
  onAwardStar: (table: TableNumber, starsEarned: number) => void;
}

export const BuildItScreen: React.FC<BuildItScreenProps> = ({
  selectedTable,
  language,
  onBack,
  onEarnDrops,
  onAwardStar,
}) => {
  const config = TABLES_CONFIG[selectedTable];

  const [round, setRound] = useState<1 | 2>(1); // Round 1: In order, Round 2: Mixed up
  const [questionSequence, setQuestionSequence] = useState<number[]>([]);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(0);

  // Selected building blocks for current question
  const [chosenTens, setChosenTens] = useState<number | null>(null);
  const [chosenOnes, setChosenOnes] = useState<number | null>(null);

  // Misses on current question
  const [missCount, setMissCount] = useState<number>(0);
  const [hintMessage, setHintMessage] = useState<string | null>(null);
  const [hintMessageTa, setHintMessageTa] = useState<string | null>(null);

  // Completed round state
  const [roundCompleted, setRoundCompleted] = useState<boolean>(false);

  // Initialize questions sequence for round
  useEffect(() => {
    if (round === 1) {
      // In order: 1 to 12
      setQuestionSequence(Array.from({ length: 12 }, (_, i) => i + 1));
    } else {
      // Shuffled: 1 to 12 mixed up
      const shuffled = Array.from({ length: 12 }, (_, i) => i + 1).sort(() => Math.random() - 0.5);
      setQuestionSequence(shuffled);
    }
    setCurrentStepIdx(0);
    setChosenTens(null);
    setChosenOnes(null);
    setMissCount(0);
    setHintMessage(null);
    setHintMessageTa(null);
    setRoundCompleted(false);
  }, [round, selectedTable]);

  const currentMultiplier = questionSequence[currentStepIdx] || 1;
  const targetAnswer = selectedTable * currentMultiplier;
  const targetTens = config.calculateTens(currentMultiplier);
  const targetOnes = config.calculateOnes(currentMultiplier);

  // Handle picking tens digit
  const handlePickTens = (tens: number) => {
    soundManager.playPop(1.1);
    setChosenTens(tens);
    checkAnswerIfReady(tens, chosenOnes);
  };

  // Handle picking cycle color chip (ones digit)
  const handlePickOnes = (ones: number) => {
    soundManager.playPop(1.3);
    setChosenOnes(ones);
    checkAnswerIfReady(chosenTens, ones);
  };

  const checkAnswerIfReady = (t: number | null, o: number | null) => {
    if (t === null || o === null) return;

    if (t === targetTens && o === targetOnes) {
      // CORRECT!
      soundManager.playPop(1.5);
      if (missCount === 0) {
        onEarnDrops(1); // First try bonus
      }

      setHintMessage(null);
      setHintMessageTa(null);

      // Advance to next question after small delay
      setTimeout(() => {
        if (currentStepIdx + 1 < questionSequence.length) {
          setCurrentStepIdx((idx) => idx + 1);
          setChosenTens(null);
          setChosenOnes(null);
          setMissCount(0);
        } else {
          // Finished all 12 questions of this round!
          soundManager.playFanfare();
          setRoundCompleted(true);
          onAwardStar(selectedTable, round === 1 ? 2 : 3);
          onEarnDrops(round === 1 ? 4 : 8);
        }
      }, 500);
    } else {
      // WRONG ANSWER
      soundManager.playBoop();
      const newMissCount = missCount + 1;
      setMissCount(newMissCount);

      if (t !== targetTens && o === targetOnes) {
        setHintMessage(`The last digit is right! Check the tens group rhythm: ${config.tensGroupsPattern}`);
        setHintMessageTa(`கடைசி எண் சரி! பத்துகளின் தாளத்தைக் கவனியுங்கள்: ${config.tensGroupsPatternTa}`);
      } else if (t === targetTens && o !== targetOnes) {
        setHintMessage(`Tens digit is right! The last digit must follow cycle: ${config.cycle.join(' → ')}`);
        setHintMessageTa(`பத்துகள் சரி! கடைசி எண் சுழற்சியைப் பாருங்கள்: ${config.cycle.join(' → ')}`);
      } else {
        setHintMessage(`Hint: ${selectedTable} × ${currentMultiplier} ends in cycle digit ${targetOnes}!`);
        setHintMessageTa(`குறிப்பு: ${selectedTable} × ${currentMultiplier} இன் கடைசி எண் ${targetOnes}!`);
      }

      // Reset wrong choices after short display
      setTimeout(() => {
        if (t !== targetTens) setChosenTens(null);
        if (o !== targetOnes) setChosenOnes(null);
      }, 600);
    }
  };

  const targetColorObj = config.cycleDigitColors[targetOnes];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-2xl font-bold text-sm border border-slate-700 transition active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'ta' ? 'முதன்மைப் பக்கம்' : 'Back to Studio'}</span>
        </button>

        {/* Round Switcher */}
        <div className="flex items-center gap-2 bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={() => setRound(1)}
            className={`px-3 py-1 rounded-xl text-xs font-black transition cursor-pointer ${
              round === 1 ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'ta' ? 'சுற்று 1 (வரிசை)' : 'Round 1 (In Order)'}
          </button>
          <button
            onClick={() => setRound(2)}
            className={`px-3 py-1 rounded-xl text-xs font-black transition flex items-center gap-1 cursor-pointer ${
              round === 2 ? 'bg-pink-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Shuffle className="w-3 h-3" />
            <span>{language === 'ta' ? 'சுற்று 2 (கலவை)' : 'Round 2 (Mixed)'}</span>
          </button>
        </div>
      </div>

      {/* Barnaby Mascot */}
      <div className="bg-slate-800/80 rounded-3xl p-5 border-2 border-indigo-500/30 shadow-xl">
        <BarnabyBrush
          mood={missCount >= 2 ? 'thinking' : missCount > 0 ? 'splat' : 'happy'}
          message={
            hintMessage ||
            (round === 1
              ? `Let's build ${selectedTable} × ${currentMultiplier}! Choose the tens box, then the cycle color chip.`
              : `Mixed challenge: ${selectedTable} × ${currentMultiplier}! You can spot the pattern fast!`)
          }
          tipTa={
            hintMessageTa ||
            (round === 1
              ? `${selectedTable} × ${currentMultiplier} ஐ உருவாக்குவோம்! பத்துகள் மற்றும் வண்ணச் சுழற்சியைத் தேர்வு செய்யுங்கள்.`
              : `கலவை சவால்: ${selectedTable} × ${currentMultiplier}! சுழற்சியைப் பார்த்து எளிதாக விடை கூறுங்கள்!`)
          }
          language={language}
          accentColor={targetColorObj?.hex || '#EC4899'}
        />
      </div>

      {!roundCompleted ? (
        /* The Building Board */
        <div className="bg-slate-900/95 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8">
          {/* Progress Bar */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-300">
              <span>
                {language === 'ta' ? 'வினா' : 'Question'} {currentStepIdx + 1} / {questionSequence.length}
              </span>
              <span className="text-pink-300 font-mono">
                {round === 1 ? 'Round 1: Step by Step' : 'Round 2: Mixed Magic'}
              </span>
            </div>
            <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-pink-500 via-amber-400 to-emerald-400 transition-all duration-300"
                style={{
                  width: `${((currentStepIdx) / questionSequence.length) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Central Problem Display */}
          <div className="text-center py-4 bg-gradient-to-b from-slate-800 to-slate-800/40 rounded-3xl border border-slate-700/80 shadow-inner">
            <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400 block mb-1">
              {language === 'ta' ? 'விடையை அசெம்பிள் செய்' : 'Build the Answer'}
            </span>

            <div className="flex items-center justify-center gap-3 sm:gap-4 flex-wrap">
              <span className="text-4xl sm:text-6xl font-black text-amber-300 drop-shadow">
                {selectedTable} × {currentMultiplier} =
              </span>

              {/* Tens Slot */}
              <div
                className={`w-16 h-20 sm:w-20 sm:h-24 rounded-2xl flex flex-col items-center justify-center border-4 transition-all ${
                  chosenTens !== null
                    ? chosenTens === targetTens
                      ? 'bg-slate-700 text-white border-emerald-400 shadow-lg scale-105'
                      : 'bg-rose-950/80 text-rose-300 border-rose-500'
                    : 'bg-slate-900 text-slate-500 border-slate-600 border-dashed animate-pulse'
                }`}
              >
                <span className="text-xs font-bold text-slate-400 -mt-1">TENS</span>
                <span className="text-3xl sm:text-4xl font-mono font-black">
                  {chosenTens !== null ? chosenTens : '?'}
                </span>
              </div>

              {/* Ones Slot (Painted with cycle chip) */}
              <div
                style={{
                  backgroundColor:
                    chosenOnes !== null
                      ? config.cycleDigitColors[chosenOnes]?.hex
                      : undefined,
                  borderColor:
                    chosenOnes !== null
                      ? '#FFFFFF'
                      : missCount >= 2
                      ? targetColorObj.hex
                      : undefined,
                }}
                className={`w-16 h-20 sm:w-20 sm:h-24 rounded-2xl flex flex-col items-center justify-center border-4 transition-all ${
                  chosenOnes !== null
                    ? 'text-white shadow-xl scale-105 animate-paint-splat'
                    : missCount >= 2
                    ? 'bg-slate-900 text-pink-300 animate-pulse-glow'
                    : 'bg-slate-900 text-slate-500 border-slate-600 border-dashed animate-pulse'
                }`}
              >
                <span className="text-xs font-bold opacity-80 -mt-1">CYCLE</span>
                <span className="text-3xl sm:text-4xl font-black drop-shadow">
                  {chosenOnes !== null ? chosenOnes : '?'}
                </span>
              </div>
            </div>
          </div>

          {/* Builder Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Left: Tens Digit Picker */}
            <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-200">
                  {language === 'ta' ? '1. பத்துகள் எண்:' : '1. Choose Tens Digit:'}
                </h4>
                {missCount >= 2 && (
                  <span className="text-[11px] font-bold text-amber-300">
                    Hint: {targetTens}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-4 gap-2.5">
                {[0, 1, 2, 3, 4, 5, 6, 7].map((tensNum) => {
                  const isSelected = chosenTens === tensNum;
                  const isGlowingHint = missCount >= 2 && tensNum === targetTens;

                  return (
                    <button
                      key={tensNum}
                      onClick={() => handlePickTens(tensNum)}
                      className={`h-13 rounded-2xl font-mono text-2xl font-black border-2 transition-all active:scale-95 cursor-pointer shadow ${
                        isSelected
                          ? 'bg-indigo-600 text-white border-white scale-105'
                          : isGlowingHint
                          ? 'bg-amber-500 text-slate-900 border-amber-200 ring-4 ring-amber-400 animate-pulse-glow'
                          : 'bg-slate-700 hover:bg-slate-600 text-slate-200 border-slate-600'
                      }`}
                    >
                      {tensNum}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right: Cycle Color Strip (Ones Digit) */}
            <div className="bg-slate-800/80 p-5 rounded-3xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-extrabold text-slate-200">
                  {language === 'ta' ? '2. வண்ணச் சுழற்சி எண்:' : '2. Choose Cycle Color Chip:'}
                </h4>
                {missCount >= 2 && (
                  <span className="text-[11px] font-bold text-pink-300 animate-pulse">
                    Glow Hint Active!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {config.cycle.map((digit) => {
                  const colorObj = config.cycleDigitColors[digit];
                  const isSelected = chosenOnes === digit;
                  const isGlowingChip = missCount >= 2 && digit === targetOnes;

                  return (
                    <button
                      key={digit}
                      onClick={() => handlePickOnes(digit)}
                      style={{ backgroundColor: colorObj.hex }}
                      className={`h-16 rounded-2xl text-white font-black flex flex-col items-center justify-center border-2 transition-all active:scale-95 cursor-pointer shadow-lg ${
                        isSelected
                          ? 'border-white scale-105 ring-4 ring-white/50'
                          : isGlowingChip
                          ? 'border-yellow-300 scale-110 ring-4 ring-yellow-400 animate-pulse-glow'
                          : 'border-white/20 hover:scale-102'
                      }`}
                    >
                      <span className="text-2xl font-black drop-shadow">{digit}</span>
                      <span className="text-[9px] font-bold opacity-80 truncate px-1">
                        {language === 'ta' ? colorObj.nameTa : colorObj.name}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Round Victory Card */
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-pink-900 rounded-3xl p-8 border-4 border-amber-300 text-center space-y-4 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-400 flex items-center justify-center shadow-lg animate-bounce">
            <Sparkles className="w-10 h-10 text-slate-900 fill-slate-900" />
          </div>

          <h3 className="text-3xl font-black text-amber-300">
            {language === 'ta'
              ? `சுற்று ${round} வெற்றி!`
              : `Round ${round} Complete!`}
          </h3>

          <p className="text-base text-slate-200 max-w-lg mx-auto">
            {language === 'ta'
              ? `×${selectedTable} வாய்ப்பாட்டின் அனைத்து வினாக்களையும் வெற்றிகரமாக உருவாக்கினீர்கள்! உங்களுக்கு நட்சத்திரமும் வண்ணத் துளிகளும் கிடைத்தன!`
              : `You assembled all 12 answers using the tens pattern and cycle chips! Star & Paint Drops added to your collection!`}
          </p>

          <div className="flex items-center justify-center gap-4 pt-2">
            {round === 1 ? (
              <button
                onClick={() => setRound(2)}
                className="flex items-center gap-2 bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-black px-6 py-3 rounded-2xl shadow-xl border-2 border-amber-200 active:scale-95 transition cursor-pointer"
              >
                <span>{language === 'ta' ? 'அடுத்த சுற்று: கலவை சவால்' : 'Next: Round 2 (Mixed Challenge)'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={onBack}
                className="bg-gradient-to-r from-pink-500 to-amber-500 hover:from-pink-600 hover:to-amber-600 text-white font-black px-7 py-3 rounded-2xl shadow-xl border-2 border-amber-200 active:scale-95 transition cursor-pointer"
              >
                {language === 'ta' ? 'ஸ்டூடியோவுக்குத் திரும்பு' : 'Return to Studio'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
