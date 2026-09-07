import type { QuizSetup, QuizState } from './quiz.types';

export interface SerializedQuizState {
  currentQIndex: number;
  score: number;
  streak: number;
  mood: QuizState['mood'];
  answeredMap: Record<string, string>;
  gameOver: boolean;
  summaryVisible: boolean;
  attemptStatus: QuizState['attemptStatus'];
}

export interface QuizAttemptRecord {
  id: string;
  playerId: string;
  playerName: string;
  setup: QuizSetup;
  questionIds: string[];
  state: SerializedQuizState;
  startedAt: string;
  updatedAt: string;
  completedAt?: string;
}
