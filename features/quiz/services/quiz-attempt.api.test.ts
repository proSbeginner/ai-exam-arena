import { describe, expect, it, vi } from 'vitest';

import { serializeQuizState, updateQuizAttempt } from '@/features/quiz/services/quiz-attempt.api';
import type { QuizState } from '@/features/quiz/quiz.types';

const state: QuizState = {
  currentQIndex: 1,
  score: 1,
  streak: 1,
  mood: 'correct',
  answeredMap: new Map([[0, 'option-a']]),
  gameOver: false,
  summaryVisible: false,
  attemptStatus: 'active',
};

describe('quiz attempt API', () => {
  it('serializes answeredMap before sending an attempt update', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ attempt: null }), { status: 200 }),
    );
    vi.stubGlobal('fetch', fetchMock);

    await updateQuizAttempt('attempt-1', state);

    const requestBody = JSON.parse(fetchMock.mock.calls[0][1].body as string) as { state: QuizState & { answeredMap: Record<string, string> } };
    expect(requestBody.state.answeredMap).toEqual({ '0': 'option-a' });
    vi.unstubAllGlobals();
  });

  it('keeps answeredMap serializable for attempt creation', () => {
    expect(serializeQuizState(state).answeredMap).toEqual({ '0': 'option-a' });
  });
});
