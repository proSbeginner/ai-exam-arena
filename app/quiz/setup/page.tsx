'use client';

import { QuizSetup } from '@/features/quiz/components/quiz-setup';
import { useQuizSetup } from '@/features/quiz/quiz-setup.hook';

export default function QuizSetupPage() {
  return <QuizSetup {...useQuizSetup()} />;
}
