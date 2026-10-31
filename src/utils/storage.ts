import { GameProgress, TableNumber } from '../types/game';

const STORAGE_KEY = 'table_magic_studio_save_v1';

export const INITIAL_PROGRESS: GameProgress = {
  stars: {
    2: 0,
    4: 0,
    6: 0,
    5: 0
  },
  paintDrops: 15,
  fishCatches: {
    2: 0,
    4: 0,
    6: 0,
    5: 0
  },
  aquariumFish: [],
  unlockedItems: ['sofa_plush', 'floor_lamp', 'oval_rug'],
  roomDesign: {
    wallColor: '#6366F1',
    wallPattern: 'plain',
    floorColor: '#92400E',
    floorPattern: 'wood',
    placedItems: [
      {
        instanceId: 'inst_1',
        itemId: 'sofa_plush',
        x: 230,
        y: 310,
        scale: 1,
        color: '#EC4899'
      },
      {
        instanceId: 'inst_2',
        itemId: 'floor_lamp',
        x: 90,
        y: 220,
        scale: 1,
        color: '#F97316'
      },
      {
        instanceId: 'inst_3',
        itemId: 'oval_rug',
        x: 250,
        y: 410,
        scale: 1,
        color: '#06B6D4'
      }
    ]
  },
  soundEnabled: true,
  language: 'en'
};

export function loadGameProgress(): GameProgress {
  if (typeof window === 'undefined') return INITIAL_PROGRESS;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return INITIAL_PROGRESS;

    const parsed = JSON.parse(raw) as Partial<GameProgress>;
    return {
      stars: {
        2: parsed.stars?.[2] ?? 0,
        4: parsed.stars?.[4] ?? 0,
        6: parsed.stars?.[6] ?? 0,
        5: parsed.stars?.[5] ?? 0
      },
      paintDrops: typeof parsed.paintDrops === 'number' ? parsed.paintDrops : INITIAL_PROGRESS.paintDrops,
      fishCatches: {
        2: parsed.fishCatches?.[2] ?? 0,
        4: parsed.fishCatches?.[4] ?? 0,
        6: parsed.fishCatches?.[6] ?? 0,
        5: parsed.fishCatches?.[5] ?? 0
      },
      aquariumFish: Array.isArray(parsed.aquariumFish) ? parsed.aquariumFish : [],
      unlockedItems: Array.isArray(parsed.unlockedItems) ? parsed.unlockedItems : INITIAL_PROGRESS.unlockedItems,
      roomDesign: parsed.roomDesign ? {
        wallColor: parsed.roomDesign.wallColor || INITIAL_PROGRESS.roomDesign.wallColor,
        wallPattern: parsed.roomDesign.wallPattern || INITIAL_PROGRESS.roomDesign.wallPattern,
        floorColor: parsed.roomDesign.floorColor || INITIAL_PROGRESS.roomDesign.floorColor,
        floorPattern: parsed.roomDesign.floorPattern || INITIAL_PROGRESS.roomDesign.floorPattern,
        placedItems: Array.isArray(parsed.roomDesign.placedItems) ? parsed.roomDesign.placedItems : INITIAL_PROGRESS.roomDesign.placedItems
      } : INITIAL_PROGRESS.roomDesign,
      soundEnabled: parsed.soundEnabled ?? true,
      language: parsed.language === 'ta' ? 'ta' : 'en'
    };
  } catch (e) {
    console.warn('Could not read localStorage:', e);
    return INITIAL_PROGRESS;
  }
}

export function saveGameProgress(progress: GameProgress): boolean {
  if (typeof window === 'undefined') return false;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return true;
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
    return false;
  }
}

// Export progress as a portable backup code
export function exportBackupCode(progress: GameProgress): string {
  try {
    const json = JSON.stringify(progress);
    const encoded = btoa(encodeURIComponent(json));
    return `TMS-${encoded}`;
  } catch {
    return '';
  }
}

// Import progress from backup code
export function importBackupCode(code: string): GameProgress | null {
  try {
    let cleanCode = code.trim();
    if (cleanCode.startsWith('TMS-')) {
      cleanCode = cleanCode.substring(4);
    }
    const json = decodeURIComponent(atob(cleanCode));
    const data = JSON.parse(json);
    if (data && typeof data === 'object' && data.stars) {
      return data as GameProgress;
    }
    return null;
  } catch (e) {
    console.error('Invalid backup code:', e);
    return null;
  }
}
