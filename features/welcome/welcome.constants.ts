const DEFAULT_PLAYER_NAME_MAX_LENGTH = 20;
const DEFAULT_MAX_PLAYER_PIN_ATTEMPTS = 20;

const configuredPlayerNameMaxLength = Number(process.env.NEXT_PUBLIC_PLAYER_NAME_MAX_LENGTH);

export const PLAYER_NAME_MAX_LENGTH = Number.isInteger(configuredPlayerNameMaxLength)
  && configuredPlayerNameMaxLength > 0
  ? configuredPlayerNameMaxLength
  : DEFAULT_PLAYER_NAME_MAX_LENGTH;

const configuredMaxPlayerPinAttempts = Number(process.env.MAX_PLAYER_PIN_ATTEMPTS);

export const MAX_PLAYER_PIN_ATTEMPTS = Number.isInteger(configuredMaxPlayerPinAttempts)
  && configuredMaxPlayerPinAttempts > 0
  ? configuredMaxPlayerPinAttempts
  : DEFAULT_MAX_PLAYER_PIN_ATTEMPTS;
