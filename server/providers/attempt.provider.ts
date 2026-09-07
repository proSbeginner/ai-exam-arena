import type { QuizAttemptRecord } from '@/features/quiz/quiz-attempt.types';
import type { QuizSetup, QuizState } from '@/features/quiz/quiz.types';
import { getDataSource } from './data-source';
import { mockAttemptProvider } from '@/server/providers/mock-attempt.provider';
import { supabaseAttemptProvider } from '@/server/providers/supabase-attempt.provider';

export interface AttemptProvider {
  getAttempt(playerId: string, mode: QuizSetup['mode']): Promise<QuizAttemptRecord | null>;
  getAttemptById(attemptId: string): Promise<QuizAttemptRecord | null>;
  createAttempt(playerId: string, playerName: string, setup: QuizSetup, questionIds: string[], state: QuizState): Promise<QuizAttemptRecord>;
  updateAttempt(attemptId: string, state: QuizState): Promise<QuizAttemptRecord>;
  submitAnswer(attemptId: string, questionId: string, selectedOptionId: string): Promise<{ attempt: QuizAttemptRecord; isCorrect: boolean }>;
  discardAttempt(attemptId: string): Promise<void>;
}

export function getAttemptProvider(): AttemptProvider {
  return getDataSource() === 'mock' ? mockAttemptProvider : supabaseAttemptProvider;
}
