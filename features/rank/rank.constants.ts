import type { RankName } from './rank.types';

export const RANK_TIER_MMR = 300;
export const RANK_STAR_MMR = 60;
export const IMMORTAL_MMR = RANK_TIER_MMR * 7;
export const MAX_RATING_CHANGE_PER_ATTEMPT = 300;

export const RANK_TIERS: ReadonlyArray<{ name: Exclude<RankName, 'Immortal'>; minMmr: number }> = [
  { name: 'Herald', minMmr: 0 },
  { name: 'Guardian', minMmr: 300 },
  { name: 'Crusader', minMmr: 600 },
  { name: 'Archon', minMmr: 900 },
  { name: 'Legend', minMmr: 1200 },
  { name: 'Ancient', minMmr: 1500 },
  { name: 'Divine', minMmr: 1800 },
];
