import { RANKS } from './quiz.constants';
import type { ExamQuestion } from './quiz.types';
import type { AnswerResult, NextQuestionResult, QuizState } from './quiz.types';

export function getRank(score: number): (typeof RANKS)[number] {
  return RANKS.filter((rank) => score >= rank.min).at(-1) ?? RANKS[0];
}

export const STREAK_MILESTONES = [3, 5, 7, 10];

function randomIndex(max: number): number {
  const randomValues = new Uint32Array(1);
  crypto.getRandomValues(randomValues);
  return randomValues[0] % max;
}

function shuffleOptions<T>(items: T[]): T[] {
  const shuffled = [...items];

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = randomIndex(index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  return shuffled;
}

export function randomizeQuestionOptions(questions: ExamQuestion[]): ExamQuestion[] {
  return questions.map((question) => {
    if (question.options.length < 2) return question;

    const originalIds = question.options.map((option) => option.id);
    let options = shuffleOptions(question.options);

    if (options.every((option, index) => option.id === originalIds[index])) {
      options = [options[1], options[0], ...options.slice(2)];
    }

    return { ...question, options };
  });
}

export function randomizeQuizQuestions(questions: ExamQuestion[]): ExamQuestion[] {
  const originalIds = questions.map((question) => question.id);
  let randomizedQuestions = shuffleOptions(questions);

  if (
    randomizedQuestions.length > 1 &&
    randomizedQuestions.every((question, index) => question.id === originalIds[index])
  ) {
    randomizedQuestions = [randomizedQuestions[1], randomizedQuestions[0], ...randomizedQuestions.slice(2)];
  }

  return randomizeQuestionOptions(randomizedQuestions);
}

export function evaluateAnswer(
  state: QuizState,
  question: ExamQuestion,
  selectedOptionId: string,
): AnswerResult {
  const isCorrect = selectedOptionId === question.correctOptionId;
  const answeredMap = new Map(state.answeredMap);
  answeredMap.set(state.currentQIndex, selectedOptionId);

  if (!isCorrect) {
    return {
      score: state.score,
      streak: 0,
      mood: 'wrong',
      answeredMap,
      triggerConfetti: false,
      rankChanged: false,
    };
  }

  const score = state.score + 1;
  const streak = state.streak + 1;
  const rankChanged = getRank(state.score).title !== getRank(score).title;

  return {
    score,
    streak,
    mood: 'correct',
    answeredMap,
    triggerConfetti: STREAK_MILESTONES.includes(streak) || rankChanged,
    rankChanged,
  };
}

export function getNextQuestion(
  state: QuizState,
  questionCount: number,
): NextQuestionResult {
  if (state.answeredMap.size >= questionCount) {
    return {
      currentQIndex: state.currentQIndex,
      gameOver: true,
      mood: state.score >= Math.ceil(questionCount / 2) ? 'passed' : 'failed',
    };
  }

  if (state.currentQIndex < questionCount - 1) {
    return {
      currentQIndex: state.currentQIndex + 1,
      gameOver: false,
      mood: 'idle',
    };
  }

  return {
    currentQIndex: state.currentQIndex,
    gameOver: false,
    mood: 'idle',
  };
}

export function getPreviousQuestion(state: QuizState): QuizState {
  if (state.currentQIndex === 0) return state;
  return { ...state, currentQIndex: state.currentQIndex - 1, mood: 'idle' };
}

export function createInitialQuizState(): QuizState {
  return {
    currentQIndex: 0,
    score: 0,
    streak: 0,
    mood: 'idle',
    answeredMap: new Map(),
    gameOver: false,
    summaryVisible: false,
    attemptStatus: 'active',
  };
}
