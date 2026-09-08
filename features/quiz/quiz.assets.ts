import type { MoodState } from './quiz.types';
import { QUIZ_MOOD } from './quiz.constants';

export const MOOD_IMAGES: Record<MoodState, string> = {
  idle: '/images/idle.png',
  correct: '/images/correct1.png',
  wrong: '/images/wrong1.png',
  passed: '/images/pass.png',
  failed: '/images/fail.png',
};

export const CORRECT_IMAGES = ['/images/correct1.png', '/images/correct2.png'];

export const WRONG_IMAGES = ['/images/wrong1.png', '/images/wrong2.png'];

export function getQuizMascotImage(mood: MoodState, correctImage: string, wrongImage: string): string {
  if (mood === QUIZ_MOOD.CORRECT) return correctImage;
  if (mood === QUIZ_MOOD.WRONG) return wrongImage;
  return MOOD_IMAGES[mood];
}
