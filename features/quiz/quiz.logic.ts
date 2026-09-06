import type { ExamQuestion } from '@/data/questions';
import { RANKS } from '@/data/questions';

import type { AnswerResult, NextQuestionResult, QuizState } from './quiz.types';

export function getRank(score: number): (typeof RANKS)[number] {
  return RANKS.filter((rank) => score >= rank.min).at(-1) ?? RANKS[0];
}

export const STREAK_MILESTONES = [3, 5, 7, 10];

export function evaluateAnswer(
  state: QuizState,
  question: ExamQuestion,
  selectedOptionIndex: number,
): AnswerResult {
  const isCorrect = selectedOptionIndex === question.correctIndex;
  const answeredMap = new Map(state.answeredMap);
  answeredMap.set(state.currentQIndex, selectedOptionIndex);

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
  };
}
