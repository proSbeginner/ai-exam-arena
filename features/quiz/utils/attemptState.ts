import { ATTEMPT_STATUS, PASSING_SCORE_PERCENTAGE } from '../quiz.constants';
import type { SerializedQuizState } from '../quiz-attempt.types';

export function applyClientAttemptUpdate(
  current: SerializedQuizState,
  requested: SerializedQuizState,
  questionCount: number,
): SerializedQuizState {
  const answeredCount = Object.keys(current.answeredMap).length;
  const isCompleted = answeredCount >= questionCount;
  const attemptStatus = isCompleted && requested.attemptStatus === ATTEMPT_STATUS.COMPLETED
    ? ATTEMPT_STATUS.COMPLETED
    : !isCompleted && requested.summaryVisible
      ? ATTEMPT_STATUS.ABANDONED
      : ATTEMPT_STATUS.ACTIVE;

  return {
    ...current,
    currentQIndex: Math.max(0, Math.min(requested.currentQIndex, Math.max(questionCount - 1, 0))),
    summaryVisible: attemptStatus !== ATTEMPT_STATUS.ACTIVE,
    attemptStatus,
    mood: attemptStatus === ATTEMPT_STATUS.COMPLETED
      ? current.score * 100 >= questionCount * PASSING_SCORE_PERCENTAGE ? 'passed' : 'failed'
      : 'idle',
  };
}
