'use client';

import { Welcome } from '@/features/welcome/components/welcome';
import { useWelcome } from '@/features/welcome/welcome.hook';

export default function WelcomePage() {
  const {
    playerNameError,
    isSubmitting,
    mode,
    pinError,
    pin,
    playerName,
    toggleMode,
    updatePin,
    submitPlayerName,
    updatePlayerName,
  } = useWelcome();

  return (
    <Welcome
      playerNameError={playerNameError}
      isSubmitting={isSubmitting}
      mode={mode}
      pinError={pinError}
      pin={pin}
      playerName={playerName}
      submitPlayerName={submitPlayerName}
      toggleMode={toggleMode}
      updatePin={updatePin}
      updatePlayerName={updatePlayerName}
    />
  );
}
