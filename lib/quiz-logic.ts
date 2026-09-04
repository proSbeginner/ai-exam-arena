import { questions, RANKS } from '@/data/questions';
import type { ExamQuestion, MoodState } from '@/data/questions';

export interface QuizState {
  currentQIndex: number;
  score: number;
  streak: number;
  mood: MoodState;
  answeredMap: Map<number, number>; // questionIdx -> selectedOption
  gameOver: boolean;
}

export interface QuizResult {
  score: number;
  streak: number;
  mood: MoodState;
  answeredMap: Map<number, number>;
  gameOver: boolean;
  triggerConfetti: boolean;
  rankChanged: boolean;
}

export function getRank(score: number): typeof RANKS[number] {
  return RANKS.filter(r => score >= r.min).at(-1) ?? RANKS[0];
}

export const STREAK_MILESTONES = [3, 5, 7, 10];

export function handleAnswer(
  state: QuizState,
  question: ExamQuestion,
  selectedOptionIndex: number
): QuizResult {
  const { score, streak, answeredMap, currentQIndex } = state;
  const isCorrect = selectedOptionIndex === question.correctIndex;
  const newAnsweredMap = new Map(answeredMap);
  newAnsweredMap.set(currentQIndex, selectedOptionIndex);

  let newScore = score;
  let newStreak = streak;
  let triggerConfetti = false;
  let rankChanged = false;

  if (isCorrect) {
    newScore = score + 1;
    newStreak = streak + 1;
    if (STREAK_MILESTONES.includes(newStreak)) {
      triggerConfetti = true;
    }
    const oldRank = getRank(score);
    const newRank = getRank(newScore);
    if (oldRank.title !== newRank.title) {
      rankChanged = true;
      triggerConfetti = true;
    }
  } else {
    newStreak = 0;
  }

  const mood = isCorrect ? 'correct' as const : 'wrong' as const;

  return {
    score: newScore,
    streak: newStreak,
    mood,
    answeredMap: newAnsweredMap,
    gameOver: state.gameOver,
    triggerConfetti,
    rankChanged,
  };
}

export function goToNext(state: QuizState): {
  currentQIndex: number;
  gameOver: boolean;
  mood: 'idle';
} {
  const answeredCount = state.answeredMap.size;
  if (answeredCount >= questions.length) {
    const finalMood = state.score >= Math.ceil(questions.length / 2) ? 'passed' as const : 'failed' as const;
    return {
      currentQIndex: state.currentQIndex,
      gameOver: true,
      mood: 'idle',
    };
  }
  if (state.currentQIndex < questions.length - 1) {
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

export function goToPrev(state: QuizState): QuizState {
  if (state.currentQIndex > 0) {
    return { ...state, currentQIndex: state.currentQIndex - 1 };
  }
  return state;
}

export function restartGame(): QuizState {
  return {
    currentQIndex: 0,
    score: 0,
    streak: 0,
    mood: 'idle',
    answeredMap: new Map(),
    gameOver: false,
  };
}
