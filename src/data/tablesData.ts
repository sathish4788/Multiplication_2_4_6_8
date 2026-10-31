import { TableConfig, TableNumber, RoomItem, DigitColor } from '../types/game';

// Shared Pixar-style palette for digits across tables
export const COMMON_DIGIT_COLORS: Record<number, DigitColor> = {
  2: {
    digit: 2,
    hex: '#EC4899', // Berry Pink
    name: 'Berry Pink',
    nameTa: 'இளஞ்சிவப்பு',
    tailwindBg: 'bg-pink-500',
    tailwindText: 'text-pink-500',
    tailwindBorder: 'border-pink-500'
  },
  4: {
    digit: 4,
    hex: '#F97316', // Tangy Tangerine
    name: 'Tangy Tangerine',
    nameTa: 'ஆரஞ்சு',
    tailwindBg: 'bg-orange-500',
    tailwindText: 'text-orange-500',
    tailwindBorder: 'border-orange-500'
  },
  6: {
    digit: 6,
    hex: '#10B981', // Emerald Green
    name: 'Emerald Mint',
    nameTa: 'பச்சை',
    tailwindBg: 'bg-emerald-500',
    tailwindText: 'text-emerald-500',
    tailwindBorder: 'border-emerald-500'
  },
  8: {
    digit: 8,
    hex: '#06B6D4', // Ocean Cyan
    name: 'Ocean Cyan',
    nameTa: 'நீல வண்ணம்',
    tailwindBg: 'bg-cyan-500',
    tailwindText: 'text-cyan-500',
    tailwindBorder: 'border-cyan-500'
  },
  0: {
    digit: 0,
    hex: '#8B5CF6', // Royal Purple
    name: 'Magic Violet',
    nameTa: 'ஊதா வண்ணம்',
    tailwindBg: 'bg-violet-500',
    tailwindText: 'text-violet-500',
    tailwindBorder: 'border-violet-500'
  },
  5: {
    digit: 5,
    hex: '#F59E0B', // Golden Amber
    name: 'Golden Sun',
    nameTa: 'தங்க மஞ்சள்',
    tailwindBg: 'bg-amber-500',
    tailwindText: 'text-amber-500',
    tailwindBorder: 'border-amber-500'
  }
};

// 5s has alternate colors: 5 (Gold) and 0 (Teal/Turquoise)
export const FIVE_DIGIT_COLORS: Record<number, DigitColor> = {
  5: {
    digit: 5,
    hex: '#F59E0B',
    name: 'Golden Sun',
    nameTa: 'தங்க மஞ்சள்',
    tailwindBg: 'bg-amber-500',
    tailwindText: 'text-amber-500',
    tailwindBorder: 'border-amber-500'
  },
  0: {
    digit: 0,
    hex: '#14B8A6', // Turquoise Sky
    name: 'Turquoise Splash',
    nameTa: 'மரகத நீலம்',
    tailwindBg: 'bg-teal-500',
    tailwindText: 'text-teal-500',
    tailwindBorder: 'border-teal-500'
  }
};

export const TABLES_CONFIG: Record<TableNumber, TableConfig> = {
  2: {
    number: 2,
    title: 'The Dancing Twos',
    titleTa: 'ஆடும் இரண்டின் வாய்ப்பாடு',
    subtitle: 'Twin Steps & The Magic Mirror',
    subtitleTa: 'இரட்டை நடையும் மாயைக் கண்ணாடியும்',
    cycle: [2, 4, 6, 8, 0],
    cycleDigitColors: COMMON_DIGIT_COLORS,
    tensGroupsPattern: '00000, 11111, 22',
    tensGroupsPatternTa: '00000, 11111, 22 (ஐந்து பூஜ்ஜியம், ஐந்து ஒன்று, இரண்டு இரண்டு)',
    chantFullText: {
      en: 'Two, four, six, eight, zero... then a ONE in front, the same again!',
      ta: 'இரண்டு, நான்கு, ஆறு, எட்டு, பூஜ்ஜியம்... முன்னால் ஒன்று போட்டு, மீண்டும் அதுவே!'
    },
    chantBlobs: [
      { text: '2', textTa: '2', digit: 2, tens: 0 },
      { text: '4', textTa: '4', digit: 4, tens: 0 },
      { text: '6', textTa: '6', digit: 6, tens: 0 },
      { text: '8', textTa: '8', digit: 8, tens: 0 },
      { text: '0', textTa: '0', digit: 0, tens: 1 },
      { text: 'Then a ONE in front...', textTa: 'முன்னால் ஒன்று...', isChorus: true },
      { text: '12', textTa: '12', digit: 2, tens: 1 },
      { text: '14', textTa: '14', digit: 4, tens: 1 },
      { text: '16', textTa: '16', digit: 6, tens: 1 },
      { text: '18', textTa: '18', digit: 8, tens: 1 },
      { text: '20', textTa: '20', digit: 0, tens: 2 },
      { text: 'The same again: 22, 24!', textTa: 'மீண்டும் அதுவே: 22, 24!', isChorus: true }
    ],
    calculateTens: (n: number) => Math.floor((2 * n) / 10),
    calculateOnes: (n: number) => (2 * n) % 10,
    mascotTip: {
      en: 'Watch the last digit! 2, 4, 6, 8, 0 repeats like magic clockwork. The second five are twins of the first five with a 1 in front!',
      ta: 'கடைசி எண்ணைப் பாருங்கள்! 2, 4, 6, 8, 0 அப்படியே மீண்டும் வரும். முன்னால் ஒன்று சேர்த்தால் அடுத்த ஐந்து கிடைக்கும்!'
    },
    funFact: {
      en: 'Every multiple of 2 ends in 2, 4, 6, 8, or 0. That makes them all EVEN numbers!',
      ta: 'இரண்டின் அனைத்து மடங்குகளும் 2, 4, 6, 8, 0 இல் முடிகின்றன. இவை அனைத்தும் இரட்டை எண்கள்!'
    }
  },

  4: {
    number: 4,
    title: 'The Fantastic Fours',
    titleTa: 'நான்கின் வண்ண ராகம்',
    subtitle: 'Hopscotch & Rhythmic Tens',
    subtitleTa: 'குதிக்கும் தாளமும் பத்துகளின் ஒழுங்கும்',
    cycle: [4, 8, 2, 6, 0],
    cycleDigitColors: COMMON_DIGIT_COLORS,
    tensGroupsPattern: '00, 11, 222, 33, 444',
    tensGroupsPatternTa: '00, 11, 222, 33, 444 (இரட்டை, இரட்டை, மும்மை, இரட்டை, மும்மை)',
    chantFullText: {
      en: 'Four, eight, two, six, zero! Tens go double, double, triple, double, triple: one-one, two-two-two, three-three, four-four-four!',
      ta: 'நான்கு, எட்டு, இரண்டு, ஆறு, பூஜ்ஜியம்! பத்துகள் இரட்டை, இரட்டை, மும்மை... ஒன்று-ஒன்று, இரண்டு-இரண்டு-இரண்டு!'
    },
    chantBlobs: [
      { text: '4', textTa: '4', digit: 4, tens: 0 },
      { text: '8', textTa: '8', digit: 8, tens: 0 },
      { text: '2', textTa: '2', digit: 2, tens: 1 },
      { text: '6', textTa: '6', digit: 6, tens: 1 },
      { text: '0', textTa: '0', digit: 0, tens: 2 },
      { text: 'Double, double, triple!', textTa: 'இரட்டை, இரட்டை, மும்மை!', isChorus: true },
      { text: '24', textTa: '24', digit: 4, tens: 2 },
      { text: '28', textTa: '28', digit: 8, tens: 2 },
      { text: '32', textTa: '32', digit: 2, tens: 3 },
      { text: '36', textTa: '36', digit: 6, tens: 3 },
      { text: '40', textTa: '40', digit: 0, tens: 4 },
      { text: '44, 48!', textTa: '44, 48!', isChorus: true }
    ],
    calculateTens: (n: number) => Math.floor((4 * n) / 10),
    calculateOnes: (n: number) => (4 * n) % 10,
    mascotTip: {
      en: 'The cycle is 4, 8, 2, 6, 0! And listen to the tens beat: 00, 11, 222, 33, 444. Double, double, triple!',
      ta: 'கடைசி எண்கள் 4, 8, 2, 6, 0! பத்துகளின் தாளம்: இரட்டை பூஜ்ஜியம், இரட்டை ஒன்று, மூன்று இரண்டு, இரட்டை மூன்று, மூன்று நான்கு!'
    },
    funFact: {
      en: 'Multiplying by 4 is just doubling twice! Double 6 is 12, double again is 24!',
      ta: 'நான்கால் பெருக்குவது என்பது இருமுறை இரட்டிப்பதே! 6-ஐ இரட்டித்தால் 12, மீண்டும் இரட்டித்தால் 24!'
    }
  },

  6: {
    number: 6,
    title: 'The Sparkling Sixes',
    titleTa: 'ஆறின் அற்புத வட்டம்',
    subtitle: 'Wheel of Rainbow Spins',
    subtitleTa: 'வானவில் சுழற்சி சக்கரம்',
    cycle: [6, 2, 8, 4, 0],
    cycleDigitColors: COMMON_DIGIT_COLORS,
    tensGroupsPattern: '0, 11, 2, 33, 44, 5, 66, 7',
    tensGroupsPatternTa: '0, 11, 2, 33, 44, 5, 66, 7 (ஒன்று, இரட்டை, ஒன்று, இரட்டை)',
    chantFullText: {
      en: 'Six, two, eight, four, zero! Round and round we go!',
      ta: 'ஆறு, இரண்டு, எட்டு, நான்கு, பூஜ்ஜியம்! சுழன்று சுழன்று பாடுவோம்!'
    },
    chantBlobs: [
      { text: '6', textTa: '6', digit: 6, tens: 0 },
      { text: '2', textTa: '2', digit: 2, tens: 1 },
      { text: '8', textTa: '8', digit: 8, tens: 1 },
      { text: '4', textTa: '4', digit: 4, tens: 2 },
      { text: '0', textTa: '0', digit: 0, tens: 3 },
      { text: 'Round and round we go!', textTa: 'சுழன்று சுழன்று பாடுவோம்!', isChorus: true },
      { text: '36', textTa: '36', digit: 6, tens: 3 },
      { text: '42', textTa: '42', digit: 2, tens: 4 },
      { text: '48', textTa: '48', digit: 8, tens: 4 },
      { text: '54', textTa: '54', digit: 4, tens: 5 },
      { text: '60', textTa: '60', digit: 0, tens: 6 },
      { text: '66, 72!', textTa: '66, 72!', isChorus: true }
    ],
    calculateTens: (n: number) => Math.floor((6 * n) / 10),
    calculateOnes: (n: number) => (6 * n) % 10,
    mascotTip: {
      en: 'Notice the secret? The 6s cycle (6, 2, 8, 4, 0) is the 4s cycle backwards! Math is full of mirrors!',
      ta: 'ஒரு ரகசியம் தெரியுமா? ஆறின் சுழற்சி (6, 2, 8, 4, 0) நான்கின் சுழற்சியின் தலைகீழ் வரிசை! கணிதத்தில் கண்ணாடிகள் உண்டு!'
    },
    funFact: {
      en: '6 is the smallest perfect number: 1 + 2 + 3 = 6! And its multiples sparkle on guitar and honeycomb tiles.',
      ta: '6 என்பது ஒரு நிறைவெண்: 1 + 2 + 3 = 6! தேனீக்களின் கூடுகளும் அருங்கோண வடிவில் 6 பக்கங்களைக் கொண்டவை.'
    }
  },

  5: {
    number: 5,
    title: 'The Sunny Fives',
    titleTa: 'ஐந்தின் பொன் நடனம்',
    subtitle: 'Golden Marigold & Turquoise Wave',
    subtitleTa: 'தங்க மலரும் மரகத அலையும்',
    cycle: [5, 0],
    cycleDigitColors: FIVE_DIGIT_COLORS,
    tensGroupsPattern: '0, 11, 22, 33, 44, 55, 6',
    tensGroupsPatternTa: '0, 11, 22, 33, 44, 55, 6 (பூஜ்ஜியம், ஜோடிகள், ஆறு)',
    chantFullText: {
      en: 'Five, zero, five, zero, easy peasy!',
      ta: 'ஐந்து, பூஜ்ஜியம், ஐந்து, பூஜ்ஜியம்... மிக மிக எளிது!'
    },
    chantBlobs: [
      { text: '5', textTa: '5', digit: 5, tens: 0 },
      { text: '0', textTa: '0', digit: 0, tens: 1 },
      { text: '5', textTa: '5', digit: 5, tens: 1 },
      { text: '0', textTa: '0', digit: 0, tens: 2 },
      { text: 'Five, zero, easy peasy!', textTa: 'ஐந்து, பூஜ்ஜியம், மிக எளிது!', isChorus: true },
      { text: '25', textTa: '25', digit: 5, tens: 2 },
      { text: '30', textTa: '30', digit: 0, tens: 3 },
      { text: '35', textTa: '35', digit: 5, tens: 3 },
      { text: '40', textTa: '40', digit: 0, tens: 4 },
      { text: '45', textTa: '45', digit: 5, tens: 4 },
      { text: '50', textTa: '50', digit: 0, tens: 5 },
      { text: '55, 60!', textTa: '55, 60!', isChorus: true }
    ],
    calculateTens: (n: number) => Math.floor((5 * n) / 10),
    calculateOnes: (n: number) => (5 * n) % 10,
    mascotTip: {
      en: 'Just alternate between 5 and 0 like a sunny pendulum! Tens march in lovely twins: 0, 11, 22, 33, 44, 55, 6!',
      ta: '5 மற்றும் 0 என்று கடிகார ஊசல் போல மாறும்! பத்துகள் அழகிய இரட்டைகளாக வரும்: 0, 11, 22, 33, 44, 55, 6!'
    },
    funFact: {
      en: 'Look at your hand! You have 5 fingers. Clapping two hands together gives 10! The 5s table is built right into your fingers.',
      ta: 'உங்கள் கையைப் பாருங்கள்! 5 விரல்கள் உள்ளன. இரு கைகளையும் சேர்த்தால் 10! ஐந்தின் வாய்ப்பாடு உங்கள் விரல்களிலேயே உள்ளது.'
    }
  }
};

// Room furniture & decor catalog unlocked by table mastery
export const ROOM_CATALOG: RoomItem[] = [
  // 2s Unlocks
  {
    id: 'sofa_plush',
    type: 'sofa',
    name: 'Cozy Velvet Sofa',
    nameTa: 'மென்மையான பஞ்சு சோபா',
    unlockedByTable: 2,
    priceDrops: 5,
    x: 200,
    y: 320,
    scale: 1,
    color: '#EC4899'
  },
  {
    id: 'floor_lamp',
    type: 'lamp',
    name: 'Pixar Arch Floor Lamp',
    nameTa: 'வளைந்த மேஜை விளக்கு',
    unlockedByTable: 2,
    priceDrops: 4,
    x: 80,
    y: 220,
    scale: 1,
    color: '#F97316'
  },
  {
    id: 'oval_rug',
    type: 'rug',
    name: 'Rainbow Oval Rug',
    nameTa: 'வட்ட வண்ண கம்பளம்',
    unlockedByTable: 2,
    priceDrops: 3,
    x: 220,
    y: 420,
    scale: 1,
    color: '#06B6D4'
  },
  {
    id: 'wall_frame',
    type: 'frame',
    name: 'Art Gallery Frame',
    nameTa: 'சுவர் ஓவியச் சட்டம்',
    unlockedByTable: 2,
    priceDrops: 3,
    x: 180,
    y: 90,
    scale: 1,
    color: '#8B5CF6'
  },
  {
    id: 'golden_chandelier',
    type: 'chandelier',
    name: '3-Star Golden Chandelier',
    nameTa: 'தங்க சரவிளக்கு (3 நட்சத்திரம்)',
    unlockedByTable: 2,
    requiresStars: 3,
    priceDrops: 10,
    x: 280,
    y: 40,
    scale: 1,
    color: '#F59E0B'
  },

  // 4s Unlocks
  {
    id: 'monstera_plant',
    type: 'plant',
    name: 'Ceramic Monstera Pot',
    nameTa: 'பச்சை செடித் தொட்டி',
    unlockedByTable: 4,
    priceDrops: 4,
    x: 480,
    y: 310,
    scale: 1,
    color: '#10B981'
  },
  {
    id: 'window_curtains',
    type: 'curtain',
    name: 'Silk Sun Curtains',
    nameTa: 'பட்டு ஜன்னல் திரை',
    unlockedByTable: 4,
    priceDrops: 6,
    x: 360,
    y: 70,
    scale: 1,
    color: '#F97316'
  },
  {
    id: 'cuckoo_clock',
    type: 'clock',
    name: 'Whimsical Bird Clock',
    nameTa: 'பறவை சுவர் கடிகாரம்',
    unlockedByTable: 4,
    priceDrops: 4,
    x: 100,
    y: 90,
    scale: 1,
    color: '#06B6D4'
  },
  {
    id: 'magic_bonsai',
    type: 'bonsai',
    name: '3-Star Glowing Bonsai',
    nameTa: 'மின்னும் போன்சாய் மரம் (3 நட்சத்திரம்)',
    unlockedByTable: 4,
    requiresStars: 3,
    priceDrops: 12,
    x: 470,
    y: 260,
    scale: 1,
    color: '#10B981'
  },

  // 6s Unlocks
  {
    id: 'rangoli_mat',
    type: 'rangoli',
    name: 'Sacred Kolam Rangoli Mat',
    nameTa: 'அழகிய கோல / ரங்கோலி பாய்',
    unlockedByTable: 6,
    priceDrops: 6,
    x: 320,
    y: 410,
    scale: 1,
    color: '#EC4899'
  },
  {
    id: 'art_easel',
    type: 'easel',
    name: 'Studio Canvas Easel',
    nameTa: 'ஓவியக் கூடம் கேன்வாஸ்',
    unlockedByTable: 6,
    priceDrops: 5,
    x: 460,
    y: 190,
    scale: 1,
    color: '#8B5CF6'
  },
  {
    id: 'royal_peacock',
    type: 'peacock',
    name: '3-Star Royal Peacock Art',
    nameTa: 'மயில் சுவர் அலங்காரம் (3 நட்சத்திரம்)',
    unlockedByTable: 6,
    requiresStars: 3,
    priceDrops: 15,
    x: 270,
    y: 110,
    scale: 1,
    color: '#06B6D4'
  },

  // 5s Unlocks
  {
    id: 'study_desk',
    type: 'desk',
    name: 'Dream Design Desk',
    nameTa: 'வடிவமைப்பு மேஜை',
    unlockedByTable: 5,
    priceDrops: 7,
    x: 140,
    y: 290,
    scale: 1,
    color: '#F59E0B'
  },
  {
    id: 'studio_cat',
    type: 'cat',
    name: 'Sleepy Studio Ginger Cat',
    nameTa: 'அன்பு பூனைக்குட்டி',
    unlockedByTable: 5,
    priceDrops: 6,
    x: 320,
    y: 350,
    scale: 1,
    color: '#F97316'
  },
  {
    id: 'starlight_globe',
    type: 'globe',
    name: '3-Star Galaxy Projector',
    nameTa: 'விண்மீன் உலக உருண்டை (3 நட்சத்திரம்)',
    unlockedByTable: 5,
    requiresStars: 3,
    priceDrops: 15,
    x: 140,
    y: 220,
    scale: 1,
    color: '#14B8A6'
  }
];
