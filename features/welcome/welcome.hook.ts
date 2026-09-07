'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

import { APP_ROUTES } from '@/features/shared/routes';

import {
  PLAYER_ID_STORAGE_KEY,
  PLAYER_NAME_STORAGE_KEY,
  PLAYER_PIN_LENGTH,
  type PlayerNameValidation,
  type WelcomeMode,
} from './welcome.types';
import { authenticatePlayer, registerPlayer, WelcomeApiError } from './services/welcome.api';
import { PLAYER_NAME_MAX_LENGTH } from './welcome.constants';

const PLAYER_NAME_PATTERN = /^[A-Z_]+$/;
const playerNameListeners = new Set<() => void>();

export interface WelcomeHook {
  playerNameError: string | null;
  isSubmitting: boolean;
  mode: WelcomeMode;
  pinError: string | null;
  pin: string;
  playerName: string;
  toggleMode: () => void;
  updatePin: (value: string) => void;
  submitPlayerName: () => Promise<void>;
  updatePlayerName: (value: string) => void;
}

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

  if (value.length > PLAYER_NAME_MAX_LENGTH) {
    return {
      isValid: false,
      message: `ชื่อผู้เล่นยาวได้สูงสุด ${PLAYER_NAME_MAX_LENGTH} ตัวอักษร`,
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

export function savePlayerId(playerId: string): void {
  window.sessionStorage.setItem(PLAYER_ID_STORAGE_KEY, playerId);
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

export function useWelcome(): WelcomeHook {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [playerNameError, setPlayerNameError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<WelcomeMode>('register');
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const updatePlayerName = useCallback((value: string) => {
    const normalizedPlayerName = normalizePlayerName(value);
    const validation = validatePlayerName(normalizedPlayerName);

    setPlayerName(normalizedPlayerName);
    setPlayerNameError(normalizedPlayerName && !validation.isValid ? validation.message : null);
  }, []);

  const updatePin = useCallback((value: string) => {
    if (!/^\d*$/.test(value)) return;
    setPin(value.slice(0, PLAYER_PIN_LENGTH));
    setPinError(null);
  }, []);

  const toggleMode = useCallback(() => {
    setMode((currentMode) => (currentMode === 'register' ? 'recover' : 'register'));
    setPlayerNameError(null);
    setPinError(null);
  }, []);

  const submitPlayerName = useCallback(async () => {
    const normalizedPlayerName = normalizePlayerName(playerName);
    const validation = validatePlayerName(normalizedPlayerName);

    if (!validation.isValid) {
      setPlayerNameError(validation.message);
      return;
    }

    if (!/^\d{6}$/.test(pin)) {
      setPinError(`กรุณาระบุ PIN เป็นตัวเลข ${PLAYER_PIN_LENGTH} หลัก`);
      return;
    }

    setPlayerNameError(null);
    setPinError(null);

    setIsSubmitting(true);

    try {
      let response;

      try {
        response = mode === 'register'
          ? await registerPlayer(normalizedPlayerName, pin)
          : await authenticatePlayer(normalizedPlayerName, pin);
      } catch (registrationError) {
        if (
          mode === 'register' &&
          registrationError instanceof WelcomeApiError &&
          registrationError.code === 'PLAYER_NAME_TAKEN'
        ) {
          response = await authenticatePlayer(normalizedPlayerName, pin);
        } else {
          throw registrationError;
        }
      }

      savePlayerName(response.player.playerName);
      savePlayerId(response.player.id);
      router.replace(APP_ROUTES.quizSetup);
    } catch (submissionError) {
      if (submissionError instanceof WelcomeApiError && submissionError.code === 'PLAYER_NAME_TAKEN') {
        setPlayerNameError('ชื่อผู้เล่นนี้มีผู้ใช้งานแล้ว กรุณาเลือกชื่ออื่น');
      } else if (submissionError instanceof WelcomeApiError && submissionError.code === 'PLAYER_LOCKED') {
        setPinError('ใส่ PIN ผิดหลายครั้ง ระบบล็อกบัญชีไว้ กรุณาติดต่อ Admin');
      } else if (submissionError instanceof WelcomeApiError && submissionError.code === 'INVALID_CREDENTIALS') {
        setPinError('ชื่อผู้เล่นหรือ PIN ไม่ถูกต้อง');
      } else {
        setPlayerNameError('ไม่สามารถเริ่มเกมได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [mode, pin, playerName, router]);

  return {
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
  };
}
