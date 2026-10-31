export type TableNumber = 2 | 4 | 6 | 5;

export type GameMode = 
  | 'home'
  | 'sing'
  | 'paint'
  | 'build'
  | 'quiz'
  | 'missing'
  | 'fish-catch'
  | 'my-home';

export type Language = 'en' | 'ta';

export interface DigitColor {
  digit: number;
  hex: string;
  name: string;
  nameTa: string;
  tailwindBg: string;
  tailwindText: string;
  tailwindBorder: string;
}

export interface ChantBlob {
  text: string;
  textTa: string;
  digit?: number;
  tens?: number;
  isChorus?: boolean;
}

export interface FishSpecies {
  id: string;
  name: string;
  nameTa: string;
  bodyType: 'clownfish' | 'tang' | 'angelfish' | 'guppy' | 'puffer' | 'seahorse';
}

export interface SwimmingFish {
  id: string;
  value: number;
  multiplier?: number;
  isTarget: boolean;
  x: number; // Percentage 0 - 100
  y: number; // Percentage 15 - 85
  speed: number;
  direction: 1 | -1; // 1 = moving right, -1 = moving left
  species: 'clownfish' | 'tang' | 'angelfish' | 'guppy' | 'puffer' | 'seahorse';
  color: string;
  wobble: number;
  size: number;
}

export interface CaughtFishRecord {
  id: string;
  table: TableNumber;
  multiplier: number;
  value: number;
  species: string;
  color: string;
  caughtAt: number;
}

export interface RoomItem {
  id: string;
  type: string;
  name: string;
  nameTa: string;
  unlockedByTable: TableNumber;
  requiresStars?: number;
  priceDrops: number;
  x: number;
  y: number;
  scale: number;
  color: string;
}

export interface TableConfig {
  number: TableNumber;
  title: string;
  titleTa: string;
  subtitle: string;
  subtitleTa: string;
  cycle: number[];
  cycleDigitColors: Record<number, DigitColor>;
  chantBlobs: ChantBlob[];
  chantFullText: { en: string; ta: string };
  tensGroupsPattern: string;
  tensGroupsPatternTa: string;
  calculateTens: (n: number) => number;
  calculateOnes: (n: number) => number;
  mascotTip: { en: string; ta: string };
  funFact: { en: string; ta: string };
}

export interface PlacedRoomItem {
  instanceId: string;
  itemId: string;
  x: number;
  y: number;
  scale: number;
  color: string;
}

export interface RoomDesign {
  wallColor: string;
  wallPattern: 'plain' | 'stripes' | 'dots' | 'diamonds';
  floorColor: string;
  floorPattern: 'wood' | 'tiles' | 'carpet';
  placedItems: PlacedRoomItem[];
}

export interface GameProgress {
  stars: Record<TableNumber, number>; // 0 to 3 stars per table
  paintDrops: number;
  fishCatches: Record<TableNumber, number>;
  aquariumFish: CaughtFishRecord[];
  unlockedItems: string[];
  roomDesign: RoomDesign;
  soundEnabled: boolean;
  language: Language;
}
