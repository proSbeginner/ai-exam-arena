import { calculateRatingChange, getRankFromMmr } from '@/features/rank/rank.logic';
import type { RatingProvider, PlayerRating, ApplyRatingInput } from './rating.provider';

const ratings = new Map<string, PlayerRating>();
const ratedAttempts = new Set<string>();

function getKey(playerId: string, mode: ApplyRatingInput['mode']): string {
  return `${playerId}:${mode}`;
}

function createDefaultRating(playerId: string, mode: ApplyRatingInput['mode']): PlayerRating {
  return { playerId, mode, mmr: 0, answeredCount: 0, correctCount: 0, completedAttemptCount: 0 };
}

async function getRating(playerId: string, mode: ApplyRatingInput['mode']): Promise<PlayerRating> {
  return ratings.get(getKey(playerId, mode)) ?? createDefaultRating(playerId, mode);
}

async function applyAttemptRating(input: ApplyRatingInput): Promise<PlayerRating> {
  const key = getKey(input.playerId, input.mode);
  const current = ratings.get(key) ?? createDefaultRating(input.playerId, input.mode);
  if (ratedAttempts.has(input.attemptId)) return current;

  const next: PlayerRating = {
    ...current,
    mmr: Math.max(0, current.mmr + calculateRatingChange(input.correctCount, input.questionCount, input.answeredCount, input.optionCounts, input.maxStreak)),
    answeredCount: current.answeredCount + input.answeredCount,
    correctCount: current.correctCount + input.correctCount,
    completedAttemptCount: current.completedAttemptCount + (input.answeredCount === input.questionCount ? 1 : 0),
  };
  ratings.set(key, next);
  ratedAttempts.add(input.attemptId);
  void getRankFromMmr(next.mmr);
  return next;
}

export const mockRatingProvider: RatingProvider = { getRating, applyAttemptRating };
