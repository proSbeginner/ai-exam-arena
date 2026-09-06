'use client';

import { Welcome } from '@/features/welcome/components/welcome';
import { useWelcomeStore } from '@/features/welcome/welcome.store';

export default function WelcomePage() {
  const {
    error,
    isSubmitting,
    playerName,
    submitPlayerName,
    updatePlayerName,
  } = useWelcomeStore();

  return (
    <Welcome
      error={error}
      isSubmitting={isSubmitting}
      playerName={playerName}
      submitPlayerName={submitPlayerName}
      updatePlayerName={updatePlayerName}
    />
  );
}
