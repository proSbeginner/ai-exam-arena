import type { QuizMode } from './quiz.types';

export const ATTEMPT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
} as const;

export const ANSWER_MOOD = {
  CORRECT: 'correct',
  WRONG: 'wrong',
} as const;

export const QUIZ_MOOD = {
  IDLE: 'idle',
  CORRECT: 'correct',
  WRONG: 'wrong',
  PASSED: 'passed',
  FAILED: 'failed',
} as const;

const configuredPassingScore = Number(process.env.NEXT_PUBLIC_PASSING_SCORE_PERCENTAGE);

export const PASSING_SCORE_PERCENTAGE = Number.isFinite(configuredPassingScore)
  && configuredPassingScore >= 0
  && configuredPassingScore <= 100
  ? configuredPassingScore
  : 80;

export const RANKS = [
  { min: 0, title: 'AI Intern', emoji: '🌱' },
  { min: 3, title: 'Cloud Apprentice', emoji: '⚙️' },
  { min: 6, title: 'AI Practitioner', emoji: '🚀' },
  { min: 9, title: 'AI Master', emoji: '🏆' },
];

export const STREAK_MILESTONES = [3, 5, 10, 15, 20];

export const STREAK_TITLES: Record<number, string> = {
  2: "Double Kill",
  3: "Killing Spree",
  4: "Dominating",
  5: "Mega Kill",
  6: "Unstoppable",
  7: "Wicked Sick",
  8: "Monster Kill",
  9: "Godlike",
  10: "Beyond Godlike",
};

export const QUIZ_MODE_OPTIONS: Array<{
  value: QuizMode;
  label: string;
  description: string;
}> = [
  { value: 'primary', label: 'ปฐม', description: 'ฝึกพื้นฐานแบบเข้าใจง่าย' },
  { value: 'secondary', label: 'มัธยม', description: 'เพิ่มความท้าทายขึ้นอีกระดับ' },
  { value: 'university', label: 'มหาลัย 🔥', description: 'โหมดเต็มรูปแบบสำหรับเตรียมสอบ' },
];

export const QUIZ_MODE_OPTION_LIMITS: Record<QuizMode, number> = {
  primary: 2,
  secondary: 3,
  university: 4,
};
