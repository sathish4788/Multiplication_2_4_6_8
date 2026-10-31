import React, { useState, useEffect, useRef } from 'react';
import { 
  ArrowLeft, Sparkles, RefreshCw, Trophy, Volume2, 
  CheckCircle2, Compass, Waves, Camera, Target, Layers
} from 'lucide-react';
import { TableNumber, Language, SwimmingFish, CaughtFishRecord } from '../types/game';
import { TABLES_CONFIG } from '../data/tablesData';
import { BarnabyBrush } from './BarnabyBrush';
import { soundManager } from '../utils/audio';

interface FishCatchScreenProps {
  selectedTable: TableNumber;
  language: Language;
  paintDrops: number;
  caughtFish: CaughtFishRecord[];
  onBack: () => void;
  onEarnDrops: (amount: number) => void;
  onAwardStar: (table: TableNumber, starsEarned: number) => void;
  onAddCaughtFish: (fish: CaughtFishRecord) => void;
}

const SPECIES_LIST: Array<'clownfish' | 'tang' | 'angelfish' | 'guppy' | 'puffer' | 'seahorse'> = [
  'clownfish', 'tang', 'angelfish', 'guppy', 'puffer', 'seahorse'
];

export const FishCatchScreen: React.FC<FishCatchScreenProps> = ({
  selectedTable,
  language,
  paintDrops,
  caughtFish,
  onBack,
  onEarnDrops,
  onAwardStar,
  onAddCaughtFish,
}) => {
  const config = TABLES_CONFIG[selectedTable];

  // Game sub-modes: 'frenzy' (catch all multiples) or 'quest' (catch target: 2 x N)
  const [playMode, setPlayMode] = useState<'frenzy' | 'quest'>('frenzy');
  const [viewTab, setViewTab] = useState<'ocean' | 'aquarium'>('ocean');

  // Net position in ocean coordinate system (0 to 100 percentage)
  const [netPos, setNetPos] = useState<{ x: number; y: number }>({ x: 50, y: 50 });
  const [isNetSwinging, setIsNetSwinging] = useState<boolean>(false);

  // Quest target multiplier (1 to 12)
  const [questTargetMultiplier, setQuestTargetMultiplier] = useState<number>(3);
  const [questScore, setQuestScore] = useState<number>(0);

  // Active swimming fish on screen
  const [fishList, setFishList] = useState<SwimmingFish[]>([]);
  const [caughtSetThisSession, setCaughtSetThisSession] = useState<Set<number>>(new Set());
  const [splashEffect, setSplashEffect] = useState<{ x: number; y: number; text: string; color: string } | null>(null);
  const [mascotMood, setMascotMood] = useState<'happy' | 'cheering' | 'thinking' | 'splat'>('happy');
  const [mascotMsg, setMascotMsg] = useState<string>('');
  const [mascotMsgTa, setMascotMsgTa] = useState<string>('');

  const oceanAreaRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  // All 12 valid multiples for this table (e.g. for 2s: 2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24)
  const allTableMultiples = Array.from({ length: 12 }, (_, i) => selectedTable * (i + 1));

  // Set initial mascot message
  useEffect(() => {
    if (playMode === 'frenzy') {
      setMascotMsg(`Move your net to scoop up multiples of ${selectedTable}! Watch the pattern: last digit must be ${config.cycle.join(', ')}!`);
      setMascotMsgTa(`உங்கள் வலையை நகர்த்தி ×${selectedTable} இன் மடங்குகளைப் பிடியுங்கள்! கடைசி எண் ${config.cycle.join(', ')} ஆக இருக்கும்!`);
    } else {
      const targetVal = selectedTable * questTargetMultiplier;
      setMascotMsg(`Mission: Catch ${selectedTable} × ${questTargetMultiplier} = ${targetVal}! Find that fish in the sea!`);
      setMascotMsgTa(`இலக்கு: ${selectedTable} × ${questTargetMultiplier} = ${targetVal} மீனை வலை வீசிப் பிடியுங்கள்!`);
    }
  }, [playMode, questTargetMultiplier, selectedTable]);

  // Spawn fish pool
  useEffect(() => {
    spawnFreshFishPool();
  }, [selectedTable, playMode, questTargetMultiplier]);

  const spawnFreshFishPool = () => {
    const newFish: SwimmingFish[] = [];
    const count = 9;

    // Pick 4-5 correct values and 4-5 distractors
    for (let i = 0; i < count; i++) {
      let value = 0;
      let isTarget = false;
      let multiplier: number | undefined;

      if (playMode === 'quest') {
        const questTarget = selectedTable * questTargetMultiplier;
        if (i === 0 || i === 3) {
          value = questTarget;
          isTarget = true;
          multiplier = questTargetMultiplier;
        } else {
          // Distractor: near value or odd number
          const randM = ((questTargetMultiplier + i) % 12) + 1;
          value = randM % 2 === 0 ? selectedTable * randM + 1 : selectedTable * randM - 1;
          if (value === questTarget) value += 2;
          isTarget = false;
        }
      } else {
        // Frenzy mode: multiples of selectedTable vs distractors
        const shouldBeMultiple = i % 2 === 0;
        if (shouldBeMultiple) {
          const m = (i * 2 + 1) % 12 + 1;
          value = selectedTable * m;
          multiplier = m;
          isTarget = true;
        } else {
          // Distractor
          const baseM = Math.floor(Math.random() * 12) + 1;
          const distractorOffsets = [1, 3, -1, 5, 7];
          const offset = distractorOffsets[i % distractorOffsets.length];
          value = Math.max(1, selectedTable * baseM + offset);
          if (value % selectedTable === 0) value += 1;
          isTarget = false;
        }
      }

      const ones = value % 10;
      const color = config.cycleDigitColors[ones]?.hex || '#EC4899';
      const direction: 1 | -1 = Math.random() > 0.5 ? 1 : -1;

      newFish.push({
        id: `fish_${Date.now()}_${i}_${Math.random()}`,
        value,
        multiplier,
        isTarget,
        x: Math.random() * 85 + 5,
        y: 18 + (i * 70) / count + (Math.random() * 6 - 3),
        speed: 0.18 + Math.random() * 0.22,
        direction,
        species: SPECIES_LIST[i % SPECIES_LIST.length],
        color,
        wobble: Math.random() * Math.PI * 2,
        size: 0.9 + Math.random() * 0.25,
      });
    }

    setFishList(newFish);
  };

  // Continuous animation loop for swimming fish
  useEffect(() => {
    let lastTime = performance.now();

    const updateFishPositions = (currentTime: number) => {
      const dt = (currentTime - lastTime) / 16.6;
      lastTime = currentTime;

      setFishList((prev) =>
        prev.map((f) => {
          let nextX = f.x + f.speed * f.direction * dt;
          let nextDirection = f.direction;

          // Bounce or wrap around screen edges
          if (nextX > 94) {
            nextX = 94;
            nextDirection = -1;
          } else if (nextX < 4) {
            nextX = 4;
            nextDirection = 1;
          }

          // Gentle sinusoidal vertical wave wobble
          const newWobble = f.wobble + 0.05 * dt;

          return {
            ...f,
            x: nextX,
            direction: nextDirection,
            wobble: newWobble,
          };
        })
      );

      animFrameRef.current = requestAnimationFrame(updateFishPositions);
    };

    animFrameRef.current = requestAnimationFrame(updateFishPositions);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, []);

  // Handle player moving or tapping the net
  const handleNetMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!oceanAreaRef.current) return;
    const rect = oceanAreaRef.current.getBoundingClientRect();
    const x = Math.max(8, Math.min(92, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.max(15, Math.min(85, ((e.clientY - rect.top) / rect.height) * 100));
    setNetPos({ x, y });
  };

  // Catch attempt at current net position or direct fish tap
  const handleCatchFish = (targetFish?: SwimmingFish) => {
    setIsNetSwinging(true);
    setTimeout(() => setIsNetSwinging(false), 300);

    // Find fish closest to net or targeted fish
    const fishToCatch = targetFish || findFishNearNet();

    if (!fishToCatch) {
      soundManager.playBeat();
      return;
    }

    const isMultipleOfTable = fishToCatch.value % selectedTable === 0;
    const onesDigit = fishToCatch.value % 10;
    const isCycleMatch = config.cycle.includes(onesDigit);

    if (playMode === 'quest') {
      const targetVal = selectedTable * questTargetMultiplier;
      if (fishToCatch.value === targetVal) {
        // Quest Target Caught!
        soundManager.playPop(1.5);
        soundManager.playFanfare();
        onEarnDrops(2);
        setQuestScore((s) => s + 1);

        triggerSplash(fishToCatch.x, fishToCatch.y, `🎯 Caught ${fishToCatch.value}!`, fishToCatch.color);
        setMascotMood('cheering');
        setMascotMsg(`Splendid! You caught ${selectedTable} × ${questTargetMultiplier} = ${targetVal}!`);
        setMascotMsgTa(`அற்புதம்! ${selectedTable} × ${questTargetMultiplier} = ${targetVal} மீனைப் பிடித்துவிட்டீர்கள்!`);

        // Record caught fish in aquarium
        const record: CaughtFishRecord = {
          id: `caught_${Date.now()}`,
          table: selectedTable,
          multiplier: questTargetMultiplier,
          value: fishToCatch.value,
          species: fishToCatch.species,
          color: fishToCatch.color,
          caughtAt: Date.now(),
        };
        onAddCaughtFish(record);

        // Next multiplier in quest
        setTimeout(() => {
          setQuestTargetMultiplier((m) => (m % 12) + 1);
          spawnFreshFishPool();
        }, 800);
      } else {
        // Wrong fish in Quest
        soundManager.playBoop();
        setMascotMood('splat');
        triggerSplash(fishToCatch.x, fishToCatch.y, `Oops! Not ${targetVal}`, '#F43F5E');
        setMascotMsg(`That fish is ${fishToCatch.value}. We need ${selectedTable} × ${questTargetMultiplier} = ${targetVal}!`);
        setMascotMsgTa(`அந்த மீன் ${fishToCatch.value}. நமக்குத் தேவை ${selectedTable} × ${questTargetMultiplier} = ${targetVal}!`);
      }
    } else {
      // Frenzy mode: Catch any multiple of selectedTable
      if (isMultipleOfTable) {
        // Valid Multiple Caught!
        soundManager.playPop(1.4);
        onEarnDrops(1);

        const newCaughtSet = new Set(caughtSetThisSession);
        newCaughtSet.add(fishToCatch.value);
        setCaughtSetThisSession(newCaughtSet);

        triggerSplash(fishToCatch.x, fishToCatch.y, `✨ +${fishToCatch.value} Caught!`, fishToCatch.color);
        setMascotMood('cheering');
        setMascotMsg(`Nice catch! ${fishToCatch.value} is a multiple of ${selectedTable} (ends in ${onesDigit})!`);
        setMascotMsgTa(`அருமையான வேட்டை! ${fishToCatch.value} என்பது ${selectedTable} இன் மடங்கு!`);

        // Record in aquarium
        const record: CaughtFishRecord = {
          id: `caught_${Date.now()}`,
          table: selectedTable,
          multiplier: fishToCatch.value / selectedTable,
          value: fishToCatch.value,
          species: fishToCatch.species,
          color: fishToCatch.color,
          caughtAt: Date.now(),
        };
        onAddCaughtFish(record);

        // Check if all 12 multiples caught
        if (newCaughtSet.size >= 12) {
          soundManager.playFanfare();
          onAwardStar(selectedTable, 3);
          onEarnDrops(10);
        }

        // Remove caught fish and spawn a replacement
        setFishList((prev) => prev.filter((f) => f.id !== fishToCatch.id));
        setTimeout(spawnSingleFish, 1200);
      } else {
        // Net caught a wrong / non-multiple fish
        soundManager.playBoop();
        soundManager.playSplat();
        setMascotMood('thinking');
        triggerSplash(fishToCatch.x, fishToCatch.y, `Not a multiple of ${selectedTable}!`, '#FB7185');
        setMascotMsg(
          `Oops! ${fishToCatch.value} is NOT in Table ×${selectedTable}. The last digit must be ${config.cycle.join(', ')}!`
        );
        setMascotMsgTa(
          `அச்சச்சோ! ${fishToCatch.value} என்பது ×${selectedTable} இன் மடங்கு அல்ல. கடைசி எண் ${config.cycle.join(', ')} ஆக இருக்க வேண்டும்!`
        );
      }
    }
  };

  const findFishNearNet = (): SwimmingFish | null => {
    let closest: SwimmingFish | null = null;
    let minDist = 18; // Catch radius in percentage units

    for (const f of fishList) {
      const dist = Math.hypot(f.x - netPos.x, f.y - netPos.y);
      if (dist < minDist) {
        minDist = dist;
        closest = f;
      }
    }
    return closest;
  };

  const spawnSingleFish = () => {
    const isMultiple = Math.random() > 0.4;
    let value = 0;
    let multiplier: number | undefined;

    if (isMultiple) {
      const m = Math.floor(Math.random() * 12) + 1;
      value = selectedTable * m;
      multiplier = m;
    } else {
      const baseM = Math.floor(Math.random() * 12) + 1;
      value = selectedTable * baseM + (Math.random() > 0.5 ? 1 : 3);
      if (value % selectedTable === 0) value += 1;
    }

    const ones = value % 10;
    const color = config.cycleDigitColors[ones]?.hex || '#EC4899';
    const direction: 1 | -1 = Math.random() > 0.5 ? 1 : -1;

    const freshFish: SwimmingFish = {
      id: `fish_${Date.now()}_${Math.random()}`,
      value,
      multiplier,
      isTarget: isMultiple,
      x: direction === 1 ? 5 : 92,
      y: 18 + Math.random() * 65,
      speed: 0.18 + Math.random() * 0.2,
      direction,
      species: SPECIES_LIST[Math.floor(Math.random() * SPECIES_LIST.length)],
      color,
      wobble: 0,
      size: 0.95 + Math.random() * 0.2,
    };

    setFishList((prev) => [...prev, freshFish]);
  };

  const triggerSplash = (x: number, y: number, text: string, color: string) => {
    setSplashEffect({ x, y, text, color });
    setTimeout(() => setSplashEffect(null), 1200);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fade-in select-none">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-2xl font-bold text-sm border border-slate-700 transition active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'ta' ? 'முதன்மைப் பக்கம்' : 'Back to Studio'}</span>
        </button>

        {/* View Switcher: Ocean Catch vs Aquarium Trophy */}
        <div className="flex items-center gap-2 bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700">
          <button
            onClick={() => setViewTab('ocean')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              viewTab === 'ocean'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Waves className="w-4 h-4" />
            <span>{language === 'ta' ? 'மீன் பிடித்தல்' : 'Reef Net Catch'}</span>
          </button>

          <button
            onClick={() => setViewTab('aquarium')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
              viewTab === 'aquarium'
                ? 'bg-gradient-to-r from-amber-500 to-pink-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>
              {language === 'ta' ? 'என் மீன் தொட்டி' : 'My Aquarium'}{' '}
              <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-full ml-1 font-mono">
                {caughtFish.filter((f) => f.table === selectedTable).length}
              </span>
            </span>
          </button>
        </div>
      </div>

      {/* Mascot Guidance */}
      <div className="bg-gradient-to-r from-sky-950/80 via-indigo-950/80 to-purple-950/80 rounded-3xl p-5 border-2 border-cyan-500/30 shadow-xl">
        <BarnabyBrush
          mood={mascotMood}
          message={mascotMsg}
          tipTa={mascotMsgTa}
          language={language}
          accentColor="#06B6D4"
        />
      </div>

      {viewTab === 'ocean' ? (
        <>
          {/* Sub-mode switcher & Pattern Strip Header */}
          <div className="bg-slate-800/90 rounded-3xl p-4 border border-slate-700 flex flex-wrap items-center justify-between gap-3 shadow-lg">
            {/* Mode selection buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPlayMode('frenzy')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  playMode === 'frenzy'
                    ? 'bg-pink-600 text-white shadow'
                    : 'bg-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'அனைத்து மடங்குகள் வேட்டை' : 'Multiples Frenzy'}</span>
              </button>

              <button
                onClick={() => setPlayMode('quest')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition cursor-pointer ${
                  playMode === 'quest'
                    ? 'bg-amber-500 text-slate-900 shadow'
                    : 'bg-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                <Target className="w-3.5 h-3.5" />
                <span>{language === 'ta' ? 'குறிப்பிட்ட வினா வேட்டை' : 'Target Quest'}</span>
              </button>
            </div>

            {/* Target Display or Multiples Progress */}
            {playMode === 'quest' ? (
              <div className="flex items-center gap-2 bg-slate-900/90 px-4 py-1.5 rounded-2xl border border-amber-400/50">
                <span className="text-xs font-bold text-slate-400">Target:</span>
                <span className="text-base font-black text-amber-300">
                  {selectedTable} × {questTargetMultiplier} ={' '}
                  <span className="text-pink-400 text-lg">{selectedTable * questTargetMultiplier}</span>
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-bold text-slate-400 mr-1">
                  {language === 'ta' ? 'சுழற்சி முடிவுகள்:' : 'Cycle Ends In:'}
                </span>
                {config.cycle.map((digit) => (
                  <span
                    key={digit}
                    style={{ backgroundColor: config.cycleDigitColors[digit]?.hex }}
                    className="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-black text-white shadow"
                  >
                    {digit}
                  </span>
                ))}
              </div>
            )}

            {/* Caught Progress Counter */}
            <div className="flex items-center gap-1.5 bg-cyan-950/70 border border-cyan-500/40 px-3 py-1 rounded-xl text-xs font-bold text-cyan-300">
              <span>🐟</span>
              <span>
                {caughtSetThisSession.size} / 12 Multiples Caught
              </span>
            </div>
          </div>

          {/* THE PIXAR OCEAN REEF CANVASES & SWIMMING FISH */}
          <div
            ref={oceanAreaRef}
            onPointerMove={handleNetMove}
            onClick={() => handleCatchFish()}
            className="relative w-full h-[460px] sm:h-[520px] rounded-3xl overflow-hidden border-4 border-cyan-500/40 shadow-2xl cursor-none touch-none bg-gradient-to-b from-sky-400 via-blue-600 to-indigo-950"
          >
            {/* SVG Background Elements: Sunlight Rays, Seaweed, Corals */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              <defs>
                <linearGradient id="oceanSunRays" x1="0%" y1="0%" x2="40%" y2="100%">
                  <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Sunbeam Light Rays */}
              <polygon points="120,0 200,0 350,520 220,520" fill="url(#oceanSunRays)" />
              <polygon points="360,0 420,0 600,520 480,520" fill="url(#oceanSunRays)" />
              <polygon points="560,0 650,0 820,520 680,520" fill="url(#oceanSunRays)" />

              {/* Underwater Seabed Sandy Hills */}
              <path
                d="M 0,440 Q 180,410 360,450 Q 540,490 720,440 Q 900,410 1080,450 L 1080,520 L 0,520 Z"
                fill="#FDE68A"
                opacity="0.35"
              />

              {/* Animated Swaying Seaweed & Sea Anemone */}
              <g fill="#10B981" opacity="0.75">
                <path d="M 60,520 Q 80,420 50,340 Q 75,260 55,200 Q 40,260 50,340 Q 60,420 40,520 Z" />
                <path d="M 120,520 Q 100,440 130,360 Q 115,290 125,230 Q 140,290 120,360 Q 110,440 135,520 Z" />
                <path d="M 880,520 Q 860,420 890,340 Q 875,270 885,210 Q 900,270 880,340 Q 870,420 895,520 Z" />
              </g>

              {/* Colorful Sea Corals */}
              <circle cx="220" cy="490" r="26" fill="#F43F5E" opacity="0.8" />
              <circle cx="240" cy="485" r="20" fill="#FB7185" opacity="0.8" />
              <circle cx="750" cy="485" r="30" fill="#A855F7" opacity="0.8" />
              <circle cx="780" cy="490" r="22" fill="#C084FC" opacity="0.8" />
              <circle cx="480" cy="495" r="18" fill="#F59E0B" opacity="0.8" />

              {/* Starfish on sand */}
              <polygon
                points="340,480 344,488 352,488 346,493 348,501 340,496 332,501 334,493 328,488 336,488"
                fill="#F97316"
              />
            </svg>

            {/* Bubble Particles Floating Upwards */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {[15, 32, 48, 65, 82, 94].map((leftPct, i) => (
                <div
                  key={i}
                  style={{
                    left: `${leftPct}%`,
                    bottom: '-20px',
                    animation: `floatUp ${4 + (i % 3)}s linear infinite`,
                    animationDelay: `${i * 0.7}s`,
                  }}
                  className="absolute w-4 h-4 rounded-full border border-white/50 bg-white/20 backdrop-blur-xs"
                />
              ))}
            </div>

            {/* SWIMMING FISH */}
            {fishList.map((fish) => {
              const onesDigit = fish.value % 10;
              const tensDigit = Math.floor(fish.value / 10);
              const isMultiple = fish.value % selectedTable === 0;

              return (
                <div
                  key={fish.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleCatchFish(fish);
                  }}
                  style={{
                    left: `${fish.x}%`,
                    top: `${fish.y + Math.sin(fish.wobble) * 3}%`,
                    transform: `translate(-50%, -50%) scaleX(${fish.direction}) scale(${fish.size})`,
                    transition: 'transform 0.15s ease-out',
                  }}
                  className="absolute cursor-pointer group"
                >
                  <div className="relative flex items-center justify-center">
                    {/* SVG Vector Fish Graphic */}
                    <svg viewBox="-50 -35 100 70" className="w-24 h-16 sm:w-28 sm:h-20 drop-shadow-lg">
                      {renderSwimmingFishGraphic(fish.species, fish.color)}
                    </svg>

                    {/* Number Value Bubble Badge On Fish */}
                    <div
                      style={{
                        transform: `scaleX(${fish.direction})`, // Keep number upright
                      }}
                      className={`absolute -top-3 px-2 py-0.5 rounded-full flex items-center justify-center font-mono font-black text-sm sm:text-base border-2 shadow-md ${
                        isMultiple
                          ? 'bg-slate-900/95 text-white border-amber-300 ring-2 ring-pink-500/40'
                          : 'bg-slate-800/90 text-slate-200 border-slate-600'
                      }`}
                    >
                      {/* Tens box */}
                      {tensDigit > 0 && (
                        <span className="text-white/80 mr-0.5">{tensDigit}</span>
                      )}
                      {/* Ones digit in cycle paint color */}
                      <span
                        style={{
                          color: isMultiple
                            ? config.cycleDigitColors[onesDigit]?.hex || '#EC4899'
                            : '#F43F5E',
                        }}
                      >
                        {onesDigit}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* THE FISHING NET (Follows cursor / touch and scoops) */}
            <div
              style={{
                left: `${netPos.x}%`,
                top: `${netPos.y}%`,
                transform: `translate(-50%, -50%) ${isNetSwinging ? 'scale(1.2) rotate(-15deg)' : 'scale(1)'}`,
                transition: 'transform 0.12s ease-out',
              }}
              className="absolute pointer-events-none z-30 flex items-center justify-center"
            >
              {/* Pixar Style Fishing Net SVG */}
              <svg viewBox="-50 -50 100 100" className="w-28 h-28 sm:w-36 sm:h-36 drop-shadow-2xl">
                <defs>
                  <linearGradient id="netRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#F59E0B" />
                    <stop offset="100%" stopColor="#D97706" />
                  </linearGradient>
                </defs>

                {/* Net Handle */}
                <line x1="-35" y1="35" x2="-18" y2="18" stroke="#78350F" strokeWidth="6" strokeLinecap="round" />
                <line x1="-35" y1="35" x2="-22" y2="22" stroke="#B45309" strokeWidth="4" strokeLinecap="round" />

                {/* Net Mesh Bag */}
                <ellipse cx="6" cy="-4" rx="34" ry="34" fill="rgba(255, 255, 255, 0.12)" stroke="none" />
                {/* Mesh Grid Lines */}
                <g stroke="#FFFFFF" strokeWidth="1.5" opacity="0.6" strokeDasharray="3 3">
                  <line x1="-20" y1="-20" x2="30" y2="30" />
                  <line x1="-10" y1="-30" x2="40" y2="20" />
                  <line x1="-30" y1="-10" x2="20" y2="40" />
                  <line x1="-20" y1="20" x2="30" y2="-30" />
                  <line x1="-10" y1="30" x2="40" y2="-20" />
                  <line x1="-30" y1="10" x2="20" y2="-40" />
                </g>

                {/* Circular Golden Hoop Rim */}
                <ellipse
                  cx="5"
                  cy="-5"
                  rx="34"
                  ry="34"
                  fill="none"
                  stroke="url(#netRimGrad)"
                  strokeWidth="5"
                />
                <ellipse
                  cx="5"
                  cy="-5"
                  rx="34"
                  ry="34"
                  fill="none"
                  stroke="#FEF08A"
                  strokeWidth="2"
                  opacity="0.8"
                />
              </svg>
            </div>

            {/* Splash celebration particle */}
            {splashEffect && (
              <div
                style={{
                  left: `${splashEffect.x}%`,
                  top: `${splashEffect.y}%`,
                }}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-40 pointer-events-none animate-paint-splat"
              >
                <div
                  style={{ backgroundColor: splashEffect.color }}
                  className="px-4 py-2 rounded-2xl text-white font-black text-sm sm:text-base shadow-2xl border-2 border-white flex items-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 text-yellow-300" />
                  <span>{splashEffect.text}</span>
                </div>
              </div>
            )}

            {/* Instruction Tap Floating Pill */}
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-cyan-400/40 text-xs font-bold text-cyan-200 pointer-events-none flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-amber-400" />
              <span>
                {language === 'ta'
                  ? 'வலையை நகர்த்தியோ அல்லது மீனைத் தொட்டோ பிடிக்கவும்!'
                  : 'Drag net or tap fish to catch! Multiples of ' + selectedTable}
              </span>
            </div>
          </div>

          {/* Table Multiples Collection Tracker (12 Fish Multiples Grid) */}
          <div className="bg-slate-900/90 border-2 border-slate-800 rounded-3xl p-5 shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-black text-amber-300 flex items-center gap-2">
                <span>🐠</span>
                <span>
                  {language === 'ta'
                    ? `×${selectedTable} வாய்ப்பாடு மீன் சேகரிப்பு:`
                    : `Table ×${selectedTable} Catch Collection (12 Multiples):`}
                </span>
              </h4>
              <span className="text-xs text-slate-400 font-mono">
                {caughtSetThisSession.size} / 12 Unlocked
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {allTableMultiples.map((val, idx) => {
                const multiplier = idx + 1;
                const isCaught = caughtSetThisSession.has(val);
                const ones = val % 10;
                const colHex = config.cycleDigitColors[ones]?.hex || '#EC4899';

                return (
                  <div
                    key={val}
                    className={`p-2.5 rounded-2xl border-2 flex items-center justify-between transition-all ${
                      isCaught
                        ? 'bg-slate-800 border-emerald-400 shadow-md'
                        : 'bg-slate-900/70 border-slate-800 opacity-55'
                    }`}
                  >
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">
                        {selectedTable} × {multiplier}
                      </span>
                      <span className="text-base font-black text-white">{val}</span>
                    </div>

                    <div
                      style={{ backgroundColor: isCaught ? colHex : '#334155' }}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white shadow"
                    >
                      {isCaught ? '✓' : ones}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        /* AQUARIUM TROPHY TANK VIEW */
        <div className="bg-slate-900/95 border-2 border-indigo-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="text-xl sm:text-2xl font-black text-amber-300 flex items-center gap-2">
                <span>🏆</span>
                <span>{language === 'ta' ? 'என் சொந்த மீன் காட்சியகம்' : 'My Magic Aquarium'}</span>
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                {language === 'ta'
                  ? 'நீங்கள் வலையில் பிடித்த அழகிய வாய்ப்பாட்டு மீன்கள் இங்கே நீந்துகின்றன!'
                  : 'All the multiples of Table ×' + selectedTable + ' you scooped in your net!'}
              </p>
            </div>

            <button
              onClick={() => {
                soundManager.playPop(1.4);
                window.print();
              }}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-3.5 py-2 rounded-xl text-xs active:scale-95 transition cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Snapshot</span>
            </button>
          </div>

          {/* Aquarium Glass Display Tank */}
          <div className="relative w-full h-[360px] rounded-3xl overflow-hidden border-4 border-cyan-400/50 shadow-2xl bg-gradient-to-b from-sky-500/80 via-blue-700/80 to-indigo-950 p-6 flex items-center justify-center">
            {caughtFish.filter((f) => f.table === selectedTable).length === 0 ? (
              <div className="text-center space-y-2">
                <span className="text-5xl block animate-bounce">🎣</span>
                <p className="text-sm font-bold text-cyan-200">
                  {language === 'ta'
                    ? 'வலை வீசி மீன்களைப் பிடியுங்கள்! அவை இங்கே நீந்த வரும்!'
                    : 'Your aquarium is waiting! Scoop multiples of ' + selectedTable + ' in the ocean net!'}
                </p>
                <button
                  onClick={() => setViewTab('ocean')}
                  className="bg-amber-400 text-slate-900 font-black px-4 py-2 rounded-xl text-xs shadow-lg active:scale-95 transition cursor-pointer mt-2"
                >
                  Start Fishing Now
                </button>
              </div>
            ) : (
              <div className="w-full h-full relative">
                {caughtFish
                  .filter((f) => f.table === selectedTable)
                  .map((cf, idx) => {
                    const posX = 15 + ((idx * 27) % 70);
                    const posY = 20 + ((idx * 31) % 60);

                    return (
                      <div
                        key={cf.id}
                        style={{
                          left: `${posX}%`,
                          top: `${posY}%`,
                          animation: `floatUp ${5 + (idx % 3)}s ease-in-out infinite alternate`,
                        }}
                        className="absolute flex flex-col items-center cursor-pointer hover:scale-125 transition-transform"
                      >
                        <svg viewBox="-50 -35 100 70" className="w-20 h-14 drop-shadow">
                          {renderSwimmingFishGraphic(cf.species as any, cf.color)}
                        </svg>
                        <span className="text-[11px] font-black font-mono px-2 py-0.5 rounded-full bg-slate-900/90 text-amber-300 border border-amber-300/40 -mt-1 shadow">
                          {selectedTable} × {cf.multiplier} = {cf.value}
                        </span>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Render vector graphics for different colorful Pixar fish species
function renderSwimmingFishGraphic(
  species: 'clownfish' | 'tang' | 'angelfish' | 'guppy' | 'puffer' | 'seahorse',
  color: string
) {
  switch (species) {
    case 'clownfish':
      return (
        <g>
          {/* Tail Fin */}
          <polygon points="-32,0 -48,-16 -44,0 -48,16" fill={color} stroke="#0F172A" strokeWidth="1.5" />
          {/* Main Body */}
          <ellipse cx="-4" cy="0" rx="30" ry="18" fill={color} stroke="#0F172A" strokeWidth="2" />
          {/* White Clownfish Stripes */}
          <path d="M -12,-17 Q -8,0 -12,17 L -17,17 Q -13,0 -17,-17 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />
          <path d="M 6,-15 Q 10,0 6,15 L 2,15 Q 6,0 2,-15 Z" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1" />
          {/* Fins */}
          <polygon points="-4,-18 4,-26 12,-17" fill={color} stroke="#0F172A" strokeWidth="1.5" />
          <polygon points="-4,18 4,24 8,17" fill={color} stroke="#0F172A" strokeWidth="1.5" />
          {/* Cute Big Pixar Eye */}
          <circle cx="16" cy="-4" r="5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="17" cy="-4" r="2.5" fill="#0F172A" />
          <circle cx="18" cy="-5" r="1" fill="#FFFFFF" />
          {/* Smile */}
          <path d="M 22,2 Q 24,5 20,6" stroke="#0F172A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </g>
      );

    case 'tang':
      return (
        <g>
          {/* Blue Tang Tail */}
          <polygon points="-32,0 -48,-14 -42,0 -48,14" fill="#FDE047" stroke="#0F172A" strokeWidth="1.5" />
          {/* Oval Body */}
          <ellipse cx="-4" cy="0" rx="30" ry="22" fill={color} stroke="#0F172A" strokeWidth="2" />
          {/* Black Tang Swirl Pattern */}
          <path d="M -24,4 Q -4,-18 10,-10 Q 0,4 -18,12 Z" fill="#1E1B4B" />
          {/* Big Eye */}
          <circle cx="16" cy="-5" r="5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="17" cy="-5" r="2.5" fill="#0F172A" />
          <circle cx="18" cy="-6" r="1" fill="#FFFFFF" />
          <path d="M 22,2 Q 24,5 20,6" stroke="#0F172A" strokeWidth="1.5" fill="none" />
        </g>
      );

    case 'angelfish':
      return (
        <g>
          {/* Tall Angelfish Fins */}
          <polygon points="-10,-15 -2,-34 6,-15" fill={color} stroke="#0F172A" strokeWidth="1.5" />
          <polygon points="-10,15 -2,34 6,15" fill={color} stroke="#0F172A" strokeWidth="1.5" />
          {/* Tail */}
          <polygon points="-28,0 -46,-12 -42,0 -46,12" fill={color} stroke="#0F172A" strokeWidth="1.5" />
          {/* Diamond Body */}
          <polygon points="-24,0 -4,-18 22,0 -4,18" fill={color} stroke="#0F172A" strokeWidth="2" />
          {/* Vertical Body Stripes */}
          <line x1="-8" y1="-14" x2="-8" y2="14" stroke="#FFFFFF" strokeWidth="2" />
          <line x1="4" y1="-10" x2="4" y2="10" stroke="#FFFFFF" strokeWidth="2" />
          {/* Eye */}
          <circle cx="12" cy="-3" r="4.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="13" cy="-3" r="2.2" fill="#0F172A" />
          <circle cx="14" cy="-4" r="1" fill="#FFFFFF" />
        </g>
      );

    case 'puffer':
      return (
        <g>
          {/* Tiny Tail */}
          <polygon points="-26,0 -38,-10 -35,0 -38,10" fill={color} stroke="#0F172A" strokeWidth="1.5" />
          {/* Round Puffer Body */}
          <circle cx="0" cy="0" r="24" fill={color} stroke="#0F172A" strokeWidth="2" />
          {/* Cute Spikes */}
          <circle cx="-16" cy="-14" r="2" fill="#FEF08A" />
          <circle cx="0" cy="-20" r="2" fill="#FEF08A" />
          <circle cx="14" cy="-14" r="2" fill="#FEF08A" />
          <circle cx="-16" cy="14" r="2" fill="#FEF08A" />
          <circle cx="0" cy="20" r="2" fill="#FEF08A" />
          <circle cx="14" cy="14" r="2" fill="#FEF08A" />
          {/* Big Chibi Eyes */}
          <circle cx="12" cy="-6" r="5.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="13" cy="-6" r="3" fill="#0F172A" />
          <circle cx="14" cy="-7" r="1.2" fill="#FFFFFF" />
          {/* Cute Pout Lips */}
          <ellipse cx="23" cy="2" rx="3" ry="2.5" fill="#FB7185" stroke="#0F172A" strokeWidth="1" />
        </g>
      );

    default: // guppy / default
      return (
        <g>
          {/* Flowing Guppy Tail */}
          <path d="M -24,0 Q -42,-22 -46,0 Q -42,22 -24,0 Z" fill={color} stroke="#0F172A" strokeWidth="1.5" />
          {/* Body */}
          <ellipse cx="0" cy="0" rx="26" ry="15" fill={color} stroke="#0F172A" strokeWidth="2" />
          {/* Eye */}
          <circle cx="14" cy="-4" r="4.5" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          <circle cx="15" cy="-4" r="2.2" fill="#0F172A" />
          <circle cx="16" cy="-5" r="1" fill="#FFFFFF" />
        </g>
      );
  }
}
