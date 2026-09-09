import Image from 'next/image';

import { getRankAsset } from '@/features/rank/rank.assets';
import type { PlayerRank } from '@/features/rank/rank.types';

interface RankEmblemBadgeProps {
  rank: PlayerRank;
  compact?: boolean;
}

export function RankEmblemBadge({ rank, compact = false }: RankEmblemBadgeProps) {
  const stars = rank.stars > 0 ? '★'.repeat(rank.stars) : '';

  return (
    <span
      aria-label={`${rank.name}${stars ? ` ${stars}` : ''}`}
      className={`inline-flex min-w-0 w-[100px] items-center gap-1 rounded-full border border-white/70 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-600 px-2 py-1 font-bold text-white shadow-sm ${compact ? 'text-[10px]' : 'text-xs'}`}
    >
      <Image
        src={getRankAsset(rank.name)}
        alt=""
        width={compact ? 22 : 28}
        height={compact ? 22 : 28}
        className="size-6 shrink-0 object-contain"
        aria-hidden
      />
      <span className="flex min-w-0 flex-col items-start gap-0 leading-tight">
        {stars && <span className="text-amber-200">{stars}</span>}
        <span className="truncate">{rank.name}</span>
      </span>
    </span>
  );
}
