import type { QuizAttemptRecord } from '@/features/quiz/quiz-attempt.types';
import type { QuizMode, QuizSetup } from '@/features/quiz/quiz.types';
import { APP_ROUTES } from '@/features/shared/routes';

import { LEADERBOARD_ATTEMPT_STATUS } from './leaderboard.constants';
import type { CurrentAttemptSummary } from './leaderboard.types';

type GetQuizAttempt = (playerId: string, mode: QuizMode) => Promise<QuizAttemptRecord | null>;

export type ContinuePlayerQuizAction =
  | { type: 'redirect-to-setup'; route: typeof APP_ROUTES.quizSetup; setup: QuizSetup }
  | { type: 'open-quiz'; route: typeof APP_ROUTES.quiz; setup: QuizSetup; reviewAttemptId?: string };

interface ResolveContinuePlayerQuizInput {
  playerId: string | null;
  mode: QuizMode;
  currentAttempt?: CurrentAttemptSummary | null;
  getQuizAttempt: GetQuizAttempt;
}

export async function resolveContinuePlayerQuiz({
  playerId,
  mode,
  currentAttempt,
  getQuizAttempt,
}: ResolveContinuePlayerQuizInput): Promise<ContinuePlayerQuizAction | null> {
  if (!playerId) return null;

  const existingAttempt = await getQuizAttempt(playerId, mode).catch(() => null);

  if (!existingAttempt && !currentAttempt) {
    return { type: 'redirect-to-setup', route: APP_ROUTES.quizSetup, setup: { mode, questionLimit: null } };
  }

  const attemptMode = existingAttempt?.setup.mode ?? currentAttempt?.mode ?? mode;
  const questionLimit = existingAttempt?.questionIds.length ?? currentAttempt?.questionCount ?? null;
  const reviewAttemptId = existingAttempt?.state.attemptStatus === LEADERBOARD_ATTEMPT_STATUS.COMPLETED
    ? existingAttempt.id
    : currentAttempt?.attemptStatus === LEADERBOARD_ATTEMPT_STATUS.COMPLETED
      ? currentAttempt.attemptId
      : undefined;

  return {
    type: 'open-quiz',
    route: APP_ROUTES.quiz,
    setup: { mode: attemptMode, questionLimit },
    ...(reviewAttemptId ? { reviewAttemptId } : {}),
  };
}
