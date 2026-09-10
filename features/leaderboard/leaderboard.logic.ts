import type { LeaderboardEntry } from './leaderboard.types';

function completionPriority(status: LeaderboardEntry['attemptStatus']): number {
  return status === 'completed' ? 0 : 1;
}

function compareLeaderboardEntries(left: LeaderboardEntry, right: LeaderboardEntry): number {
  return (
    completionPriority(left.attemptStatus) - completionPriority(right.attemptStatus)
    || right.answeredCount - left.answeredCount
    || right.accuracy - left.accuracy
    || right.correctCount - left.correctCount
    || left.completedAt.localeCompare(right.completedAt)
  );
}

export function filterLeaderboardEntries(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return entries.filter((entry) => entry.answeredCount > 0);
}

export function getBestAttemptsPerPlayer(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  const bestAttempts = new Map<string, LeaderboardEntry>();

  for (const entry of entries) {
    const key = entry.playerId + ':' + entry.mode;
    const currentBest = bestAttempts.get(key);
    if (!currentBest || compareLeaderboardEntries(entry, currentBest) < 0) {
      bestAttempts.set(key, entry);
    }
  }

  return [...bestAttempts.values()];
}

export function sortLeaderboard(entries: LeaderboardEntry[]): LeaderboardEntry[] {
  return [...entries].sort(compareLeaderboardEntries);
}

export function getPlayerRank(entries: LeaderboardEntry[], playerId: string): number | null {
  const rank = sortLeaderboard(entries).findIndex((entry) => entry.playerId === playerId);
  return rank === -1 ? null : rank + 1;
}
