import type { RankName } from './rank.types';

export const RANK_ASSETS: Record<RankName, string> = {
  Herald: '/images/ranks/herald.png',
  Guardian: '/images/ranks/guardian.png',
  Crusader: '/images/ranks/crusader.png',
  Archon: '/images/ranks/archon.png',
  Legend: '/images/ranks/legend.png',
  Ancient: '/images/ranks/ancient.png',
  Divine: '/images/ranks/divine.png',
  Immortal: '/images/ranks/immortal.png',
};

export function getRankAsset(rank: RankName): string {
  return RANK_ASSETS[rank];
}
