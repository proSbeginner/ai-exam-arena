const DEFAULT_PLAYER_NAME_MAX_LENGTH = 20;

const configuredPlayerNameMaxLength = Number(process.env.NEXT_PUBLIC_PLAYER_NAME_MAX_LENGTH);

export const PLAYER_NAME_MAX_LENGTH = Number.isInteger(configuredPlayerNameMaxLength)
  && configuredPlayerNameMaxLength > 0
  ? configuredPlayerNameMaxLength
  : DEFAULT_PLAYER_NAME_MAX_LENGTH;

export const MAX_PLAYER_PIN_ATTEMPTS = 20;
