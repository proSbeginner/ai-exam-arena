'use client';

import { useRouter } from 'next/navigation';
import { useSyncExternalStore } from 'react';
import { getStoredPlayerName, subscribeToPlayerName } from '@/features/welcome/welcome.hook';
import { APP_ROUTES } from '@/features/shared/routes';

import { QuizSetup } from '@/features/quiz/components/quiz-setup';
import { useQuizSetup } from '@/features/quiz/quiz-setup.hook';

export default function QuizSetupPage() {
  const router = useRouter();
  const playerName = useSyncExternalStore(subscribeToPlayerName, getStoredPlayerName, () => null);

  return (
    <QuizSetup
      {...useQuizSetup()}
      playerName={playerName ?? ''}
      selectPlayer={() => router.push(APP_ROUTES.welcome)}
    />
  );
}
