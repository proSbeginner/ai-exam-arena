'use client';

import { useEffect, useState } from 'react';

import { APP_ROUTES } from '@/features/shared/routes';
import {
  getStoredPlayerName,
  subscribeToPlayerName,
} from '../welcome.hook';
import { QuizLoadingSkeleton } from '../../quiz/components/quiz-loading-skeleton';
import { WelcomeLoadingSkeleton } from './welcome-loading-skeleton';

export function EntryGate() {
  const [playerName, setPlayerName] = useState<string | null | undefined>(undefined);

  useEffect(() => {
    const syncPlayerName = () => {
      setPlayerName(getStoredPlayerName());
    };

    syncPlayerName();

    return subscribeToPlayerName(syncPlayerName);
  }, []);

  const isPlayerReady = playerName !== undefined;

  useEffect(() => {
    if (isPlayerReady) {
      window.location.replace(playerName ? APP_ROUTES.quizSetup : APP_ROUTES.welcome);
    }
  }, [isPlayerReady, playerName]);

  return playerName ? <QuizLoadingSkeleton /> : <WelcomeLoadingSkeleton />;
}
