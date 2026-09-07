import type { QuizAttemptRecord, SerializedQuizState } from '@/features/quiz/quiz-attempt.types';
import type { QuizSetup, QuizState } from '@/features/quiz/quiz.types';
import type { DatabaseAttemptRow } from '@/server/database/types';

export function serializeQuizState(state: QuizState): SerializedQuizState {
  return {
    ...state,
    answeredMap: state.answeredMap instanceof Map ? Object.fromEntries(state.answeredMap) : state.answeredMap,
  };
}

export function transformAttempt(row: DatabaseAttemptRow, playerName: string): QuizAttemptRecord {
  return {
    id: row.id,
    playerId: row.player_id,
    playerName,
    setup: { mode: row.mode, questionLimit: row.question_limit } satisfies QuizSetup,
    questionIds: row.question_ids,
    state: row.state,
    startedAt: row.started_at,
    updatedAt: row.updated_at,
    completedAt: row.completed_at ?? undefined,
  };
}
