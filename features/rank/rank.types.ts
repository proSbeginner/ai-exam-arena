export const RANK_NAMES = [
  'Herald',
  'Guardian',
  'Crusader',
  'Archon',
  'Legend',
  'Ancient',
  'Divine',
  'Immortal',
] as const;

export type RankName = (typeof RANK_NAMES)[number];

export interface PlayerRank {
  name: RankName;
  mmr: number;
  stars: number;
}
