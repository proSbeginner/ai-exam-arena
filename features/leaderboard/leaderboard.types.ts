import type { PlayerRank } from '@/features/rank/rank.types';
import type { QuizMode } from '@/features/quiz/quiz.types';

export type LeaderboardAttemptStatus = 'completed' | 'abandoned';

export type CurrentAttemptStatus = 'active' | 'completed' | 'abandoned';

export interface CurrentAttemptSummary {
  attemptId: string;
  mode: QuizMode;
  questionCount: number;
  attemptStatus: CurrentAttemptStatus;
}

export interface LeaderboardData {
  entries: LeaderboardEntry[];
  currentAttempt: CurrentAttemptSummary | null;
}

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
