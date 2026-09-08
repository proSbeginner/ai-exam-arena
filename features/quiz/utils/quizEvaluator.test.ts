import { describe, expect, it } from 'vitest';

import { validateAndCalculateQuizState } from './quizEvaluator';
import type { QuizAttemptRecord } from '@/features/quiz/quiz-attempt.types';
import type { ExamQuestion } from '@/features/quiz/quiz.types';

const question: ExamQuestion = {
  id: 'question-1',
  labels: [],
  english: 'Which answer is correct?',
  thai_drama: '',
  options: [
    { id: 'option-a', english: 'Wrong', thai_drama: '' },
    { id: 'option-b', english: 'Correct', thai_drama: '' },
  ],
  correctOptionId: 'option-b',
  status: 'published',
};

function makeAttempt(overrides: Partial<QuizAttemptRecord['state']> = {}): QuizAttemptRecord {
  return {
    id: 'attempt-1',
    playerId: 'player-1',
    playerName: 'PLAYER',
    setup: { mode: 'primary', questionLimit: 1 },
    questionIds: [question.id],
    state: {
      currentQIndex: 0,
      score: 0,
      streak: 0,
      mood: 'idle',
      answeredMap: {},
        summaryVisible: false,
      attemptStatus: 'active',
      ...overrides,
    },
    startedAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };
}

describe('validateAndCalculateQuizState', () => {
  it('throws when the attempt is completed', () => {
    expect(() => validateAndCalculateQuizState(makeAttempt({ attemptStatus: 'completed' }), question, 'option-b'))
      .toThrow('Attempt is already completed.');
  });

  it('throws when the question is not the current question', () => {
    expect(() => validateAndCalculateQuizState(makeAttempt({ currentQIndex: 1 }), question, 'option-b'))
      .toThrow('Invalid question.');
  });

  it('throws when the question has already been answered', () => {
    expect(() => validateAndCalculateQuizState(makeAttempt({ answeredMap: { '0': 'option-a' } }), question, 'option-b'))
      .toThrow('Question has already been answered.');
  });

  it('throws when the option does not exist', () => {
    expect(() => validateAndCalculateQuizState(makeAttempt(), question, 'option-z'))
      .toThrow('Invalid answer.');
  });

  it('calculates the next state for a correct answer', () => {
    const result = validateAndCalculateQuizState(makeAttempt(), question, 'option-b');

    expect(result.isCorrect).toBe(true);
    expect(result.selectedOption.id).toBe('option-b');
    expect(result.nextState.score).toBe(1);
    expect(result.nextState.streak).toBe(1);
    expect(result.nextState.mood).toBe('correct');
    expect(result.nextState.answeredMap.get(0)).toBe('option-b');
  });
});
