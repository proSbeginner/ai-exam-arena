import { describe, it, expect } from 'vitest';
import { handleAnswer, goToPrev, goToNext, restartGame, getRank, STREAK_MILESTONES } from '@/lib/quiz-logic';
import type { QuizState } from '@/lib/quiz-logic';
import { questions, RANKS } from '@/data/questions';

// --- Helper factories ---
function makeState(opts: Partial<QuizState> = {}): QuizState {
  return {
    currentQIndex: opts.currentQIndex ?? 0,
    score: opts.score ?? 0,
    streak: opts.streak ?? 0,
    mood: opts.mood ?? 'idle',
    answeredMap: opts.answeredMap ?? new Map(),
    gameOver: opts.gameOver ?? false,
  };
}

function mockQuestion(correctIdx: number) {
  return { ...questions[0], correctIndex: correctIdx } as typeof questions[0];
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

describe('handleAnswer — correct answer', () => {
  const q = mockQuestion(0); // first option is correct

  it('increments score by 1 on first correct', () => {
    const state = makeState();
    const result = handleAnswer(state, q, 0);
    expect(result.score).toBe(1);
    expect(result.streak).toBe(1);
    expect(result.mood).toBe('correct');
    expect(result.triggerConfetti).toBe(false);
    expect(result.rankChanged).toBe(false);
  });

  it('does not change score on wrong when already answered', () => {
    const state = makeState({ score: 0 });
    const result = handleAnswer(state, q, 0);
    expect(result.score).toBe(1);
  });

  it('tracks answer in answeredMap', () => {
    const state = makeState();
    const result = handleAnswer(state, q, 0);
    expect(result.answeredMap.size).toBe(1);
    expect(result.answeredMap.get(0)).toBe(0);
  });
});

describe('handleAnswer — wrong answer', () => {
  const q = mockQuestion(0); // first option correct, select wrong index 1

  it('score does not increase', () => {
    const state = makeState({ score: 2, streak: 1 });
    const result = handleAnswer(state, q, 1);
    expect(result.score).toBe(2);
  });

  it('resets streak to 0', () => {
    const state = makeState({ streak: 3 });
    const result = handleAnswer(state, q, 1);
    expect(result.streak).toBe(0);
  });

  it('sets mood to wrong', () => {
    const state = makeState();
    const result = handleAnswer(state, q, 1);
    expect(result.mood).toBe('wrong');
  });
});

describe('handleAnswer — streak milestones & confetti', () => {
  const q = mockQuestion(0);

  it('triggers confetti at streak milestone 3', () => {
    let state = makeState({ score: 2, streak: 2 });
    let result = handleAnswer(state, q, 0);
    expect(result.triggerConfetti).toBe(true);
  });

  it('triggers confetti at streak milestone 5', () => {
    let state = makeState({ score: 4, streak: 4 });
    let result = handleAnswer(state, q, 0);
    expect(result.triggerConfetti).toBe(true);
  });

  it('does NOT trigger confetti at non-milestone streak (e.g. 4)', () => {
    let state = makeState({ score: 3, streak: 3 });
    let result = handleAnswer(state, q, 0);
    expect(result.triggerConfetti).toBe(false);
  });
});

describe('handleAnswer — rank up triggers confetti', () => {
  const q = mockQuestion(0);

  it('triggers confetti when promoted from Intern to Apprentice (score 2→3)', () => {
    let state = makeState({ score: 2, streak: 2 });
    const result = handleAnswer(state, q, 0);
    expect(result.rankChanged).toBe(true);
    expect(result.triggerConfetti).toBe(true);
    expect(result.score).toBe(3);
  });

  it('triggers confetti when promoted from Apprentice to Practitioner (score 5→6)', () => {
    let state = makeState({ score: 5, streak: 5 });
    const result = handleAnswer(state, q, 0);
    expect(result.rankChanged).toBe(true);
    expect(result.triggerConfetti).toBe(true);
    expect(result.score).toBe(6);
  });

  it('does not trigger when staying at same rank (score 3→4)', () => {
    let state = makeState({ score: 3, streak: 3 });
    const result = handleAnswer(state, q, 0);
    expect(result.rankChanged).toBe(false);
    expect(result.triggerConfetti).toBe(false);
  });
});

describe('goToNext', () => {
  it('advances question index when not at last', () => {
    const state = makeState({ currentQIndex: 0, answeredMap: new Map() });
    const result = goToNext(state);
    expect(result.currentQIndex).toBe(1);
    expect(result.gameOver).toBe(false);
  });

  it('does not advance past last question', () => {
    const state = makeState({ currentQIndex: questions.length - 1, answeredMap: new Map() });
    const result = goToNext(state);
    expect(result.currentQIndex).toBe(questions.length - 1);
  });
});

describe('goToPrev', () => {
  it('decrements question index when not at first', () => {
    const state = makeState({ currentQIndex: 2 });
    const result = goToPrev(state);
    expect(result.currentQIndex).toBe(1);
  });

  it('does not go below zero', () => {
    const state = makeState({ currentQIndex: 0 });
    const result = goToPrev(state);
    expect(result.currentQIndex).toBe(0);
  });
});

describe('restartGame', () => {
  it('resets everything to initial state', () => {
    const fullState = makeState({
      currentQIndex: 5,
      score: 8,
      streak: 4,
      gameOver: true,
    });
    const reset = restartGame();
    expect(reset).toEqual({
      currentQIndex: 0,
      score: 0,
      streak: 0,
      mood: 'idle',
      answeredMap: new Map(),
      gameOver: false,
    });
  });
});
