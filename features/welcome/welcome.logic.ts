import { MAX_PLAYER_PIN_ATTEMPTS } from './welcome.constants';

export interface PinAttemptState {
  failedPinAttempts: number;
  locked: boolean;
}

export function recordFailedPinAttempt(failedPinAttempts: number): PinAttemptState {
  const nextFailedPinAttempts = failedPinAttempts + 1;

  return {
    failedPinAttempts: nextFailedPinAttempts,
    locked: nextFailedPinAttempts >= MAX_PLAYER_PIN_ATTEMPTS,
  };
}
