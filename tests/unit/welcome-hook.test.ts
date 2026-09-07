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
