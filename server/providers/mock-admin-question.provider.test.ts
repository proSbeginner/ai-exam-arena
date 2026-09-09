import { describe, expect, it } from 'vitest';

import {
  listAdminQuestionsByScenario,
  type MockAdminQuestionScenario,
} from '@/server/providers/mock-admin-question.provider';

const scenarios: MockAdminQuestionScenario[] = ['success', 'empty', 'unavailable', 'unknown-error'];

describe('mock admin question provider', () => {
  it('supports every admin question scenario', async () => {
    expect(scenarios).toHaveLength(4);
    await expect(listAdminQuestionsByScenario('success')).resolves.toEqual(expect.any(Array));
    await expect(listAdminQuestionsByScenario('empty')).resolves.toEqual([]);
  });

  it('returns a typed service error when admin questions are unavailable', async () => {
    await expect(listAdminQuestionsByScenario('unavailable')).rejects.toMatchObject({
      code: 'ADMIN_QUESTION_UNAVAILABLE',
      status: 503,
    });
  });

  it('returns an unexpected error for the unknown-error scenario', async () => {
    await expect(listAdminQuestionsByScenario('unknown-error')).rejects.toThrow(
      'The mock admin question service failed unexpectedly.',
    );
  });
});
