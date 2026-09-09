import { authenticateMockPlayer, createMockPlayer, hasMockPlayer } from '@/mock/api/welcome/mock-player';
import type { PlayerProvider } from '@/server/providers/player.provider';

export const mockPlayerProvider: PlayerProvider = {
  hasPlayer: hasMockPlayer,
  createPlayer: createMockPlayer,
  authenticatePlayer: authenticateMockPlayer,
};
