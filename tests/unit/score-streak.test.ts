import { describe, it, expect } from 'vitest';
import {
  createInitialQuizState,
  evaluateAnswer,
  getNextQuestion,
  getPreviousQuestion,
  getRank,
  randomizeQuestionOptions,
  randomizeQuizQuestions,
} from '@/features/quiz/quiz.logic';
import { RANKS } from '@/features/quiz/quiz.constants';
import type { QuizState } from '@/features/quiz/quiz.types';
import { questions } from '@/mock-api/quiz/questions.mock';

// --- Helper factories ---
function makeState(opts: Partial<QuizState> = {}): QuizState {
  return {
    currentQIndex: opts.currentQIndex ?? 0,
    score: opts.score ?? 0,
    streak: opts.streak ?? 0,
    mood: opts.mood ?? 'idle',
    answeredMap: opts.answeredMap ?? new Map(),
    gameOver: opts.gameOver ?? false,
    summaryVisible: opts.summaryVisible ?? false,
    attemptStatus: opts.attemptStatus ?? 'active',
  };
}

function mockQuestion(correctIdx: number) {
  return {
    ...questions[0],
    correctOptionId: questions[0].options[correctIdx].id,
  };
}

describe('getRank', () => {
  it.each([
    [0, RANKS[0]],
    [1, RANKS[0]],
    [2, RANKS[0]],
    [3, RANKS[1]],
    [4, RANKS[1]],
    [5, RANKS[1]],
    [6, RANKS[2]],
    [7, RANKS[2]],
    [8, RANKS[2]],
    [9, RANKS[3]],
    [10, RANKS[3]],
  ])('score %d → %s (%s)', (score, expected) => {
    const rank = getRank(score);
    expect(rank).toEqual(expected);
  });
});

describe('randomizeQuestionOptions', () => {
  it('keeps every option and changes the original order', () => {
    const randomized = randomizeQuestionOptions([questions[0]])[0];
    const originalIds = questions[0].options.map((option) => option.id);
    const randomizedIds = randomized.options.map((option) => option.id);

    expect(randomizedIds).toHaveLength(originalIds.length);
    expect(new Set(randomizedIds)).toEqual(new Set(originalIds));
    expect(randomizedIds).not.toEqual(originalIds);
    expect(randomized.correctOptionId).toBe(questions[0].correctOptionId);
  });
});

describe('randomizeQuizQuestions', () => {
  it('changes question order while keeping every question', () => {
    const randomized = randomizeQuizQuestions(questions);
    const originalIds = questions.map((question) => question.id);
    const randomizedIds = randomized.map((question) => question.id);

    expect(new Set(randomizedIds)).toEqual(new Set(originalIds));
    expect(randomizedIds).not.toEqual(originalIds);
  });
});

describe('handleAnswer — correct answer', () => {
  const q = mockQuestion(0); // first option is correct

  it('increments score by 1 on first correct', () => {
    const state = makeState();
    const result = evaluateAnswer(state, q, q.options[0].id);
    expect(result.score).toBe(1);
    expect(result.streak).toBe(1);
    expect(result.mood).toBe('correct');
    expect(result.triggerConfetti).toBe(false);
    expect(result.rankChanged).toBe(false);
  });

  it('increments score for a correct selection', () => {
    const state = makeState({ score: 0 });
    const result = evaluateAnswer(state, q, q.options[0].id);
    expect(result.score).toBe(1);
  });

  it('tracks answer in answeredMap', () => {
    const state = makeState();
    const result = evaluateAnswer(state, q, q.options[0].id);
    expect(result.answeredMap.size).toBe(1);
    expect(result.answeredMap.get(0)).toBe(q.options[0].id);
  });
});

describe('handleAnswer — wrong answer', () => {
  const q = mockQuestion(0); // first option correct, select wrong index 1

  it('score does not increase', () => {
    const state = makeState({ score: 2, streak: 1 });
    const result = evaluateAnswer(state, q, q.options[1].id);
    expect(result.score).toBe(2);
  });

  it('resets streak to 0', () => {
    const state = makeState({ streak: 3 });
    const result = evaluateAnswer(state, q, q.options[1].id);
    expect(result.streak).toBe(0);
  });

  it('sets mood to wrong', () => {
    const state = makeState();
    const result = evaluateAnswer(state, q, q.options[1].id);
    expect(result.mood).toBe('wrong');
  });
});

describe('handleAnswer — streak milestones & confetti', () => {
  const q = mockQuestion(0);

  it('triggers confetti at streak milestone 3', () => {
    const state = makeState({ score: 2, streak: 2 });
    const result = evaluateAnswer(state, q, q.options[0].id);
    expect(result.triggerConfetti).toBe(true);
  });

  it('triggers confetti at streak milestone 5', () => {
    const state = makeState({ score: 4, streak: 4 });
    const result = evaluateAnswer(state, q, q.options[0].id);
    expect(result.triggerConfetti).toBe(true);
  });

  it('does NOT trigger confetti at non-milestone streak (e.g. 4)', () => {
    const state = makeState({ score: 3, streak: 3 });
    const result = evaluateAnswer(state, q, q.options[0].id);
    expect(result.triggerConfetti).toBe(false);
  });
});

describe('handleAnswer — rank up triggers confetti', () => {
  const q = mockQuestion(0);

  it('triggers confetti when promoted from Intern to Apprentice (score 2→3)', () => {
    const state = makeState({ score: 2, streak: 2 });
    const result = evaluateAnswer(state, q, q.options[0].id);
    expect(result.rankChanged).toBe(true);
    expect(result.triggerConfetti).toBe(true);
    expect(result.score).toBe(3);
  });

  it('triggers confetti when promoted from Apprentice to Practitioner (score 5→6)', () => {
    const state = makeState({ score: 5, streak: 5 });
    const result = evaluateAnswer(state, q, q.options[0].id);
    expect(result.rankChanged).toBe(true);
    expect(result.triggerConfetti).toBe(true);
    expect(result.score).toBe(6);
  });

  it('does not trigger when staying at same rank (score 3→4)', () => {
    const state = makeState({ score: 3, streak: 3 });
    const result = evaluateAnswer(state, q, q.options[0].id);
    expect(result.rankChanged).toBe(false);
    expect(result.triggerConfetti).toBe(false);
  });
});

describe('goToNext', () => {
  it('advances question index when not at last', () => {
    const state = makeState({ currentQIndex: 0, answeredMap: new Map() });
    const result = getNextQuestion(state, questions.length);
    expect(result.currentQIndex).toBe(1);
    expect(result.gameOver).toBe(false);
  });

  it('does not advance past last question', () => {
    const state = makeState({ currentQIndex: questions.length - 1, answeredMap: new Map() });
    const result = getNextQuestion(state, questions.length);
    expect(result.currentQIndex).toBe(questions.length - 1);
  });

  it('ends the quiz with the appropriate final mood after every question is answered', () => {
    const state = makeState({
      currentQIndex: questions.length - 1,
      score: 1,
      answeredMap: new Map([
        [0, questions[0].options[0].id],
        [1, questions[1].options[0].id],
      ]),
    });

    expect(getNextQuestion(state, questions.length)).toMatchObject({
      gameOver: true,
      mood: 'passed',
    });
  });
});

describe('goToPrev', () => {
  it('decrements question index when not at first', () => {
    const state = makeState({ currentQIndex: 2 });
    const result = getPreviousQuestion(state);
    expect(result.currentQIndex).toBe(1);
  });

  it('does not go below zero', () => {
    const state = makeState({ currentQIndex: 0 });
    const result = getPreviousQuestion(state);
    expect(result.currentQIndex).toBe(0);
  });
});

describe('restartGame', () => {
  it('resets everything to initial state', () => {
    const reset = createInitialQuizState();
    expect(reset).toEqual({
      currentQIndex: 0,
      score: 0,
      streak: 0,
      mood: 'idle',
      answeredMap: new Map(),
      gameOver: false,
      summaryVisible: false,
      attemptStatus: 'active',
    });
  });
});
