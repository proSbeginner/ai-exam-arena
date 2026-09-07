import { discardQuizAttempt } from './services/quiz-attempt.api';
import { clearQuizProgress, clearQuizReviewAttemptId } from './quiz-progress.storage';
import { saveQuizSetup } from './quiz-setup.hook';
import type { QuizMode } from './quiz.types';
import { APP_ROUTES } from '@/features/shared/routes';

interface RestartQuizAttemptInput {
  attemptId: string | null | undefined;
  mode: QuizMode;
  questionCount: number | null;
  navigate: (route: typeof APP_ROUTES.quizSetup) => void;
}

export async function restartQuizAttempt({ attemptId, mode, questionCount, navigate }: RestartQuizAttemptInput): Promise<void> {
  clearQuizProgress();
  clearQuizReviewAttemptId();
  if (attemptId) await discardQuizAttempt(attemptId).catch(() => undefined);
  saveQuizSetup({ mode, questionLimit: questionCount });
  navigate(APP_ROUTES.quizSetup);
}
