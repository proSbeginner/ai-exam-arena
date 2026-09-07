export const PLAYER_NAME_STORAGE_KEY = 'quiz_player_name';
export const PLAYER_ID_STORAGE_KEY = 'quiz_player_id';
export const PLAYER_PIN_LENGTH = 6;

export type WelcomeMode = 'register' | 'recover';

export interface PlayerProfile {
  id: string;
  playerName: string;
}

export interface PlayerNameValidation {
  isValid: boolean;
  message: string | null;
}
