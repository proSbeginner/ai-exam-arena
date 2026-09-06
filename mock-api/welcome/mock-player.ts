import {
  getMockScenario,
  MockApiError,
  simulateMockNetworkDelay,
  throwIfMockServiceUnavailable,
} from '../mock-api.config';

export async function createMockPlayer(playerName: string) {
  await simulateMockNetworkDelay();
  throwIfMockServiceUnavailable();

  if (getMockScenario() === 'player-name-taken') {
    throw new MockApiError('This player name is already in use.', 409, 'PLAYER_NAME_TAKEN');
  }

  return {
    id: `mock-player-${playerName.toLowerCase()}`,
    playerName,
  };
}
