interface PlayerRank {
  emoji: string;
  title: string;
  min?: number;
}

interface PlayerRankBadgeProps {
  rank: PlayerRank;
  compact?: boolean;
}

function getRankTone(minimumScore: number): string {
  if (minimumScore >= 9) return 'from-amber-400 via-orange-400 to-rose-500';
  if (minimumScore >= 6) return 'from-cyan-400 via-blue-500 to-indigo-600';
  if (minimumScore >= 3) return 'from-slate-300 via-slate-400 to-slate-600';
  return 'from-emerald-300 via-teal-400 to-cyan-500';
}

export function PlayerRankBadge({ rank, compact = false }: PlayerRankBadgeProps) {
  return (
    <span
      aria-label={rank.title}
      className={`inline-flex min-w-0 items-center gap-1.5 rounded-full border border-white/70 bg-gradient-to-r ${getRankTone(rank.min ?? 0)} px-2 py-1 font-bold text-white shadow-sm ${compact ? 'text-[10px]' : 'text-xs'}`}
    >
      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-black/15 text-sm leading-none" aria-hidden>
        {rank.emoji}
      </span>
      <span className="truncate drop-shadow-sm">{rank.title}</span>
    </span>
  );
}
