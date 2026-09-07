import type { QuizMode } from '@/features/quiz/quiz.types';
import { getDataSource } from './data-source';
import { mockRatingProvider } from './mock-rating.provider';
import { supabaseRatingProvider } from './supabase-rating.provider';

export interface PlayerRating {
  playerId: string;
  mode: QuizMode;
  mmr: number;
  answeredCount: number;
  correctCount: number;
  completedAttemptCount: number;
}

export interface ApplyRatingInput {
  playerId: string;
  mode: QuizMode;
  questionCount: number;
  answeredCount: number;
  correctCount: number;
  optionCounts: number[];
  attemptId: string;
}

export interface RatingProvider {
  getRating(playerId: string, mode: QuizMode): Promise<PlayerRating>;
  applyAttemptRating(input: ApplyRatingInput): Promise<PlayerRating>;
}

export function getRatingProvider(): RatingProvider {
  return getDataSource() === 'mock' ? mockRatingProvider : supabaseRatingProvider;
}
