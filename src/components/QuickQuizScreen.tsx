import React, { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle2, XCircle, Sparkles, RefreshCw } from 'lucide-react';
import { TableNumber, Language } from '../types/game';
import { TABLES_CONFIG } from '../data/tablesData';
import { BarnabyBrush } from './BarnabyBrush';
import { soundManager } from '../utils/audio';

interface QuickQuizScreenProps {
  selectedTable: TableNumber;
  language: Language;
  onBack: () => void;
  onEarnDrops: (amount: number) => void;
  onAwardStar: (table: TableNumber, starsEarned: number) => void;
}

interface QuizQuestion {
  multiplier: number;
  correctAnswer: number;
  options: number[];
  selectedChoice: number | null;
  isCorrect?: boolean;
}

export const QuickQuizScreen: React.FC<QuickQuizScreenProps> = ({
  selectedTable,
  language,
  onBack,
  onEarnDrops,
  onAwardStar,
}) => {
  const config = TABLES_CONFIG[selectedTable];

  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [showResult, setShowResult] = useState<boolean>(false);
  const [answeredState, setAnsweredState] = useState<'idle' | 'correct' | 'wrong'>('idle');

  // Generate 10 smart questions with real child error distractors
  const generateQuestions = () => {
    // Pick 10 unique multipliers from 1..12
    const multipliers = Array.from({ length: 12 }, (_, i) => i + 1)
      .sort(() => Math.random() - 0.5)
      .slice(0, 10);

    const generated: QuizQuestion[] = multipliers.map((m) => {
      const correct = selectedTable * m;
      const tens = config.calculateTens(m);
      const ones = config.calculateOnes(m);

      // Distractor 1: Wrong tens (off by 10)
      const dist1 = tens > 0 ? (tens - 1) * 10 + ones : (tens + 1) * 10 + ones;

      // Distractor 2: Next or previous digit in cycle
      const cycleIdx = config.cycle.indexOf(ones);
      const nextCycleDigit = config.cycle[(cycleIdx + 1) % config.cycle.length];
      const dist2 = tens * 10 + nextCycleDigit;

      // Distractor 3: Neighbouring multiple (m + 1 or m - 1)
      const altM = m > 1 ? m - 1 : m + 1;
      const dist3 = selectedTable * altM;

      // Ensure distinct options
      const choicesSet = new Set<number>([correct]);
      if (dist1 !== correct) choicesSet.add(dist1);
      if (dist2 !== correct) choicesSet.add(dist2);
      if (dist3 !== correct) choicesSet.add(dist3);

      // Fallbacks if duplicates occurred
      let fallback = correct + 2;
      while (choicesSet.size < 4) {
        if (!choicesSet.has(fallback) && fallback > 0) {
          choicesSet.add(fallback);
        }
        fallback += 2;
      }

      const options = Array.from(choicesSet).sort(() => Math.random() - 0.5);

      return {
        multiplier: m,
        correctAnswer: correct,
        options,
        selectedChoice: null,
      };
    });

    setQuestions(generated);
    setCurrentIdx(0);
    setScore(0);
    setShowResult(false);
    setAnsweredState('idle');
  };

  useEffect(() => {
    generateQuestions();
  }, [selectedTable]);

  const handleSelectAnswer = (choice: number) => {
    if (answeredState !== 'idle') return;

    const currentQ = questions[currentIdx];
    const isRight = choice === currentQ.correctAnswer;

    if (isRight) {
      soundManager.playPop(1.5);
      setScore((s) => s + 1);
      onEarnDrops(1);
      setAnsweredState('correct');
    } else {
      soundManager.playBoop();
      setAnsweredState('wrong');
    }

    const updated = [...questions];
    updated[currentIdx].selectedChoice = choice;
    updated[currentIdx].isCorrect = isRight;
    setQuestions(updated);

    // Advance to next after 800ms
    setTimeout(() => {
      if (currentIdx + 1 < questions.length) {
        setCurrentIdx((idx) => idx + 1);
        setAnsweredState('idle');
      } else {
        // Finished all 10
        setShowResult(true);
        if (score + (isRight ? 1 : 0) >= 7) {
          soundManager.playFanfare();
          onAwardStar(selectedTable, 3);
          onEarnDrops(6);
        } else {
          soundManager.playPop(1.1);
        }
      }
    }, 800);
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6 animate-fade-in">
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
          <span className="text-xs font-bold text-slate-400">
            {language === 'ta' ? 'மதிப்பெண்:' : 'Score:'}
          </span>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-mono font-bold text-sm border border-amber-500/30">
            {score} / 10
          </span>
        </div>
      </div>

      {/* Barnaby Mascot */}
      <div className="bg-slate-800/80 rounded-3xl p-5 border-2 border-indigo-500/30 shadow-xl">
        <BarnabyBrush
          mood={answeredState === 'correct' ? 'cheering' : answeredState === 'wrong' ? 'thinking' : 'happy'}
          message={
            answeredState === 'correct'
              ? 'Brilliant! You spotted the correct pattern answer!'
              : answeredState === 'wrong'
              ? 'Good try! Look at the last digit cycle and tens group to be sure.'
              : `Quick Quiz for Table ×${selectedTable}: 10 questions. Trust your pattern eyes!`
          }
          tipTa={
            answeredState === 'correct'
              ? 'அற்புதம்! சரியான விடையைக் கண்டுபிடித்துவிட்டீர்கள்!'
              : answeredState === 'wrong'
              ? 'நன்று! கடைசி எண் சுழற்சியையும் பத்துகளையும் கவனியுங்கள்.'
              : `×${selectedTable} மின்னல் வினாடி வினா: 10 வினாக்கள். சுழற்சியை நம்புங்கள்!`
          }
          language={language}
          accentColor="#F59E0B"
        />
      </div>

      {!showResult && currentQ ? (
        /* The Quiz Card */
        <div className="bg-slate-900/95 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Progress bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>
                {language === 'ta' ? 'வினா' : 'Question'} {currentIdx + 1} of 10
              </span>
              <span>{Math.round(((currentIdx) / 10) * 100)}%</span>
            </div>
            <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                style={{ width: `${((currentIdx) / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Equation */}
          <div className="text-center py-6 bg-slate-800/80 rounded-3xl border border-slate-700 shadow-inner">
            <span className="text-xs uppercase font-extrabold tracking-widest text-slate-400 block mb-1">
              {language === 'ta' ? 'சரியான விடையைத் தொடுங்கள்' : 'Tap the Correct Answer'}
            </span>
            <div className="text-5xl sm:text-7xl font-black text-amber-300 tracking-tight drop-shadow">
              {selectedTable} × {currentQ.multiplier} = <span className="text-pink-400">?</span>
            </div>
          </div>

          {/* 4 Answer Options */}
          <div className="grid grid-cols-2 gap-3.5 sm:gap-4 pt-2">
            {currentQ.options.map((opt) => {
              const isSelected = currentQ.selectedChoice === opt;
              const isCorrectAnswer = opt === currentQ.correctAnswer;
              const onesDigit = opt % 10;
              const onesColor = config.cycleDigitColors[onesDigit]?.hex || '#EC4899';

              let btnStyle = 'bg-slate-800 hover:bg-slate-750 text-white border-slate-700';
              if (answeredState !== 'idle') {
                if (isCorrectAnswer) {
                  btnStyle = 'bg-emerald-600 text-white border-emerald-300 shadow-emerald-500/40';
                } else if (isSelected && !isCorrectAnswer) {
                  btnStyle = 'bg-rose-600 text-white border-rose-300';
                }
              }

              return (
                <button
                  key={opt}
                  onClick={() => handleSelectAnswer(opt)}
                  disabled={answeredState !== 'idle'}
                  className={`relative p-5 sm:p-6 rounded-3xl font-mono text-3xl sm:text-4xl font-black border-2 transition-all active:scale-95 shadow-lg flex items-center justify-between cursor-pointer ${btnStyle}`}
                >
                  <span className="drop-shadow">{opt}</span>

                  {/* Little color indicator for the cycle digit */}
                  <span
                    style={{ backgroundColor: onesColor }}
                    className="w-5 h-5 rounded-full border border-white/60 shadow-sm"
                    title={`Last digit: ${onesDigit}`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      ) : (
        /* Quiz Summary Result Card */
        <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-pink-900 rounded-3xl p-8 border-4 border-amber-300 text-center space-y-4 shadow-2xl">
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-400 flex items-center justify-center shadow-lg animate-bounce">
            <Sparkles className="w-10 h-10 text-slate-900 fill-slate-900" />
          </div>

          <h3 className="text-3xl font-black text-amber-300">
            {language === 'ta' ? 'வினாடி வினா முடிந்தது!' : 'Quiz Complete!'}
          </h3>

          <div className="text-4xl sm:text-5xl font-mono font-black text-white">
            {score} / 10
          </div>

          <p className="text-base text-slate-200 max-w-md mx-auto">
            {score >= 8
              ? language === 'ta'
                ? 'அற்புதமான செயல்திறன்! நீங்கள் வடிவங்களை முழுமையாகப் புரிந்து கொண்டுவிட்டீர்கள்! 3-வது நட்சத்திரம் கிடைத்தது!'
                : 'Superstar! You demonstrated pattern mastery! 3rd Star and Paint Drops unlocked!'
              : language === 'ta'
              ? 'நல்ல முயற்சி! பாட்டையும் வண்ண கேன்வாஸையும் மீண்டும் பயிற்சி செய்யுங்கள், நிச்சயம் 10/10 பெறலாம்!'
              : 'Great effort! Revisit the Chant and Paint Pattern to lock in the cycle rhythm!'}
          </p>

          <div className="flex items-center justify-center gap-4 pt-3">
            <button
              onClick={generateQuestions}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold px-5 py-3 rounded-2xl border border-slate-600 transition active:scale-95 cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>{language === 'ta' ? 'மீண்டும் செய்' : 'Try Again'}</span>
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
