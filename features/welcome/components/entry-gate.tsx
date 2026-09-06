'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { useRouter } from 'next/navigation';

import { AppLoadingSkeleton } from '@/features/shared/components/app-loading-skeleton';
import {
  getStoredPlayerName,
  subscribeToPlayerName,
} from '../welcome.store';

export function EntryGate() {
  const router = useRouter();
  const playerName = useSyncExternalStore(
    subscribeToPlayerName,
    getStoredPlayerName,
    () => null,
  );
  const isPlayerReady = useSyncExternalStore(
    subscribeToPlayerName,
    () => true,
    () => false,
  );

  useEffect(() => {
    if (isPlayerReady) {
      router.replace(playerName ? '/quiz' : '/welcome');
    }
  }, [isPlayerReady, playerName, router]);

  return <AppLoadingSkeleton variant={playerName ? 'quiz' : 'welcome'} />;
}
