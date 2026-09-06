'use client';

import { QuizSetup } from '@/features/quiz/components/quiz-setup';
import { useQuizSetupStore } from '@/features/quiz/quiz-setup.store';

export default function QuizSetupPage() {
  return <QuizSetup {...useQuizSetupStore()} />;
}
