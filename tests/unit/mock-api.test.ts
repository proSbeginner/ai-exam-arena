import { afterEach, describe, expect, it } from 'vitest';

import {
  authenticateMockPlayer,
  createMockPlayer,
} from '@/mock-api/welcome/mock-player';
import { getMockQuizQuestions } from '@/mock-api/quiz/mock-questions';

const originalScenario = process.env.MOCK_API_SCENARIO;
const originalDelay = process.env.MOCK_API_DELAY_MS;

function setScenario(scenario: string) {
  process.env.MOCK_API_SCENARIO = scenario;
  process.env.MOCK_API_DELAY_MS = '0';
}

afterEach(() => {
  process.env.MOCK_API_SCENARIO = originalScenario;
  process.env.MOCK_API_DELAY_MS = originalDelay;
});

describe('mock API scenarios', () => {
  it('returns a player and question bank in the happy path', async () => {
    setScenario('happy');

    await expect(createMockPlayer('CLOUD_PLAYER', '123456')).resolves.toMatchObject({
      id: expect.any(String),
      playerName: 'CLOUD_PLAYER',
    });
    await expect(getMockQuizQuestions()).resolves.toHaveLength(2);
  });

  it('simulates a player name already in use', async () => {
    setScenario('player-name-taken');

    await expect(createMockPlayer('CLOUD_PLAYER', '123456')).rejects.toMatchObject({
      code: 'PLAYER_NAME_TAKEN',
      status: 409,
    });
  });

  it('locks a player after 20 failed PIN attempts', async () => {
    setScenario('happy');
    const playerName = 'LOCK_TEST_PLAYER';

    await createMockPlayer(playerName, '123456');

    for (let attempt = 1; attempt < 20; attempt += 1) {
      await expect(authenticateMockPlayer(playerName, '654321')).rejects.toMatchObject({
        code: 'INVALID_CREDENTIALS',
      });
    }

    await expect(authenticateMockPlayer(playerName, '654321')).rejects.toMatchObject({
      code: 'PLAYER_LOCKED',
      status: 423,
    });

    await expect(authenticateMockPlayer(playerName, '123456')).rejects.toMatchObject({
      code: 'PLAYER_LOCKED',
      status: 423,
    });
  });

  it('simulates an empty question bank', async () => {
    setScenario('empty-questions');

    await expect(getMockQuizQuestions()).resolves.toEqual([]);
  });

  it('simulates an unavailable service', async () => {
    setScenario('unavailable');

    await expect(getMockQuizQuestions()).rejects.toMatchObject({
      code: 'SERVICE_UNAVAILABLE',
      status: 503,
    });
  });
});
