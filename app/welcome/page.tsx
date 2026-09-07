'use client';

import { Welcome } from '@/features/welcome/components/welcome';
import { useWelcome } from '@/features/welcome/welcome.hook';

export default function WelcomePage() {
  const {
    playerNameError,
    isSubmitting,
    isCheckingPlayer,
    isNewPlayer,
    pinError,
    pin,
    pinConfirm,
    pinConfirmError,
    playerName,
    updatePin,
    updatePinConfirm,
    submitPlayerName,
    updatePlayerName,
  } = useWelcome();

  return (
    <Welcome
      playerNameError={playerNameError}
      isSubmitting={isSubmitting}
      isCheckingPlayer={isCheckingPlayer}
      isNewPlayer={isNewPlayer}
      pinError={pinError}
      pin={pin}
      pinConfirm={pinConfirm}
      pinConfirmError={pinConfirmError}
      playerName={playerName}
      submitPlayerName={submitPlayerName}
      updatePin={updatePin}
      updatePinConfirm={updatePinConfirm}
      updatePlayerName={updatePlayerName}
    />
  );
}
