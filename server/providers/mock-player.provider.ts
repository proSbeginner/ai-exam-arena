import { ApiError } from '@/server/errors/api-error';
import {
  authenticateMockPlayer,
  createMockPlayer,
  hasMockPlayer,
} from '@/mock/api/welcome/mock-player';
import type { PlayerProvider } from '@/server/providers/player.provider';

export type MockPlayerScenario =
  | 'success'
  | 'player-name-taken'
  | 'unavailable'
  | 'unknown-error';

export const MOCK_PLAYER_SCENARIO: MockPlayerScenario = 'success';
export const MOCK_DELAY_MS = 500;

async function prepareMockRequest(
  scenario: MockPlayerScenario,
): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS));

  if (scenario === 'unavailable') {
    throw new ApiError('The mock player service is unavailable.', 503, 'PLAYER_UNAVAILABLE');
  }

  if (scenario === 'unknown-error') {
    throw new Error('The mock player service failed unexpectedly.');
  }
}

export async function createPlayerByScenario(
  scenario: MockPlayerScenario,
  playerName: string,
  pin: string,
) {
  await prepareMockRequest(scenario);
  if (scenario === 'player-name-taken') {
    throw new ApiError('This player name is already in use.', 409, 'PLAYER_NAME_TAKEN');
  }
  return createMockPlayer(playerName, pin);
}

export async function hasPlayerByScenario(
  scenario: MockPlayerScenario,
  playerName: string,
): Promise<boolean> {
  await prepareMockRequest(scenario);
  return hasMockPlayer(playerName);
}

export async function authenticatePlayerByScenario(
  scenario: MockPlayerScenario,
  playerName: string,
  pin: string,
) {
  await prepareMockRequest(scenario);
  return authenticateMockPlayer(playerName, pin);
}

export const mockPlayerProvider: PlayerProvider = {
  hasPlayer: (playerName) => hasPlayerByScenario(MOCK_PLAYER_SCENARIO, playerName),
  createPlayer: (playerName, pin) => createPlayerByScenario(MOCK_PLAYER_SCENARIO, playerName, pin),
  authenticatePlayer: (playerName, pin) => authenticatePlayerByScenario(MOCK_PLAYER_SCENARIO, playerName, pin),
};
