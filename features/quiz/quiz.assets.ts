import type { MoodState } from './quiz.types';

export const MOOD_IMAGES: Record<MoodState, string> = {
  idle: '/images/idle.png',
  correct: '/images/correct1.png',
  wrong: '/images/wrong.png',
  passed: '/images/pass.png',
  failed: '/images/fail.png',
};

export const CORRECT_IMAGES = ['/images/correct1.png', '/images/correct2.png'];

export const WRONG_IMAGES = ['/images/wrong1.png', '/images/wrong2.png'];
