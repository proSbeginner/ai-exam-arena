import { describe, expect, it } from 'vitest';

import {
  getQuizByScenario,
  type MockQuizScenario,
} from '@/server/providers/mock-quiz.provider';

const scenarios: MockQuizScenario[] = ['success', 'empty', 'unavailable', 'unknown-error'];

describe('mock quiz provider', () => {
  it('supports every quiz scenario', async () => {
    expect(scenarios).toHaveLength(4);
    await expect(getQuizByScenario('success')).resolves.toHaveLength(2);
    await expect(getQuizByScenario('empty')).resolves.toEqual([]);
  });

  it('returns a typed service error when quiz is unavailable', async () => {
    await expect(getQuizByScenario('unavailable')).rejects.toMatchObject({
      code: 'QUIZ_UNAVAILABLE',
      status: 503,
    });
  });

  it('returns an unexpected error for the unknown-error scenario', async () => {
    await expect(getQuizByScenario('unknown-error')).rejects.toThrow(
      'The mock quiz service failed unexpectedly.',
    );
  });
});
