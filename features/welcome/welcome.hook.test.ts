import { describe, expect, it } from 'vitest';

import {
  normalizePlayerName,
  validatePlayerName,
} from '@/features/welcome/welcome.hook';

describe('player-name rules', () => {
  it('normalizes whitespace and lowercase input to uppercase', () => {
    expect(normalizePlayerName('  cloud_player  ')).toBe('CLOUD_PLAYER');
  });

  it.each(['JISOO', 'CLOUD_PLAYER', 'A'])('accepts %s', (playerName) => {
    expect(validatePlayerName(playerName).isValid).toBe(true);
  });

  it.each(['JISOO-1', 'JISOO 1', 'จีซู', 'JISOO!'])('rejects invalid player name %s', (playerName) => {
    expect(validatePlayerName(playerName).isValid).toBe(false);
  });

  it('rejects a name longer than 20 characters', () => {
    expect(validatePlayerName('A'.repeat(21)).isValid).toBe(false);
  });
});

import { resetPlayerSession } from '@/features/welcome/welcome.hook';
import { PLAYER_ID_STORAGE_KEY, PLAYER_NAME_STORAGE_KEY } from '@/features/welcome/welcome.types';
import { QUIZ_SETUP_STORAGE_KEY } from '@/features/quiz/quiz-setup.hook';
import { QUIZ_PROGRESS_STORAGE_KEY, QUIZ_REVIEW_ATTEMPT_STORAGE_KEY } from '@/features/quiz/quiz-progress.storage';

describe('resetPlayerSession', () => {
  it('clears player and quiz session data', () => {
    window.sessionStorage.setItem(PLAYER_NAME_STORAGE_KEY, 'OLD_PLAYER');
    window.sessionStorage.setItem(PLAYER_ID_STORAGE_KEY, 'player-1');
    window.sessionStorage.setItem(QUIZ_SETUP_STORAGE_KEY, JSON.stringify({ mode: 'primary', questionLimit: 1 }));
    window.sessionStorage.setItem(QUIZ_PROGRESS_STORAGE_KEY, '{}');
    window.sessionStorage.setItem(QUIZ_REVIEW_ATTEMPT_STORAGE_KEY, 'attempt-1');

    resetPlayerSession();

    expect(window.sessionStorage.getItem(PLAYER_NAME_STORAGE_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(PLAYER_ID_STORAGE_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(QUIZ_SETUP_STORAGE_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(QUIZ_PROGRESS_STORAGE_KEY)).toBeNull();
    expect(window.sessionStorage.getItem(QUIZ_REVIEW_ATTEMPT_STORAGE_KEY)).toBeNull();
  });
});
