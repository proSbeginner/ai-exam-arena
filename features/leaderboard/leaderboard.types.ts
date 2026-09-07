import type { QuizMode } from '@/features/quiz/quiz.types';

export type LeaderboardAttemptStatus = 'completed' | 'abandoned';

export interface LeaderboardEntry {
  playerId: string;
  playerName: string;
  mode: QuizMode;
  answeredCount: number;
  correctCount: number;
  accuracy: number;
  attemptStatus: LeaderboardAttemptStatus;
  completedAt: string;
}
