'use client';

import { Welcome } from '@/features/welcome/components/welcome';
import { useWelcome } from '@/features/welcome/welcome.hook';

export default function WelcomePage() {
  const {
    error,
    isSubmitting,
    playerName,
    submitPlayerName,
    updatePlayerName,
  } = useWelcome();

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
