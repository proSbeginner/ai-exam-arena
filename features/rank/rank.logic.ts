import {
  IMMORTAL_MMR,
  MAX_RATING_CHANGE_PER_ATTEMPT,
  RANK_STAR_MMR,
  RANK_TIERS,
  STREAK_MMR_BONUS_TIERS,
} from './rank.constants';
import type { PlayerRank } from './rank.types';

export function getRankFromMmr(mmr: number): PlayerRank {
  const normalizedMmr = Math.max(0, Math.round(mmr));
  if (normalizedMmr >= IMMORTAL_MMR) {
    return { name: 'Immortal', mmr: normalizedMmr, stars: 0 };
  }

  const tier = [...RANK_TIERS].reverse().find((item) => normalizedMmr >= item.minMmr) ?? RANK_TIERS[0];
  return {
    name: tier.name,
    mmr: normalizedMmr,
    stars: Math.floor((normalizedMmr - tier.minMmr) / RANK_STAR_MMR) + 1,
  };
}

export function calculateRatingChange(
  correctCount: number,
  questionCount: number,
  answeredCount: number,
  optionCounts: number[],
  maxStreak = 0,
): number {
  if (questionCount <= 0 || answeredCount <= 0 || optionCounts.length === 0) return 0;

  const accuracy = Math.max(0, Math.min(1, correctCount / questionCount));
  const randomBaseline = optionCounts.reduce((sum, count) => sum + (count > 0 ? 1 / count : 0), 0) / optionCounts.length;
  const performance = (accuracy - randomBaseline) / (1 - randomBaseline);
  const confidence = Math.min(answeredCount / 20, 1);
  const change = MAX_RATING_CHANGE_PER_ATTEMPT * performance * confidence;

  const streakBonus = [...STREAK_MMR_BONUS_TIERS].reverse().find((tier) => maxStreak >= tier.minStreak)?.bonus ?? 0;
  return Math.round(Math.max(-MAX_RATING_CHANGE_PER_ATTEMPT, Math.min(MAX_RATING_CHANGE_PER_ATTEMPT, change + streakBonus)));
}
