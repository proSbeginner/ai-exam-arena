'use client';

import { LeaderboardLink } from './leaderboard-link';
import { RankEmblemTooltip } from './rank-emblem-tooltip';
import { PlayerRankBadge } from './player-rank-badge';
import { PlayerNameRibbon } from './player-name-ribbon';
import type { PlayerRank } from '@/features/rank/rank.types';
import { useEffect, useState } from 'react';

interface AppToolbarProps {
  playerName: string;
  selectPlayer: () => void;
  currentMmrRank?: PlayerRank | null;
  currentRank?: { emoji: string; title: string };
  showNavigation?: boolean;
}

export function AppToolbar({
  playerName,
  selectPlayer,
  currentRank,
  currentMmrRank,
  showNavigation = true,
}: AppToolbarProps) {
  const [isHidden, setIsHidden] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY <= 8 || currentScrollY < lastScrollY - 4) {
        setIsHidden(false);
      } else if (currentScrollY > lastScrollY + 4) {
        setIsHidden(true);
      }
      lastScrollY = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className={`mx-auto flex w-full max-w-lg items-center justify-between py-4 transition-transform duration-300 ${isHidden ? '-translate-y-[calc(100%+1rem)] pointer-events-none' : 'translate-y-0'}`}>
      <div className="flex min-w-0 items-center gap-2">
        {currentMmrRank ? (
          <RankEmblemTooltip variant="toolbar" rank={currentMmrRank} />
        ) : currentRank ? (
          <PlayerRankBadge rank={currentRank} />
        ) : null}
        {currentMmrRank || currentRank ? (
          <span className="max-w-28 truncate text-sm font-bold text-gray-500 sm:max-w-none">{playerName}</span>
        ) : (
          <PlayerNameRibbon playerName={playerName} />
        )}
      </div>
      {showNavigation && (
        <div className="flex shrink-0 items-center gap-2">
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
      )}
    </header>
  );
}
