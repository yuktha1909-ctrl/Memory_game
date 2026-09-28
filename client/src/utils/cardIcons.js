/**
 * Card icon and asset repository for MEMORY MATCH
 * Contains at least 25 unique items with themed visual accents
 */
export const CARD_ITEMS = [
  { id: 'galaxy', symbol: '🌌', label: 'Cosmos', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' },
  { id: 'rocket', symbol: '🚀', label: 'Rocket', color: '#ec4899', glow: 'rgba(236, 72, 153, 0.4)' },
  { id: 'saturn', symbol: '🪐', label: 'Saturn', color: '#eab308', glow: 'rgba(234, 179, 8, 0.4)' },
  { id: 'crystal', symbol: '💎', label: 'Gemstone', color: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' },
  { id: 'alien', symbol: '👾', label: 'Invader', color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
  { id: 'sword', symbol: '⚔️', label: 'Blades', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.4)' },
  { id: 'fire', symbol: '🔥', label: 'Inferno', color: '#f97316', glow: 'rgba(249, 115, 22, 0.4)' },
  { id: 'lightning', symbol: '⚡', label: 'Volt', color: '#facc15', glow: 'rgba(250, 204, 21, 0.4)' },
  { id: 'crown', symbol: '👑', label: 'Crown', color: '#fbbf24', glow: 'rgba(251, 191, 36, 0.4)' },
  { id: 'dragon', symbol: '🐲', label: 'Dragon', color: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)' },
  { id: 'telescope', symbol: '🔭', label: 'Optics', color: '#8b5cf6', glow: 'rgba(139, 92, 246, 0.4)' },
  { id: 'shield', symbol: '🛡️', label: 'Aegis', color: '#0ea5e9', glow: 'rgba(14, 165, 233, 0.4)' },
  { id: 'star', symbol: '⭐', label: 'Starlight', color: '#eab308', glow: 'rgba(234, 179, 8, 0.4)' },
  { id: 'magic', symbol: '🔮', label: 'Oracle', color: '#c084fc', glow: 'rgba(192, 132, 252, 0.4)' },
  { id: 'compass', symbol: '🧭', label: 'Compass', color: '#14b8a6', glow: 'rgba(20, 184, 166, 0.4)' },
  { id: 'hourglass', symbol: '⏳', label: 'Time', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
  { id: 'portal', symbol: '🌀', label: 'Vortex', color: '#6366f1', glow: 'rgba(99, 102, 241, 0.4)' },
  { id: 'potion', symbol: '🧪', label: 'Elixir', color: '#10b981', glow: 'rgba(16, 185, 129, 0.4)' },
  { id: 'heart', symbol: '💖', label: 'Vitality', color: '#f43f5e', glow: 'rgba(244, 63, 94, 0.4)' },
  { id: 'sun', symbol: '☀️', label: 'Solar', color: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
  { id: 'moon', symbol: '🌙', label: 'Lunar', color: '#38bdf8', glow: 'rgba(56, 189, 248, 0.4)' },
  { id: 'dice', symbol: '🎲', label: 'Chance', color: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' },
  { id: 'ufo', symbol: '🛸', label: 'Saucer', color: '#00f5ff', glow: 'rgba(0, 245, 255, 0.4)' },
  { id: 'ghost', symbol: '👻', label: 'Specter', color: '#e2e8f0', glow: 'rgba(226, 232, 240, 0.4)' },
  { id: 'clover', symbol: '🍀', label: 'Fortune', color: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)' }
];

/**
 * Generate a randomized deck of cards for a given number of pairs
 */
export function generateDeck(numPairs) {
  // Fisher-Yates shuffle items to pick random symbols
  const shuffledItems = [...CARD_ITEMS].sort(() => Math.random() - 0.5);
  const selectedItems = shuffledItems.slice(0, numPairs);

  const deck = [];
  selectedItems.forEach((item, index) => {
    // Add two cards for each pair
    deck.push({
      uniqueId: `${item.id}-a`,
      matchId: item.id,
      symbol: item.symbol,
      label: item.label,
      color: item.color,
      glow: item.glow
    });
    deck.push({
      uniqueId: `${item.id}-b`,
      matchId: item.id,
      symbol: item.symbol,
      label: item.label,
      color: item.color,
      glow: item.glow
    });
  });

  // Shuffle the final deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
}
