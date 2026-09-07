import { createMockAttempt, discardMockAttempt, getMockAttempt, updateMockAttempt } from '@/mock-api/quiz/mock-attempts';
import type { QuizAttemptRecord } from '@/features/quiz/quiz-attempt.types';
import type { QuizSetup, QuizState } from '@/features/quiz/quiz.types';
import { DataSourceConfigError, getDataSource } from './data-source';

export interface AttemptProvider {
  getAttempt(playerId: string, mode: QuizSetup['mode']): Promise<QuizAttemptRecord | null>;
  createAttempt(playerId: string, playerName: string, setup: QuizSetup, questionIds: string[], state: QuizState): Promise<QuizAttemptRecord>;
  updateAttempt(attemptId: string, state: QuizState): Promise<QuizAttemptRecord>;
  discardAttempt(attemptId: string): Promise<void>;
}

async function supabaseNotReady(): Promise<never> {
  throw new DataSourceConfigError('The Supabase attempt provider is not configured yet.', 'SUPABASE_PROVIDER_NOT_READY');
}

export function getAttemptProvider(): AttemptProvider {
  return getDataSource() === 'mock'
    ? { getAttempt: getMockAttempt, createAttempt: createMockAttempt, updateAttempt: updateMockAttempt, discardAttempt: discardMockAttempt }
    : { getAttempt: supabaseNotReady, createAttempt: supabaseNotReady, updateAttempt: supabaseNotReady, discardAttempt: supabaseNotReady };
}
