'use client';

import { useEffect, useState } from 'react';

import type { QuizMode } from '@/features/quiz/quiz.types';

import { getLeaderboard } from './services/leaderboard.api';
import type { LeaderboardEntry } from './leaderboard.types';

export function useLeaderboard(mode: QuizMode, playerId: string | null) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCurrentRequest = true;

    void getLeaderboard(mode, playerId ?? undefined)
      .then((nextEntries) => {
        if (isCurrentRequest) setEntries(nextEntries);
      })
      .catch(() => {
        if (isCurrentRequest) setError('ไม่สามารถโหลด leaderboard ได้ในขณะนี้');
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [mode, playerId]);

  return { entries, error, isLoading };
}
