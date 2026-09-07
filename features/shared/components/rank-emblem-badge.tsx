import Image from 'next/image';

import { getRankAsset } from '@/features/rank/rank.assets';
import type { PlayerRank } from '@/features/rank/rank.types';

interface RankEmblemBadgeProps {
  rank: PlayerRank;
  compact?: boolean;
}

export function RankEmblemBadge({ rank, compact = false }: RankEmblemBadgeProps) {
  const stars = rank.stars > 0 ? ` ${'★'.repeat(rank.stars)}` : '';

  return (
    <span
      aria-label={`${rank.name}${stars}`}
      className={`inline-flex min-w-0 items-center gap-1 rounded-full border border-white/70 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-600 px-2 py-1 font-bold text-white shadow-sm ${compact ? 'text-[10px]' : 'text-xs'}`}
    >
      <Image
        src={getRankAsset(rank.name)}
        alt=""
        width={compact ? 22 : 28}
        height={compact ? 22 : 28}
        className="size-6 shrink-0 object-contain"
        aria-hidden
      />
      <span className="truncate">{rank.name}{stars}</span>
    </span>
  );
}
