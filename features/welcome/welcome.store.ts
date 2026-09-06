import {
  PLAYER_NAME_STORAGE_KEY,
  type PlayerNameValidation,
} from './welcome.types';

const MAX_PLAYER_NAME_LENGTH = 20;
const PLAYER_NAME_PATTERN = /^[A-Z_]+$/;
const playerNameListeners = new Set<() => void>();

function notifyPlayerNameListeners(): void {
  playerNameListeners.forEach((listener) => listener());
}

export function normalizePlayerName(value: string): string {
  return value.trim().toUpperCase();
}

export function validatePlayerName(value: string): PlayerNameValidation {
  if (!value) {
    return { isValid: false, message: 'กรุณาระบุชื่อผู้เล่น' };
  }

  if (value.length > MAX_PLAYER_NAME_LENGTH) {
    return {
      isValid: false,
      message: `ชื่อผู้เล่นยาวได้สูงสุด ${MAX_PLAYER_NAME_LENGTH} ตัวอักษร`,
    };
  }

  if (!PLAYER_NAME_PATTERN.test(value)) {
    return {
      isValid: false,
      message: 'ใช้ได้เฉพาะตัวอักษร A–Z และ _',
    };
  }

  return { isValid: true, message: null };
}

export function getStoredPlayerName(): string | null {
  if (typeof window === 'undefined') return null;
  return window.sessionStorage.getItem(PLAYER_NAME_STORAGE_KEY);
}

export function savePlayerName(playerName: string): void {
  window.sessionStorage.setItem(PLAYER_NAME_STORAGE_KEY, playerName);
  notifyPlayerNameListeners();
}

export function clearPlayerName(): void {
  window.sessionStorage.removeItem(PLAYER_NAME_STORAGE_KEY);
  notifyPlayerNameListeners();
}

export function subscribeToPlayerName(listener: () => void): () => void {
  playerNameListeners.add(listener);
  window.addEventListener('storage', listener);

  return () => {
    playerNameListeners.delete(listener);
    window.removeEventListener('storage', listener);
  };
}
