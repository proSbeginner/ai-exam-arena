import type { MoodState } from '@/data/questions';

export interface QuizState {
  currentQIndex: number;
  score: number;
  streak: number;
  mood: MoodState;
  answeredMap: Map<number, number>;
  gameOver: boolean;
}

export interface AnswerResult {
  score: number;
  streak: number;
  mood: 'correct' | 'wrong';
  answeredMap: Map<number, number>;
  triggerConfetti: boolean;
  rankChanged: boolean;
}

export interface NextQuestionResult {
  currentQIndex: number;
  gameOver: boolean;
  mood: MoodState;
}
