import type { QuizSetup, QuizState } from './quiz.types';

export const QUIZ_PROGRESS_STORAGE_KEY = 'ai-exam-arena:quiz-progress';
export const QUIZ_REVIEW_ATTEMPT_STORAGE_KEY = 'ai-exam-arena:quiz-review-attempt';

interface StoredQuizProgress {
  playerName: string;
  setup: QuizSetup;
  questionIds: string[];
  state: {
    currentQIndex: number;
    score: number;
    streak: number;
    mood: QuizState['mood'];
    answeredMap: Record<string, string>;
    gameOver: boolean;
    summaryVisible: boolean;
    attemptStatus: QuizState['attemptStatus'];
  };
}

export interface QuizProgressSnapshot {
  questionIds: string[];
  state: QuizState;
}

function isSameSetup(first: QuizSetup, second: QuizSetup): boolean {
  return first.mode === second.mode && first.questionLimit === second.questionLimit;
}

function isSameQuestionSet(first: string[], second: string[]): boolean {
  return first.length === second.length && first.every((questionId) => second.includes(questionId));
}

export function getStoredQuizProgress(
  playerName: string,
  setup: QuizSetup,
  questionIds: string[],
): QuizProgressSnapshot | null {
  if (typeof window === 'undefined') return null;

  const storedProgress = window.sessionStorage.getItem(QUIZ_PROGRESS_STORAGE_KEY);
  if (!storedProgress) return null;

  try {
    const parsedProgress = JSON.parse(storedProgress) as StoredQuizProgress;
    if (
      parsedProgress.playerName !== playerName ||
      !isSameSetup(parsedProgress.setup, setup) ||
      !isSameQuestionSet(parsedProgress.questionIds, questionIds)
    ) {
      return null;
    }

    return {
      questionIds: parsedProgress.questionIds,
      state: {
        ...parsedProgress.state,
        answeredMap: new Map(
          Object.entries(parsedProgress.state.answeredMap).map(([index, answer]) => [Number(index), answer]),
        ),
      },
    };
  } catch {
    return null;
  }
}

export function saveQuizProgress(
  playerName: string,
  setup: QuizSetup,
  questionIds: string[],
  state: QuizState,
): void {
  const progress: StoredQuizProgress = {
    playerName,
    setup,
    questionIds,
    state: {
      ...state,
      answeredMap: Object.fromEntries(state.answeredMap),
    },
  };

  window.sessionStorage.setItem(QUIZ_PROGRESS_STORAGE_KEY, JSON.stringify(progress));
}

export function clearQuizProgress(): void {
  window.sessionStorage.removeItem(QUIZ_PROGRESS_STORAGE_KEY);
}

export function saveQuizReviewAttemptId(attemptId: string): void {
  window.sessionStorage.setItem(QUIZ_REVIEW_ATTEMPT_STORAGE_KEY, attemptId);
}

export function getStoredQuizReviewAttemptId(): string | null {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(QUIZ_REVIEW_ATTEMPT_STORAGE_KEY);
}

export function clearQuizReviewAttemptId(): void {
  window.sessionStorage.removeItem(QUIZ_REVIEW_ATTEMPT_STORAGE_KEY);
}
