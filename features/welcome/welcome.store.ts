'use client';

import { useCallback, useState } from 'react';
import { useRouter } from 'next/navigation';

import { APP_ROUTES } from '@/features/shared/routes';

import {
  PLAYER_NAME_STORAGE_KEY,
  type PlayerNameValidation,
} from './welcome.types';
import { registerPlayer, WelcomeApiError } from './services/welcome.api';

const MAX_PLAYER_NAME_LENGTH = 20;
const PLAYER_NAME_PATTERN = /^[A-Z_]+$/;
const playerNameListeners = new Set<() => void>();

export interface WelcomeStore {
  error: string | null;
  isSubmitting: boolean;
  playerName: string;
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

export function useWelcomeStore(): WelcomeStore {
  const router = useRouter();
  const [playerName, setPlayerName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updatePlayerName = useCallback((value: string) => {
    const normalizedPlayerName = normalizePlayerName(value);
    const validation = validatePlayerName(normalizedPlayerName);

    setPlayerName(normalizedPlayerName);
    setError(normalizedPlayerName && !validation.isValid ? validation.message : null);
  }, []);

  const submitPlayerName = useCallback(async () => {
    const normalizedPlayerName = normalizePlayerName(playerName);
    const validation = validatePlayerName(normalizedPlayerName);

    if (!validation.isValid) {
      setError(validation.message);
      return;
    }

    setIsSubmitting(true);

    try {
      await registerPlayer(normalizedPlayerName);
      savePlayerName(normalizedPlayerName);
      router.replace(APP_ROUTES.quizSetup);
    } catch (submissionError) {
      if (submissionError instanceof WelcomeApiError && submissionError.code === 'PLAYER_NAME_TAKEN') {
        setError('ชื่อผู้เล่นนี้มีผู้ใช้งานแล้ว กรุณาเลือกชื่ออื่น');
      } else {
        setError('ไม่สามารถเริ่มเกมได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง');
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [playerName, router]);

  return {
    error,
    isSubmitting,
    playerName,
    submitPlayerName,
    updatePlayerName,
  };
}
