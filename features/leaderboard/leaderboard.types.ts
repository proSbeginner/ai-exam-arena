import type { PlayerRank } from '@/features/rank/rank.types';
import type { QuizMode } from '@/features/quiz/quiz.types';

export type LeaderboardAttemptStatus = 'completed' | 'abandoned';

export interface LeaderboardEntry {
  attemptId?: string;
  playerId: string;
  playerName: string;
  mode: QuizMode;
  answeredCount: number;
  questionCount: number;
  correctCount: number;
  accuracy: number;
  attemptStatus: LeaderboardAttemptStatus;
  mmr?: number;
  rank?: PlayerRank;
  completedAt: string;
}
