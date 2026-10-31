import React from 'react';
import { Star, Sparkles, Music, Palette, Hammer, HelpCircle, Eye, Waves } from 'lucide-react';
import { TableNumber, GameMode, Language } from '../types/game';
import { TABLES_CONFIG } from '../data/tablesData';
import { BarnabyBrush } from './BarnabyBrush';
import { soundManager } from '../utils/audio';

interface HomeScreenProps {
  selectedTable: TableNumber;
  stars: Record<TableNumber, number>;
  paintDrops: number;
  language: Language;
  onSelectTable: (table: TableNumber) => void;
  onLaunchMode: (mode: GameMode) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  selectedTable,
  stars,
  paintDrops,
  language,
  onSelectTable,
  onLaunchMode,
}) => {
  const currentConfig = TABLES_CONFIG[selectedTable];

  const handleTableClick = (t: TableNumber) => {
    soundManager.playPop(1.1);
    onSelectTable(t);
  };

  const handleModeLaunch = (mode: GameMode) => {
    soundManager.playPop(1.3);
    onLaunchMode(mode);
  };

  const modes = [
    {
      id: 'fish-catch' as GameMode,
      icon: Waves,
      title: language === 'ta' ? 'மீன் வலை வேட்டை' : 'Fish Net Catch',
      subtitle: language === 'ta' ? `வலையை வீசி ×${selectedTable} மடங்குகளைப் பிடி!` : `Scoop correct ×${selectedTable} multiples in your net!`,
      badge: language === 'ta' ? 'புதிய வேட்டை' : 'Net Catch',
      color: 'from-cyan-600 via-blue-600 to-indigo-700',
      border: 'border-cyan-300 ring-2 ring-cyan-400/40'
    },
    {
      id: 'sing' as GameMode,
      icon: Music,
      title: language === 'ta' ? 'தாளப் பாட்டு' : 'Sing the Chant',
      subtitle: language === 'ta' ? 'கரோக்கி & தாளக் குமிழ்கள்' : 'Karaoke & metronome blobs',
      badge: language === 'ta' ? 'படி 1' : 'Step 1',
      color: 'from-fuchsia-600 to-pink-500',
      border: 'border-pink-400'
    },
    {
      id: 'paint' as GameMode,
      icon: Palette,
      title: language === 'ta' ? 'வண்ணக் கோலம்' : 'Paint the Pattern',
      subtitle: language === 'ta' ? '12 கேன்வாஸ்களில் வண்ணமிடு' : 'Paint the 12 canvas cards',
      badge: language === 'ta' ? 'படி 2' : 'Step 2',
      color: 'from-amber-500 to-orange-500',
      border: 'border-amber-400'
    },
    {
      id: 'build' as GameMode,
      icon: Hammer,
      title: language === 'ta' ? 'விடையை உருவாக்கு' : 'Build It',
      subtitle: language === 'ta' ? 'பத்துகளும் வண்ணச் சுழற்சியும்' : 'Pick tens & cycle chip',
      badge: language === 'ta' ? 'படி 3' : 'Step 3',
      color: 'from-emerald-600 to-teal-500',
      border: 'border-emerald-400'
    },
    {
      id: 'quiz' as GameMode,
      icon: HelpCircle,
      title: language === 'ta' ? 'மின்னல் வினாடி வினா' : 'Quick Quiz',
      subtitle: language === 'ta' ? '10 சுவாரஸ்ய வினாக்கள்' : '10 pattern-aware challenges',
      badge: language === 'ta' ? 'நட்சத்திரம்' : 'Earn Star',
      color: 'from-blue-600 to-indigo-600',
      border: 'border-blue-400'
    },
    {
      id: 'missing' as GameMode,
      icon: Eye,
      title: language === 'ta' ? 'மறைந்த எண்கள்' : 'Missing Number Painting',
      subtitle: language === 'ta' ? 'விடுபட்ட வண்ண எண்களைக் கண்டுபிடி' : 'Fill half-hidden patterns',
      badge: language === 'ta' ? 'மேதை' : 'Mastery',
      color: 'from-purple-600 to-violet-600',
      border: 'border-purple-400'
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-8 animate-fade-in">
      {/* Pixar Mascot Barnaby Greeting */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-pink-900/60 rounded-3xl p-5 border-2 border-indigo-500/30 shadow-xl">
        <BarnabyBrush
          mood="happy"
          message={`Welcome to Table Magic! Try the new Fish Net Catch mode: scoop up the Table ×${selectedTable} fish while dodging the odd ones!`}
          tipTa={`வரவேற்கிறோம்! மீன் வலை வேட்டையில் ×${selectedTable} வாய்ப்பாட்டு மீன்களை மட்டும் உங்கள் வலையில் பிடித்து அசத்துங்கள்!`}
          language={language}
          accentColor={currentConfig.cycleDigitColors[currentConfig.cycle[0]]?.hex || '#06B6D4'}
          size="md"
        />
      </div>

      {/* Table Selector Cards (2, 4, 6, 5) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl sm:text-2xl font-black text-amber-300 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
            <span>{language === 'ta' ? 'வாய்ப்பாட்டைத் தேர்ந்தெடு' : 'Pick a Magic Table'}</span>
          </h2>
          <span className="text-xs sm:text-sm text-slate-300 font-medium">
            {language === 'ta' ? 'வண்ண சுழற்சிகளும் தாளமும்' : 'Patterns & Rhythms'}
          </span>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          {([2, 4, 6, 5] as TableNumber[]).map((tbl) => {
            const cfg = TABLES_CONFIG[tbl];
            const isSelected = selectedTable === tbl;
            const starCount = stars[tbl] || 0;

            return (
              <div
                key={tbl}
                onClick={() => handleTableClick(tbl)}
                className={`relative rounded-3xl p-4 sm:p-5 cursor-pointer transition-all duration-300 select-none ${
                  isSelected
                    ? 'bg-gradient-to-b from-indigo-800 to-purple-900 border-4 border-amber-300 shadow-2xl scale-[1.03] ring-4 ring-cyan-500/30'
                    : 'bg-slate-800/80 hover:bg-slate-800 border-2 border-slate-700 hover:border-slate-500 shadow-md'
                }`}
              >
                {/* 3 Paint-Splash Stars */}
                <div className="flex items-center justify-center gap-1.5 mb-3">
                  {[1, 2, 3].map((starIdx) => (
                    <div key={starIdx} className="relative">
                      {/* Paint splash blob background */}
                      <svg viewBox="0 0 32 32" className="w-7 h-7 sm:w-8 sm:h-8">
                        <path
                          d="M16 2 C22 4, 28 8, 28 15 C28 22, 22 28, 15 29 C8 30, 3 24, 4 17 C5 10, 10 0, 16 2 Z"
                          fill={starIdx <= starCount ? '#F59E0B' : '#334155'}
                          className="transition-colors duration-300"
                        />
                      </svg>
                      <Star
                        className={`absolute inset-0 m-auto w-4 h-4 sm:w-4.5 sm:h-4.5 ${
                          starIdx <= starCount
                            ? 'text-yellow-100 fill-yellow-200 drop-shadow'
                            : 'text-slate-500 fill-transparent'
                        }`}
                      />
                    </div>
                  ))}
                </div>

                {/* Table Giant Number Badge */}
                <div className="text-center">
                  <div className="inline-block relative">
                    <span className="text-4xl sm:text-5xl font-black tracking-tight text-white drop-shadow-md">
                      ×{tbl}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-pink-300 mt-1 truncate">
                    {language === 'ta' ? cfg.titleTa : cfg.title}
                  </h3>
                </div>

                {/* Color Cycle Beads Preview */}
                <div className="mt-3 pt-3 border-t border-slate-700/60 flex items-center justify-center gap-1.5 flex-wrap">
                  {cfg.cycle.map((digit, i) => {
                    const c = cfg.cycleDigitColors[digit];
                    return (
                      <span
                        key={i}
                        style={{ backgroundColor: c.hex }}
                        className="w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black text-white shadow"
                        title={`Digit ${digit}: ${language === 'ta' ? c.nameTa : c.name}`}
                      >
                        {digit}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Featured Fish Net Catch Hero Banner */}
      <div 
        onClick={() => handleModeLaunch('fish-catch')}
        className="relative overflow-hidden bg-gradient-to-r from-cyan-900 via-blue-900 to-indigo-900 rounded-3xl p-6 border-3 border-cyan-400 shadow-2xl cursor-pointer hover:scale-[1.01] transition-transform group"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 relative z-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 flex items-center justify-center text-3xl shadow-xl border-2 border-white/50 group-hover:rotate-6 transition-transform">
              🎣
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-900">
                  {language === 'ta' ? 'புதிய வேட்டை' : 'Featured Challenge'}
                </span>
                <span className="text-xs font-bold text-cyan-300 font-mono">
                  Multiples of {selectedTable}
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5">
                {language === 'ta'
                  ? `×${selectedTable} மீன் வலை வேட்டை அரங்கம்`
                  : `Fish Net Catch: Scoop Table ×${selectedTable} Values!`}
              </h3>
              <p className="text-xs sm:text-sm text-cyan-100 max-w-xl mt-1">
                {language === 'ta'
                  ? `நீந்துகின்ற மீன்களில் ×${selectedTable} இன் மடங்குகளை மட்டும் வலையில் பிடியுங்கள். தவறுதலாக மற்ற மீன்களைத் தொடாதீர்கள்!`
                  : `Control the golden fishing net in the Pixar coral reef! Scoop up multiples of ${selectedTable} while letting odd distractor fish swim by safely.`}
              </p>
            </div>
          </div>

          <div className="shrink-0 flex items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-slate-900/80 border border-cyan-400/40 text-center">
              <span className="text-xs text-slate-400 block font-bold">Cycle Ends:</span>
              <span className="text-sm font-black text-amber-300 font-mono">
                {currentConfig.cycle.join(', ')}
              </span>
            </div>

            <button className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-black px-6 py-3 rounded-2xl shadow-xl text-sm border-2 border-cyan-200 active:scale-95 transition">
              {language === 'ta' ? 'வலை வீசு!' : 'Cast Net!'}
            </button>
          </div>
        </div>

        {/* Decorative background fish shapes */}
        <div className="absolute right-6 -bottom-6 text-7xl opacity-20 pointer-events-none group-hover:scale-125 transition-transform">
          🐟
        </div>
      </div>

      {/* Current Table Pattern Spotlight & Modes */}
      <div className="bg-slate-800/90 border-2 border-indigo-500/40 rounded-3xl p-5 sm:p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-black bg-pink-500/20 text-pink-400 border border-pink-500/40">
                {language === 'ta' ? 'சுழற்சி ரகசியம்' : 'Cycle Secret'}
              </span>
              <h3 className="text-lg sm:text-xl font-black text-white">
                {language === 'ta' ? currentConfig.subtitleTa : currentConfig.subtitle}
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {language === 'ta' ? currentConfig.funFact.ta : currentConfig.funFact.en}
            </p>
          </div>

          <div className="flex items-center gap-2 bg-slate-900/90 px-4 py-2 rounded-2xl border border-slate-700">
            <span className="text-xs font-bold text-slate-400">
              {language === 'ta' ? 'பத்துகளின் தாளம்:' : 'Tens rhythm:'}
            </span>
            <span className="text-sm font-mono font-black text-amber-300 tracking-wider">
              {currentConfig.tensGroupsPattern}
            </span>
          </div>
        </div>

        {/* Learning & Practice Modes */}
        <div className="mt-6 space-y-3">
          <h4 className="text-sm font-black text-slate-300 tracking-wider uppercase">
            {language === 'ta' ? 'விளையாட்டு முறைகள்' : 'All Game Modes for Table ×' + selectedTable}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {modes.map((m) => {
              const Icon = m.icon;
              return (
                <div
                  key={m.id}
                  onClick={() => handleModeLaunch(m.id)}
                  className={`group relative overflow-hidden bg-gradient-to-br ${m.color} p-4 sm:p-5 rounded-3xl border-2 ${m.border} shadow-lg cursor-pointer transform hover:-translate-y-1 active:translate-y-0.5 transition-all duration-200 select-none`}
                >
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/30 text-white backdrop-blur-sm">
                      {m.badge}
                    </span>
                  </div>

                  <div className="mt-4">
                    <h5 className="text-lg font-black text-white group-hover:text-yellow-200 transition-colors">
                      {m.title}
                    </h5>
                    <p className="text-xs text-white/85 mt-0.5">
                      {m.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
