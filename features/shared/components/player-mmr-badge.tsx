import type { PlayerRank } from '@/features/rank/rank.types';

interface PlayerMmrBadgeProps {
  rank: PlayerRank;
  compact?: boolean;
}

export function PlayerMmrBadge({ rank, compact = false }: PlayerMmrBadgeProps) {
  const stars = rank.stars > 0 ? ` ${'★'.repeat(rank.stars)}` : '';

  return (
    <span
      aria-label={`${rank.name}${stars}`}
      className={`inline-flex min-w-0 items-center gap-1 rounded-full border border-white/70 bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-600 px-2 py-1 font-bold text-white shadow-sm ${compact ? 'text-[10px]' : 'text-xs'}`}
    >
      <span aria-hidden className="text-sm leading-none">🤖</span>
      <span className="truncate">{rank.name}{stars}</span>
    </span>
  );
}
