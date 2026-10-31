import React, { useState, useEffect } from 'react';
import { GameMode, TableNumber, GameProgress, RoomDesign, CaughtFishRecord } from './types/game';
import { loadGameProgress, saveGameProgress, INITIAL_PROGRESS } from './utils/storage';
import { soundManager } from './utils/audio';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { SingChantScreen } from './components/SingChantScreen';
import { PaintPatternScreen } from './components/PaintPatternScreen';
import { BuildItScreen } from './components/BuildItScreen';
import { QuickQuizScreen } from './components/QuickQuizScreen';
import { MissingNumberScreen } from './components/MissingNumberScreen';
import { FishCatchScreen } from './components/FishCatchScreen';
import { MyHomeScreen } from './components/MyHomeScreen';
import { BackupModal } from './components/BackupModal';

export default function App() {
  const [progress, setProgress] = useState<GameProgress>(loadGameProgress);
  const [currentMode, setCurrentMode] = useState<GameMode>('home');
  const [selectedTable, setSelectedTable] = useState<TableNumber>(2);
  const [backupModalOpen, setBackupModalOpen] = useState<boolean>(false);

  // Sync sound manager with initial state
  useEffect(() => {
    soundManager.setSoundEnabled(progress.soundEnabled);
  }, []);

  // Persist progress to localStorage whenever progress state changes
  useEffect(() => {
    saveGameProgress(progress);
  }, [progress]);

  // Total stars collected across all 4 tables (out of 12)
  const totalStars = Object.values(progress.stars).reduce((acc, curr) => acc + curr, 0);

  const handleEarnDrops = (amount: number) => {
    setProgress((prev) => ({
      ...prev,
      paintDrops: prev.paintDrops + amount,
    }));
  };

  const handleSpendDrops = (amount: number): boolean => {
    if (progress.paintDrops >= amount) {
      setProgress((prev) => ({
        ...prev,
        paintDrops: prev.paintDrops - amount,
      }));
      return true;
    }
    return false;
  };

  const handleAwardStar = (table: TableNumber, starsEarned: number) => {
    setProgress((prev) => {
      const currentStar = prev.stars[table] || 0;
      const newStar = Math.max(currentStar, Math.min(3, starsEarned));
      return {
        ...prev,
        stars: {
          ...prev.stars,
          [table]: newStar,
        },
      };
    });
  };

  const handleAddCaughtFish = (fish: CaughtFishRecord) => {
    setProgress((prev) => {
      const currentTableCatches = prev.fishCatches[fish.table] || 0;
      return {
        ...prev,
        fishCatches: {
          ...prev.fishCatches,
          [fish.table]: currentTableCatches + 1,
        },
        aquariumFish: [fish, ...prev.aquariumFish.slice(0, 49)], // Store up to 50 caught fish
      };
    });
  };

  const handleUnlockItem = (itemId: string) => {
    setProgress((prev) => {
      if (prev.unlockedItems.includes(itemId)) return prev;
      return {
        ...prev,
        unlockedItems: [...prev.unlockedItems, itemId],
      };
    });
  };

  const handleUpdateRoomDesign = (newDesign: RoomDesign) => {
    setProgress((prev) => ({
      ...prev,
      roomDesign: newDesign,
    }));
  };

  const handleToggleSound = () => {
    const nextVal = !progress.soundEnabled;
    soundManager.setSoundEnabled(nextVal);
    setProgress((prev) => ({
      ...prev,
      soundEnabled: nextVal,
    }));
    if (nextVal) {
      soundManager.playPop(1.2);
    }
  };

  const handleToggleLanguage = () => {
    const nextLang = progress.language === 'en' ? 'ta' : 'en';
    soundManager.playPop(1.1);
    setProgress((prev) => ({
      ...prev,
      language: nextLang,
    }));
  };

  const handleRestoreProgress = (imported: GameProgress) => {
    setProgress(imported);
    soundManager.setSoundEnabled(imported.soundEnabled);
  };

  const handleResetProgress = () => {
    setProgress(INITIAL_PROGRESS);
    saveGameProgress(INITIAL_PROGRESS);
    soundManager.playFanfare();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Top Header */}
      <Header
        currentMode={currentMode}
        selectedTable={selectedTable}
        paintDrops={progress.paintDrops}
        totalStars={totalStars}
        soundEnabled={progress.soundEnabled}
        language={progress.language}
        onSelectMode={(mode) => setCurrentMode(mode)}
        onToggleSound={handleToggleSound}
        onToggleLanguage={handleToggleLanguage}
        onOpenBackup={() => setBackupModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-12 safe-pb safe-pl safe-pr">
        {currentMode === 'home' && (
          <HomeScreen
            selectedTable={selectedTable}
            stars={progress.stars}
            paintDrops={progress.paintDrops}
            language={progress.language}
            onSelectTable={(table) => setSelectedTable(table)}
            onLaunchMode={(mode) => setCurrentMode(mode)}
          />
        )}

        {currentMode === 'fish-catch' && (
          <FishCatchScreen
            selectedTable={selectedTable}
            language={progress.language}
            paintDrops={progress.paintDrops}
            caughtFish={progress.aquariumFish}
            onBack={() => setCurrentMode('home')}
            onEarnDrops={handleEarnDrops}
            onAwardStar={handleAwardStar}
            onAddCaughtFish={handleAddCaughtFish}
          />
        )}

        {currentMode === 'sing' && (
          <SingChantScreen
            selectedTable={selectedTable}
            language={progress.language}
            onBack={() => setCurrentMode('home')}
            onEarnDrops={handleEarnDrops}
            onCompletePractice={() => handleAwardStar(selectedTable, 1)}
          />
        )}

        {currentMode === 'paint' && (
          <PaintPatternScreen
            selectedTable={selectedTable}
            language={progress.language}
            onBack={() => setCurrentMode('home')}
            onEarnDrops={handleEarnDrops}
            onAwardStar={handleAwardStar}
          />
        )}

        {currentMode === 'build' && (
          <BuildItScreen
            selectedTable={selectedTable}
            language={progress.language}
            onBack={() => setCurrentMode('home')}
            onEarnDrops={handleEarnDrops}
            onAwardStar={handleAwardStar}
          />
        )}

        {currentMode === 'quiz' && (
          <QuickQuizScreen
            selectedTable={selectedTable}
            language={progress.language}
            onBack={() => setCurrentMode('home')}
            onEarnDrops={handleEarnDrops}
            onAwardStar={handleAwardStar}
          />
        )}

        {currentMode === 'missing' && (
          <MissingNumberScreen
            selectedTable={selectedTable}
            language={progress.language}
            onBack={() => setCurrentMode('home')}
            onEarnDrops={handleEarnDrops}
            onAwardStar={handleAwardStar}
          />
        )}

        {currentMode === 'my-home' && (
          <MyHomeScreen
            paintDrops={progress.paintDrops}
            stars={progress.stars}
            roomDesign={progress.roomDesign}
            unlockedItems={progress.unlockedItems}
            language={progress.language}
            onBack={() => setCurrentMode('home')}
            onSpendDrops={handleSpendDrops}
            onUpdateRoomDesign={handleUpdateRoomDesign}
            onUnlockItem={handleUnlockItem}
          />
        )}
      </main>

      {/* Backup and Restore Modal */}
      <BackupModal
        isOpen={backupModalOpen}
        progress={progress}
        language={progress.language}
        onClose={() => setBackupModalOpen(false)}
        onRestoreProgress={handleRestoreProgress}
        onResetProgress={handleResetProgress}
      />
    </div>
  );
}
