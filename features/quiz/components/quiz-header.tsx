import { BrandTitle } from '@/features/shared/components/brand-title';
import { LeaderboardLink } from '@/features/shared/components/leaderboard-link';
import { PlayerRankBadge } from '@/features/shared/components/player-rank-badge';

interface QuizHeaderProps {
  selectPlayer: () => void;
  currentRank: { emoji: string; title: string };
}

export function QuizHeader({ selectPlayer, currentRank }: QuizHeaderProps) {
  return (
    <header className="mx-auto flex w-full max-w-lg items-center justify-between py-4">
      <div className="flex items-center gap-2">
        <h1 className="bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-xl font-bold text-transparent">
          <BrandTitle />
        </h1>
        <PlayerRankBadge rank={currentRank} />
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
