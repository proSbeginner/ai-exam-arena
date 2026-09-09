'use client';

import { useRouter } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { getStoredPlayerName, subscribeToPlayerName } from '@/features/welcome/welcome.hook';
import { APP_ROUTES } from '@/features/shared/routes';

import { QuizSetup } from '@/features/quiz/components/quiz-setup';
import { QuizSetupSkeleton } from '@/features/quiz/components/quiz-setup-skeleton';
import { useQuizSetup } from '@/features/quiz/quiz-setup.hook';

export default function QuizSetupPage() {
  const router = useRouter();
  const playerName = useSyncExternalStore(subscribeToPlayerName, getStoredPlayerName, () => null);
  const quizSetup = useQuizSetup();

  if (quizSetup.isLoading) return <QuizSetupSkeleton />;

  return (
    <QuizSetup
      {...quizSetup}
      playerName={playerName ?? ''}
      selectPlayer={() => router.push(APP_ROUTES.welcome)}
    />
  );
}
