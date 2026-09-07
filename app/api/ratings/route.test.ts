import { describe, expect, it, vi } from 'vitest';

const { getRatingProvider, getAttemptProvider, getQuizProvider } = vi.hoisted(() => ({
  getRatingProvider: vi.fn(),
  getAttemptProvider: vi.fn(),
  getQuizProvider: vi.fn(),
}));

vi.mock('@/server/providers/rating.provider', () => ({ getRatingProvider }));
vi.mock('@/server/providers/attempt.provider', () => ({ getAttemptProvider }));
vi.mock('@/server/providers/quiz.provider', () => ({ getQuizProvider }));

import { POST } from './route';

describe('POST /api/ratings', () => {
  it('rejects a request without an attempt id', async () => {
    const response = await POST(new Request('http://localhost/api/ratings', { method: 'POST', body: '{}' }));
    expect(response.status).toBe(400);
  });

  it('derives rating input from a completed server attempt', async () => {
    getAttemptProvider.mockReturnValue({ getAttemptById: vi.fn().mockResolvedValue({
      id: 'attempt-1', playerId: 'player-1', setup: { mode: 'secondary' }, questionIds: ['q-1'],
      state: { attemptStatus: 'completed', answeredMap: { '0': 'option-1' }, score: 1 },
    }) });
    getQuizProvider.mockReturnValue({ getQuestions: vi.fn().mockResolvedValue([{ id: 'q-1', options: [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }], status: 'published' }]) });
    getRatingProvider.mockReturnValue({ applyAttemptRating: vi.fn().mockResolvedValue({ playerId: 'player-1', mode: 'secondary', mmr: 100 }) });

    const response = await POST(new Request('http://localhost/api/ratings', {
      method: 'POST', body: JSON.stringify({ attemptId: 'attempt-1' }),
    }));

    expect(response.status).toBe(200);
    expect(getRatingProvider().applyAttemptRating).toHaveBeenCalledWith(expect.objectContaining({
      questionCount: 1, answeredCount: 1, correctCount: 1, optionCounts: [3],
    }));
  });
});
