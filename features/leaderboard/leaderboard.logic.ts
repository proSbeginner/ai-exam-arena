import { getRankFromMmr } from '@/features/rank/rank.logic';
import type { CurrentAttemptSummary, LeaderboardEntry } from './leaderboard.types';
import type { QuizAttemptRecord } from '@/features/quiz/quiz-attempt.types';

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

export function addRankToLeaderboardEntry(entry: LeaderboardEntry, mmr: number): LeaderboardEntry {
  return { ...entry, mmr, rank: getRankFromMmr(mmr) };
}

export function buildCurrentAttemptSummary(input: {
  attemptId: string;
  mode: CurrentAttemptSummary['mode'];
  questionCount: number;
  attemptStatus: CurrentAttemptSummary['attemptStatus'];
}): CurrentAttemptSummary {
  return input;
}

export function buildCurrentAttemptEntry(attempt: QuizAttemptRecord): LeaderboardEntry | null {
  if (attempt.state.attemptStatus === 'active') return null;

  const answeredCount = Object.keys(attempt.state.answeredMap).length;
  if (answeredCount === 0) return null;

  const correctCount = attempt.state.score;
  return {
    attemptId: attempt.id,
    playerId: attempt.playerId,
    playerName: attempt.playerName,
    mode: attempt.setup.mode,
    answeredCount,
    questionCount: attempt.questionIds.length,
    correctCount,
    accuracy: Number(((correctCount / answeredCount) * 100).toFixed(2)),
    attemptStatus: attempt.state.attemptStatus,
    completedAt: attempt.completedAt ?? attempt.updatedAt,
  };
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
