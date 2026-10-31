import React, { useState, useRef, useEffect } from 'react';
import { 
  ArrowLeft, Camera, Sparkles, Trash2, Palette, Lock, Check, 
  RotateCw, ZoomIn, ZoomOut, Move
} from 'lucide-react';
import { TableNumber, Language, RoomDesign, PlacedRoomItem, RoomItem } from '../types/game';
import { ROOM_CATALOG, TABLES_CONFIG, COMMON_DIGIT_COLORS } from '../data/tablesData';
import { soundManager } from '../utils/audio';

interface MyHomeScreenProps {
  paintDrops: number;
  stars: Record<TableNumber, number>;
  roomDesign: RoomDesign;
  unlockedItems: string[];
  language: Language;
  onBack: () => void;
  onSpendDrops: (amount: number) => boolean;
  onUpdateRoomDesign: (newDesign: RoomDesign) => void;
  onUnlockItem: (itemId: string) => void;
}

const WALL_COLORS = [
  { hex: '#6366F1', name: 'Indigo Dream' },
  { hex: '#EC4899', name: 'Berry Splash' },
  { hex: '#14B8A6', name: 'Turquoise Breeze' },
  { hex: '#F59E0B', name: 'Sunny Morning' },
  { hex: '#8B5CF6', name: 'Twilight Violet' },
  { hex: '#10B981', name: 'Mint Meadow' },
  { hex: '#334155', name: 'Studio Slate' }
];

const FLOOR_COLORS = [
  { hex: '#78350F', name: 'Amber Wood' },
  { hex: '#B45309', name: 'Honey Oak' },
  { hex: '#374151', name: 'Marble Stone' },
  { hex: '#0F766E', name: 'Teal Tile' },
  { hex: '#831843', name: 'Ruby Plush' }
];

export const MyHomeScreen: React.FC<MyHomeScreenProps> = ({
  paintDrops,
  stars,
  roomDesign,
  unlockedItems,
  language,
  onBack,
  onSpendDrops,
  onUpdateRoomDesign,
  onUnlockItem,
}) => {
  const [selectedInstanceId, setSelectedInstanceId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'furniture' | 'paint' | 'items'>('furniture');
  const [selectedFilterTable, setSelectedFilterTable] = useState<TableNumber | 'all'>('all');
  const [snapshotSuccess, setSnapshotSuccess] = useState<boolean>(false);

  // Dragging state
  const isDraggingRef = useRef<boolean>(false);
  const dragStartPos = useRef<{ x: number; y: number; itemX: number; itemY: number }>({
    x: 0,
    y: 0,
    itemX: 0,
    itemY: 0,
  });
  const svgRef = useRef<SVGSVGElement | null>(null);

  // Placed items in the room
  const placedItems = roomDesign.placedItems;

  // Selected item
  const selectedPlacedItem = placedItems.find((i) => i.instanceId === selectedInstanceId);

  // Drag handlers
  const handlePointerDownItem = (e: React.PointerEvent, instanceId: string) => {
    e.stopPropagation();
    soundManager.playPop(1.1);
    setSelectedInstanceId(instanceId);
    isDraggingRef.current = true;

    const item = placedItems.find((i) => i.instanceId === instanceId);
    if (!item) return;

    dragStartPos.current = {
      x: e.clientX,
      y: e.clientY,
      itemX: item.x,
      itemY: item.y,
    };

    (e.target as Element).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDraggingRef.current || !selectedInstanceId) return;

    const dx = e.clientX - dragStartPos.current.x;
    const dy = e.clientY - dragStartPos.current.y;

    // SVG viewBox is 640 x 440. Calculate scale factor relative to SVG client rect
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const scaleX = 640 / rect.width;
    const scaleY = 440 / rect.height;

    const newX = Math.max(30, Math.min(610, dragStartPos.current.itemX + dx * scaleX));
    const newY = Math.max(50, Math.min(410, dragStartPos.current.itemY + dy * scaleY));

    const updated = placedItems.map((item) =>
      item.instanceId === selectedInstanceId ? { ...item, x: newX, y: newY } : item
    );

    onUpdateRoomDesign({
      ...roomDesign,
      placedItems: updated,
    });
  };

  const handlePointerUp = () => {
    isDraggingRef.current = false;
  };

  // Color change for selected placed item
  const handleItemColorChange = (hex: string) => {
    if (!selectedInstanceId) return;
    soundManager.playPop(1.3);
    const updated = placedItems.map((item) =>
      item.instanceId === selectedInstanceId ? { ...item, color: hex } : item
    );
    onUpdateRoomDesign({
      ...roomDesign,
      placedItems: updated,
    });
  };

  // Delete selected item
  const handleDeleteItem = () => {
    if (!selectedInstanceId) return;
    soundManager.playBoop();
    const updated = placedItems.filter((i) => i.instanceId !== selectedInstanceId);
    onUpdateRoomDesign({
      ...roomDesign,
      placedItems: updated,
    });
    setSelectedInstanceId(null);
  };

  // Buy or place item from catalog
  const handleCatalogItemClick = (item: RoomItem) => {
    const isUnlocked = unlockedItems.includes(item.id);
    const tblStars = stars[item.unlockedByTable] || 0;
    const hasEnoughStars = !item.requiresStars || tblStars >= item.requiresStars;

    if (!isUnlocked) {
      if (!hasEnoughStars) {
        soundManager.playBoop();
        return;
      }

      // Buy with paint drops
      if (paintDrops >= item.priceDrops) {
        if (onSpendDrops(item.priceDrops)) {
          soundManager.playFanfare();
          onUnlockItem(item.id);
          // Place item in room
          placeNewItem(item);
        }
      } else {
        soundManager.playBoop();
      }
    } else {
      // Already unlocked, place in room!
      soundManager.playPop(1.2);
      placeNewItem(item);
    }
  };

  const placeNewItem = (catalogItem: RoomItem) => {
    const newItem: PlacedRoomItem = {
      instanceId: `placed_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      itemId: catalogItem.id,
      x: 320 + (Math.random() * 80 - 40),
      y: 300 + (Math.random() * 40 - 20),
      scale: 1,
      color: catalogItem.color,
    };

    onUpdateRoomDesign({
      ...roomDesign,
      placedItems: [...placedItems, newItem],
    });
    setSelectedInstanceId(newItem.instanceId);
  };

  // Snapshot functionality: render SVG to canvas and download PNG
  const handleTakeSnapshot = () => {
    if (!svgRef.current) return;
    soundManager.playPop(1.5);

    try {
      const svgElement = svgRef.current;
      const svgString = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const URL = window.URL || window.webkitURL || window;
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = 1280;
        canvas.height = 880;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(image, 0, 0, 1280, 880);
          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = 'table-magic-room-snapshot.png';
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
          URL.revokeObjectURL(blobURL);

          setSnapshotSuccess(true);
          soundManager.playFanfare();
          setTimeout(() => setSnapshotSuccess(false), 3000);
        }
      };
      image.src = blobURL;
    } catch (e) {
      console.error('Failed to snapshot room:', e);
    }
  };

  // Filter catalog items
  const filteredCatalog = ROOM_CATALOG.filter((item) =>
    selectedFilterTable === 'all' ? true : item.unlockedByTable === selectedFilterTable
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fade-in select-none">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2 rounded-2xl font-bold text-sm border border-slate-700 transition active:scale-95 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{language === 'ta' ? 'முதன்மைப் பக்கம்' : 'Back to Studio'}</span>
        </button>

        <div className="flex items-center gap-3">
          {/* Paint drops wallet */}
          <div className="flex items-center gap-1.5 bg-pink-950/80 border border-pink-500/40 px-3.5 py-1.5 rounded-2xl">
            <svg viewBox="0 0 24 24" className="w-4 h-4 text-pink-400 fill-pink-500">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
            </svg>
            <span className="text-sm font-black text-pink-300">{paintDrops}</span>
            <span className="text-xs font-bold text-pink-200/80">
              {language === 'ta' ? 'துளிகள்' : 'drops'}
            </span>
          </div>

          {/* Snapshot button */}
          <button
            onClick={handleTakeSnapshot}
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-white font-bold px-4 py-2 rounded-2xl shadow-lg border border-amber-300/40 text-xs sm:text-sm active:scale-95 transition cursor-pointer"
            title="Download PNG snapshot of your room"
          >
            <Camera className="w-4 h-4" />
            <span>{language === 'ta' ? 'புகைப்படம் (PNG)' : 'Snapshot'}</span>
          </button>
        </div>
      </div>

      {snapshotSuccess && (
        <div className="bg-emerald-600/90 border border-emerald-400 text-white font-bold px-4 py-2.5 rounded-2xl shadow-xl text-center text-sm animate-bounce">
          📸 {language === 'ta' ? 'புகைப்படம் பதிவிறக்கப்பட்டது! குடும்பத்தினரிடம் காட்டுங்கள்!' : 'Snapshot saved! Show your family your masterpiece!'}
        </div>
      )}

      {/* The Drawn Room Canvas (Interactive SVG) */}
      <div className="relative bg-slate-950 rounded-3xl overflow-hidden border-4 border-indigo-500/40 shadow-2xl">
        <svg
          ref={svgRef}
          viewBox="0 0 640 440"
          className="w-full h-auto aspect-[16/11] cursor-crosshair touch-none"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={() => setSelectedInstanceId(null)}
        >
          <defs>
            {/* Wall stripe pattern */}
            <pattern id="wallStripes" width="24" height="24" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="24" stroke="#FFFFFF" strokeWidth="2" opacity="0.15" />
            </pattern>
            {/* Wall dots pattern */}
            <pattern id="wallDots" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="2.5" fill="#FFFFFF" opacity="0.18" />
            </pattern>
            {/* Floor wood plank pattern */}
            <pattern id="floorWood" width="60" height="20" patternUnits="userSpaceOnUse">
              <line x1="0" y1="20" x2="60" y2="20" stroke="#000000" strokeWidth="1" opacity="0.3" />
              <line x1="30" y1="0" x2="30" y2="20" stroke="#000000" strokeWidth="1" opacity="0.3" />
            </pattern>
            {/* Floor tile pattern */}
            <pattern id="floorTile" width="30" height="30" patternUnits="userSpaceOnUse">
              <rect width="30" height="30" fill="none" stroke="#000000" strokeWidth="1" opacity="0.25" />
            </pattern>
            {/* Sunlight beam */}
            <linearGradient id="sunBeam" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#FEF08A" stop-opacity="0.35" />
              <stop offset="100%" stop-color="#FEF08A" stop-opacity="0" />
            </linearGradient>
          </defs>

          {/* ROOM BACK WALL (Y: 0 to 280) */}
          <rect x="0" y="0" width="640" height="280" fill={roomDesign.wallColor} />
          {roomDesign.wallPattern === 'stripes' && (
            <rect x="0" y="0" width="640" height="280" fill="url(#wallStripes)" />
          )}
          {roomDesign.wallPattern === 'dots' && (
            <rect x="0" y="0" width="640" height="280" fill="url(#wallDots)" />
          )}

          {/* Wall Baseboard Trim Line */}
          <rect x="0" y="272" width="640" height="12" fill="#E2E8F0" opacity="0.8" />
          <line x1="0" y1="272" x2="640" y2="272" stroke="#94A3B8" strokeWidth="2" />

          {/* ROOM FLOOR (Y: 280 to 440) */}
          <rect x="0" y="280" width="640" height="160" fill={roomDesign.floorColor} />
          {roomDesign.floorPattern === 'wood' && (
            <rect x="0" y="280" width="640" height="160" fill="url(#floorWood)" />
          )}
          {roomDesign.floorPattern === 'tiles' && (
            <rect x="0" y="280" width="640" height="160" fill="url(#floorTile)" />
          )}

          {/* ARCHED WINDOW ON THE WALL */}
          <g transform="translate(360, 50)">
            {/* Window background sky */}
            <path d="M 0,60 L 0,110 L 110,110 L 110,60 Q 55,-10 0,60 Z" fill="#38BDF8" />
            {/* Sun in window */}
            <circle cx="85" cy="40" r="18" fill="#FDE047" />
            {/* Cloud */}
            <path d="M 15,65 Q 25,50 40,65 Q 55,50 65,65 Z" fill="#FFFFFF" opacity="0.85" />
            {/* Window Frame */}
            <path
              d="M 0,60 L 0,110 L 110,110 L 110,60 Q 55,-10 0,60 Z"
              fill="none"
              stroke="#F8FAFC"
              strokeWidth="6"
            />
            {/* Window Crossbars */}
            <line x1="55" y1="18" x2="55" y2="110" stroke="#F8FAFC" strokeWidth="4" />
            <line x1="0" y1="70" x2="110" y2="70" stroke="#F8FAFC" strokeWidth="4" />
            {/* Window Sill */}
            <rect x="-8" y="110" width="126" height="8" rx="2" fill="#F8FAFC" />
            {/* Sunlight beam casting into room */}
            <polygon points="0,118 110,118 200,260 -60,260" fill="url(#sunBeam)" />
          </g>

          {/* WALL SHELF WITH COLLECTIBLES */}
          <g transform="translate(100, 70)">
            {/* Wooden shelf board */}
            <rect x="0" y="30" width="140" height="8" rx="2" fill="#92400E" stroke="#78350F" strokeWidth="1.5" />
            <polygon points="15,38 25,38 15,55" fill="#78350F" />
            <polygon points="125,38 115,38 125,55" fill="#78350F" />
            {/* Mini potted succulent */}
            <rect x="25" y="18" width="16" height="12" rx="2" fill="#F97316" />
            <circle cx="33" cy="14" r="8" fill="#10B981" />
            {/* Trophy Star */}
            <polygon points="90,12 93,20 102,20 95,25 98,33 90,28 82,33 85,25 78,20 87,20" fill="#FBBF24" />
          </g>

          {/* PLACED ROOM ITEMS (Interactive Drag & Drop) */}
          {placedItems.map((placed) => {
            const isSelected = placed.instanceId === selectedInstanceId;

            return (
              <g
                key={placed.instanceId}
                transform={`translate(${placed.x}, ${placed.y}) scale(${placed.scale})`}
                onPointerDown={(e) => handlePointerDownItem(e, placed.instanceId)}
                className="cursor-move"
              >
                {/* Selection Ring */}
                {isSelected && (
                  <ellipse
                    cx="0"
                    cy="0"
                    rx="52"
                    ry="35"
                    fill="none"
                    stroke="#FBBF24"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                    className="animate-spin"
                  />
                )}

                {/* Render Item Graphics by Type */}
                {renderItemGraphic(placed.itemId, placed.color)}
              </g>
            );
          })}
        </svg>

        {/* Selected Item Floating Action Bar */}
        {selectedPlacedItem && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-slate-900/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border-2 border-amber-300 shadow-2xl flex items-center gap-3">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
              <Move className="w-3.5 h-3.5 text-amber-400" />
              <span>Drag to move</span>
            </span>

            {/* Recolor Item with Pattern Cycle Colors */}
            <div className="flex items-center gap-1 border-l border-r border-slate-700 px-2.5">
              {[
                '#EC4899', // Pink
                '#F97316', // Orange
                '#10B981', // Emerald
                '#06B6D4', // Cyan
                '#8B5CF6', // Purple
                '#F59E0B', // Amber
                '#14B8A6'  // Teal
              ].map((hex) => (
                <button
                  key={hex}
                  onClick={() => handleItemColorChange(hex)}
                  style={{ backgroundColor: hex }}
                  className={`w-5 h-5 rounded-full border transition active:scale-90 cursor-pointer ${
                    selectedPlacedItem.color === hex ? 'ring-2 ring-white scale-110' : 'border-white/30'
                  }`}
                  title="Recolor item with cycle color"
                />
              ))}
            </div>

            <button
              onClick={handleDeleteItem}
              className="p-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 transition cursor-pointer"
              title="Remove item from room"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Customizer Tabs: Furniture Shop, Wall & Floor Paint */}
      <div className="bg-slate-900/95 border-2 border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5">
        {/* Tab Headers */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('furniture')}
            className={`px-4 py-2 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer ${
              activeTab === 'furniture'
                ? 'bg-amber-400 text-slate-900 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {language === 'ta' ? 'அறைகலன்கள் & அலங்காரம்' : 'Furniture & Decor Shop'}
          </button>

          <button
            onClick={() => setActiveTab('paint')}
            className={`px-4 py-2 rounded-2xl font-black text-xs sm:text-sm transition cursor-pointer ${
              activeTab === 'paint'
                ? 'bg-pink-500 text-white shadow-md'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            {language === 'ta' ? 'சுவர் & தரை வண்ணங்கள்' : 'Wall & Floor Paint'}
          </button>
        </div>

        {/* TAB 1: FURNITURE CATALOG */}
        {activeTab === 'furniture' && (
          <div className="space-y-4">
            {/* Table Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400 mr-1">
                {language === 'ta' ? 'வாய்ப்பாடு வகை:' : 'Table Theme:'}
              </span>
              {(['all', 2, 4, 6, 5] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilterTable(filter)}
                  className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                    selectedFilterTable === filter
                      ? 'bg-indigo-600 text-white shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {filter === 'all'
                    ? language === 'ta'
                      ? 'அனைத்தும்'
                      : 'All'
                    : `×${filter} Table`}
                </button>
              ))}
            </div>

            {/* Catalog Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {filteredCatalog.map((item) => {
                const isUnlocked = unlockedItems.includes(item.id);
                const tableStars = stars[item.unlockedByTable] || 0;
                const meetsStarReq = !item.requiresStars || tableStars >= item.requiresStars;
                const canAfford = paintDrops >= item.priceDrops;

                return (
                  <div
                    key={item.id}
                    onClick={() => handleCatalogItemClick(item)}
                    className={`rounded-2xl p-3.5 border-2 flex flex-col justify-between transition-all cursor-pointer ${
                      isUnlocked
                        ? 'bg-slate-800/90 border-slate-700 hover:border-amber-400 hover:scale-102'
                        : meetsStarReq
                        ? 'bg-slate-850 border-pink-500/40 hover:border-pink-400'
                        : 'bg-slate-900 border-slate-800 opacity-60'
                    }`}
                  >
                    {/* Item Preview SVG Miniature */}
                    <div className="w-full h-24 bg-slate-900/80 rounded-xl flex items-center justify-center p-2 mb-2">
                      <svg viewBox="-50 -50 100 100" className="w-full h-full drop-shadow">
                        {renderItemGraphic(item.id, item.color)}
                      </svg>
                    </div>

                    {/* Item Info */}
                    <div>
                      <h5 className="font-extrabold text-xs sm:text-sm text-white truncate">
                        {language === 'ta' ? item.nameTa : item.name}
                      </h5>
                      <span className="text-[10px] text-pink-300 font-bold block">
                        ×{item.unlockedByTable} Table
                      </span>
                    </div>

                    {/* Action button / Status badge */}
                    <div className="mt-2.5 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                      {isUnlocked ? (
                        <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Place in Room
                        </span>
                      ) : !meetsStarReq ? (
                        <span className="text-[10px] font-bold text-amber-400 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Needs 3 Stars
                        </span>
                      ) : (
                        <div className="flex items-center justify-between w-full">
                          <span className="text-[11px] font-black text-pink-300 flex items-center gap-1">
                            <Sparkles className="w-3 h-3" /> {item.priceDrops} Drops
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-lg ${
                              canAfford
                                ? 'bg-pink-600 text-white'
                                : 'bg-slate-700 text-slate-400'
                            }`}
                          >
                            Buy
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: WALL & FLOOR PAINT */}
        {activeTab === 'paint' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Wall Customization */}
            <div className="space-y-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <h4 className="text-sm font-black text-amber-300">
                {language === 'ta' ? 'சுவர் வண்ணம் & வடிவங்கள்' : 'Wall Color & Patterns'}
              </h4>

              {/* Colors */}
              <div className="flex items-center gap-2 flex-wrap">
                {WALL_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    onClick={() => {
                      soundManager.playPop(1.1);
                      onUpdateRoomDesign({ ...roomDesign, wallColor: col.hex });
                    }}
                    style={{ backgroundColor: col.hex }}
                    className={`w-9 h-9 rounded-2xl border-2 transition-transform active:scale-90 cursor-pointer ${
                      roomDesign.wallColor === col.hex ? 'border-white scale-110 shadow-lg' : 'border-slate-600'
                    }`}
                    title={col.name}
                  />
                ))}
              </div>

              {/* Patterns */}
              <div className="flex items-center gap-2 pt-2">
                {[
                  { id: 'plain', label: 'Plain' },
                  { id: 'stripes', label: 'Stripes' },
                  { id: 'dots', label: 'Dots' }
                ].map((pat) => (
                  <button
                    key={pat.id}
                    onClick={() => {
                      soundManager.playPop(1.2);
                      onUpdateRoomDesign({ ...roomDesign, wallPattern: pat.id as any });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      roomDesign.wallPattern === pat.id
                        ? 'bg-pink-600 text-white border-pink-300'
                        : 'bg-slate-700 text-slate-300 border-slate-600'
                    }`}
                  >
                    {pat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Floor Customization */}
            <div className="space-y-3 bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <h4 className="text-sm font-black text-amber-300">
                {language === 'ta' ? 'தரை வண்ணம் & வடிவங்கள்' : 'Floor Color & Patterns'}
              </h4>

              {/* Colors */}
              <div className="flex items-center gap-2 flex-wrap">
                {FLOOR_COLORS.map((col) => (
                  <button
                    key={col.hex}
                    onClick={() => {
                      soundManager.playPop(1.1);
                      onUpdateRoomDesign({ ...roomDesign, floorColor: col.hex });
                    }}
                    style={{ backgroundColor: col.hex }}
                    className={`w-9 h-9 rounded-2xl border-2 transition-transform active:scale-90 cursor-pointer ${
                      roomDesign.floorColor === col.hex ? 'border-white scale-110 shadow-lg' : 'border-slate-600'
                    }`}
                    title={col.name}
                  />
                ))}
              </div>

              {/* Patterns */}
              <div className="flex items-center gap-2 pt-2">
                {[
                  { id: 'wood', label: 'Hardwood' },
                  { id: 'tiles', label: 'Tiles' }
                ].map((pat) => (
                  <button
                    key={pat.id}
                    onClick={() => {
                      soundManager.playPop(1.2);
                      onUpdateRoomDesign({ ...roomDesign, floorPattern: pat.id as any });
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      roomDesign.floorPattern === pat.id
                        ? 'bg-pink-600 text-white border-pink-300'
                        : 'bg-slate-700 text-slate-300 border-slate-600'
                    }`}
                  >
                    {pat.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Render crisp custom Pixar-style vector furniture graphics
function renderItemGraphic(itemId: string, color: string) {
  switch (itemId) {
    case 'sofa_plush':
      return (
        <g>
          {/* Wooden sofa legs */}
          <rect x="-38" y="18" width="6" height="12" rx="2" fill="#78350F" />
          <rect x="32" y="18" width="6" height="12" rx="2" fill="#78350F" />
          {/* Main cushion seat */}
          <rect x="-42" y="-5" width="84" height="24" rx="8" fill={color} stroke="#1E293B" strokeWidth="2" />
          {/* Backrest */}
          <rect x="-38" y="-28" width="76" height="26" rx="10" fill={color} stroke="#1E293B" strokeWidth="2" />
          {/* Armrests */}
          <rect x="-46" y="-18" width="12" height="34" rx="6" fill={color} stroke="#1E293B" strokeWidth="2" />
          <rect x="34" y="-18" width="12" height="34" rx="6" fill={color} stroke="#1E293B" strokeWidth="2" />
          {/* Fluffy throw pillow */}
          <rect x="-18" y="-8" width="16" height="16" rx="4" fill="#FBBF24" transform="rotate(-15)" />
        </g>
      );

    case 'floor_lamp':
      return (
        <g>
          {/* Heavy base */}
          <ellipse cx="0" cy="40" rx="16" ry="6" fill="#334155" stroke="#0F172A" strokeWidth="1.5" />
          {/* Sleek arched pole */}
          <path d="M 0,40 Q -10,0 12,-35" stroke="#CBD5E1" strokeWidth="3" fill="none" />
          {/* Lamp shade */}
          <polygon points="4,-35 28,-35 34,-15 -2,-15" fill={color} stroke="#0F172A" strokeWidth="2" />
          {/* Warm glow */}
          <polygon points="-6,-13 38,-13 55,30 -25,30" fill="#FEF08A" opacity="0.35" />
        </g>
      );

    case 'oval_rug':
      return (
        <g>
          <ellipse cx="0" cy="0" rx="48" ry="24" fill={color} stroke="#FFFFFF" strokeWidth="3" strokeDasharray="6 3" />
          <ellipse cx="0" cy="0" rx="34" ry="16" fill="none" stroke="#FBBF24" strokeWidth="2" />
          <ellipse cx="0" cy="0" rx="20" ry="9" fill={color} opacity="0.7" />
        </g>
      );

    case 'wall_frame':
      return (
        <g>
          <rect x="-24" y="-20" width="48" height="40" rx="3" fill="#B45309" stroke="#78350F" strokeWidth="3" />
          <rect x="-18" y="-14" width="36" height="28" fill="#F8FAFC" />
          {/* Inside art: cute sun and mountain */}
          <circle cx="-6" cy="-4" r="5" fill={color} />
          <polygon points="-16,14 -4,4 8,14" fill="#10B981" />
          <polygon points="0,14 8,7 16,14" fill="#059669" />
        </g>
      );

    case 'golden_chandelier':
      return (
        <g>
          {/* Golden suspension chain */}
          <line x1="0" y1="-30" x2="0" y2="-10" stroke="#F59E0B" strokeWidth="2" />
          {/* Central golden body */}
          <circle cx="0" cy="-6" r="8" fill="#FBBF24" stroke="#D97706" strokeWidth="2" />
          {/* Arched arms with glowing bulbs */}
          <path d="M -24,4 Q -16,-6 0,-6 Q 16,-6 24,4" stroke="#F59E0B" strokeWidth="2.5" fill="none" />
          {/* Candle lights */}
          <circle cx="-24" cy="2" r="4" fill="#FEF08A" />
          <circle cx="24" cy="2" r="4" fill="#FEF08A" />
          <circle cx="0" cy="4" r="5" fill="#FEF08A" />
          {/* Crystals */}
          <polygon points="-24,6 -22,14 -26,14" fill="#67E8F9" />
          <polygon points="24,6 26,14 22,14" fill="#67E8F9" />
        </g>
      );

    case 'monstera_plant':
      return (
        <g>
          {/* Ceramic pot */}
          <polygon points="-14,35 14,35 18,15 -18,15" fill="#F97316" stroke="#C2410C" strokeWidth="2" />
          <rect x="-20" y="12" width="40" height="5" rx="2" fill="#EA580C" />
          {/* Monstera leaves */}
          <path d="M 0,14 Q -20,-10 -15,-28 Q -2,-20 0,14 Z" fill={color} stroke="#065F46" strokeWidth="1.5" />
          <path d="M 0,14 Q 22,-8 18,-26 Q 4,-18 0,14 Z" fill={color} stroke="#065F46" strokeWidth="1.5" />
          <path d="M 0,14 Q 0,-25 0,-35 Q 8,-20 0,14 Z" fill="#34D399" stroke="#065F46" strokeWidth="1.5" />
        </g>
      );

    case 'window_curtains':
      return (
        <g>
          {/* Curtain rod */}
          <line x1="-35" y1="-25" x2="35" y2="-25" stroke="#FBBF24" strokeWidth="3" />
          {/* Left drape */}
          <path d="M -30,-25 Q -18,5 -28,30 L -36,30 Z" fill={color} stroke="#1E293B" strokeWidth="1.5" />
          {/* Right drape */}
          <path d="M 30,-25 Q 18,5 28,30 L 36,30 Z" fill={color} stroke="#1E293B" strokeWidth="1.5" />
        </g>
      );

    case 'cuckoo_clock':
      return (
        <g>
          {/* Roof */}
          <polygon points="0,-32 -20,-16 20,-16" fill="#B45309" stroke="#78350F" strokeWidth="2" />
          {/* House body */}
          <rect x="-18" y="-16" width="36" height="38" rx="3" fill="#D97706" stroke="#78350F" strokeWidth="2" />
          {/* Clock face */}
          <circle cx="0" cy="5" r="10" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          <line x1="0" y1="5" x2="0" y2="0" stroke="#0F172A" strokeWidth="1.5" />
          <line x1="0" y1="5" x2="4" y2="5" stroke="#0F172A" strokeWidth="1.5" />
          {/* Pendulum */}
          <line x1="0" y1="22" x2="0" y2="34" stroke="#F59E0B" strokeWidth="1.5" />
          <circle cx="0" cy="35" r="3" fill="#F59E0B" />
        </g>
      );

    case 'magic_bonsai':
      return (
        <g>
          {/* Planter */}
          <polygon points="-20,28 20,28 24,14 -24,14" fill="#334155" stroke="#0F172A" strokeWidth="2" />
          {/* Gnarled trunk */}
          <path d="M -4,15 Q -10,0 4,-12 Q 10,-20 2,-28" stroke="#78350F" strokeWidth="4.5" fill="none" />
          {/* Cloud foliage */}
          <circle cx="-12" cy="-15" r="10" fill={color} />
          <circle cx="8" cy="-18" r="12" fill={color} />
          <circle cx="2" cy="-30" r="14" fill="#34D399" />
          {/* Sparkles */}
          <circle cx="-5" cy="-28" r="2" fill="#FEF08A" />
          <circle cx="12" cy="-14" r="2" fill="#FEF08A" />
        </g>
      );

    case 'rangoli_mat':
      return (
        <g>
          {/* Beautiful Kolam Rangoli Mat */}
          <ellipse cx="0" cy="0" rx="42" ry="22" fill={color} stroke="#FFFFFF" strokeWidth="2" />
          {/* Lotus petal geometric mandala lines */}
          <ellipse cx="0" cy="0" rx="30" ry="15" fill="none" stroke="#FEF08A" strokeWidth="2" strokeDasharray="4 2" />
          <path d="M 0,-18 Q 12,0 0,18 Q -12,0 0,-18 Z" fill="#FFFFFF" opacity="0.6" />
          <path d="M -30,0 Q 0,10 30,0 Q 0,-10 -30,0 Z" fill="#FFFFFF" opacity="0.6" />
          <circle cx="0" cy="0" r="5" fill="#F59E0B" />
        </g>
      );

    case 'art_easel':
      return (
        <g>
          {/* Three wooden legs */}
          <line x1="0" y1="-35" x2="-22" y2="40" stroke="#B45309" strokeWidth="3" />
          <line x1="0" y1="-35" x2="22" y2="40" stroke="#B45309" strokeWidth="3" />
          <line x1="0" y1="-35" x2="0" y2="38" stroke="#78350F" strokeWidth="2.5" />
          {/* Cross shelf */}
          <line x1="-24" y1="12" x2="24" y2="12" stroke="#78350F" strokeWidth="3" />
          {/* Canvas */}
          <rect x="-18" y="-18" width="36" height="28" rx="2" fill="#FFFFFF" stroke="#0F172A" strokeWidth="1.5" />
          {/* Colorful painting on canvas */}
          <circle cx="0" cy="-4" r="7" fill={color} />
        </g>
      );

    case 'royal_peacock':
      return (
        <g>
          {/* Peacock plume feathers */}
          <path d="M 0,0 Q -25,-30 -30,-40 Q -10,-25 0,0 Z" fill="#06B6D4" />
          <path d="M 0,0 Q 0,-40 0,-48 Q 5,-25 0,0 Z" fill="#10B981" />
          <path d="M 0,0 Q 25,-30 30,-40 Q 10,-25 0,0 Z" fill="#3B82F6" />
          {/* Eyes of feather */}
          <circle cx="-25" cy="-34" r="3.5" fill="#FBBF24" />
          <circle cx="0" cy="-40" r="3.5" fill="#FBBF24" />
          <circle cx="25" cy="-34" r="3.5" fill="#FBBF24" />
          {/* Body */}
          <ellipse cx="0" cy="2" rx="7" ry="14" fill="#1D4ED8" />
          <circle cx="0" cy="-10" r="5" fill="#1D4ED8" />
          <polygon points="0,-10 0,-14 6,-11" fill="#F59E0B" />
        </g>
      );

    case 'study_desk':
      return (
        <g>
          {/* Desk tabletop */}
          <rect x="-40" y="5" width="80" height="8" rx="2" fill="#D97706" stroke="#78350F" strokeWidth="2" />
          {/* Legs */}
          <line x1="-34" y1="13" x2="-34" y2="38" stroke="#475569" strokeWidth="3" />
          <line x1="34" y1="13" x2="34" y2="38" stroke="#475569" strokeWidth="3" />
          {/* Drawers box */}
          <rect x="14" y="13" width="22" height="18" fill="#B45309" stroke="#78350F" strokeWidth="1.5" />
          <circle cx="25" cy="22" r="1.5" fill="#FEF08A" />
          {/* Pencil cup & laptop/book */}
          <rect x="-24" y="-3" width="16" height="8" rx="1" fill={color} />
          <rect x="-3" y="-5" width="8" height="10" rx="1" fill="#38BDF8" />
        </g>
      );

    case 'studio_cat':
      return (
        <g>
          {/* Tail */}
          <path d="M 15,10 Q 25,5 24,-5" stroke="#F97316" strokeWidth="3" fill="none" strokeLinecap="round" />
          {/* Sleeping curled body */}
          <ellipse cx="0" cy="10" rx="18" ry="12" fill={color} stroke="#C2410C" strokeWidth="1.5" />
          {/* Head */}
          <circle cx="-12" cy="4" r="8" fill={color} stroke="#C2410C" strokeWidth="1.5" />
          {/* Ears */}
          <polygon points="-16,-2 -18,4 -13,1" fill="#EA580C" />
          <polygon points="-8,-2 -6,4 -11,1" fill="#EA580C" />
          {/* Sleeping eyes */}
          <path d="M -16,4 Q -14,6 -12,4" stroke="#78350F" strokeWidth="1" fill="none" />
          <path d="M -10,4 Q -8,6 -6,4" stroke="#78350F" strokeWidth="1" fill="none" />
        </g>
      );

    case 'starlight_globe':
      return (
        <g>
          {/* Base */}
          <ellipse cx="0" cy="20" rx="14" ry="5" fill="#334155" stroke="#0F172A" strokeWidth="1.5" />
          <line x1="0" y1="20" x2="0" y2="6" stroke="#94A3B8" strokeWidth="3" />
          {/* Spherical glass projector globe */}
          <circle cx="0" cy="-6" r="18" fill="#1E1B4B" stroke="#818CF8" strokeWidth="2" />
          {/* Glowing galaxy nebula inside */}
          <ellipse cx="0" cy="-6" rx="10" ry="5" fill={color} opacity="0.8" transform="rotate(-25)" />
          <circle cx="-4" cy="-8" r="1.5" fill="#FFFFFF" />
          <circle cx="6" cy="-4" r="2" fill="#FEF08A" />
          <circle cx="2" cy="-11" r="1" fill="#FFFFFF" />
        </g>
      );

    default:
      return <circle cx="0" cy="0" r="15" fill={color} stroke="#FFFFFF" strokeWidth="2" />;
  }
}
