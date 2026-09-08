import { BrandTitle } from '@/features/shared/components/brand-title';
import { LeaderboardLink } from '@/features/shared/components/leaderboard-link';
import { RankEmblemTooltip } from '@/features/shared/components/rank-emblem-tooltip';
import type { PlayerRank } from '@/features/rank/rank.types';
import { PlayerRankBadge } from '@/features/shared/components/player-rank-badge';

interface QuizHeaderProps {
  selectPlayer: () => void;
  currentMmrRank?: PlayerRank | null;
  currentRank: { emoji: string; title: string };
  embedded?: boolean;
}

export function QuizHeader({ selectPlayer, currentRank, currentMmrRank, embedded = false }: QuizHeaderProps) {
  return (
    <header className={`mx-auto flex w-full max-w-lg items-center justify-between ${embedded ? '' : 'py-4'}`}>
      <div className="flex items-center gap-2">
        <h1 className="whitespace-nowrap bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-base font-bold text-transparent sm:text-xl">
          <BrandTitle />
        </h1>
        <>{currentMmrRank ? <RankEmblemTooltip rank={currentMmrRank} /> : <PlayerRankBadge rank={currentRank} />}</>
      </div>
      <div className="flex items-center gap-2">
        <LeaderboardLink inline variant="header" />
        <span aria-hidden className="text-xs text-gray-300">|</span>
        <button
          type="button"
          onClick={selectPlayer}
          className="cursor-pointer text-xs text-gray-400 transition-colors hover:text-pink-500"
        >
          เลือกผู้เล่น
        </button>
      </div>
    </header>
  );
}
