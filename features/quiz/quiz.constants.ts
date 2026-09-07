import type { QuizMode } from './quiz.types';

export const ATTEMPT_STATUS = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  ABANDONED: 'abandoned',
} as const;

export const RANKS = [
  { min: 0, title: 'AI Intern', emoji: '🌱' },
  { min: 3, title: 'Cloud Apprentice', emoji: '⚙️' },
  { min: 6, title: 'AI Practitioner', emoji: '🚀' },
  { min: 9, title: 'AI Master', emoji: '🏆' },
];

export const QUIZ_MODE_OPTIONS: Array<{
  value: QuizMode;
  label: string;
  description: string;
}> = [
  { value: 'primary', label: 'ปฐม', description: 'ฝึกพื้นฐานแบบเข้าใจง่าย' },
  { value: 'secondary', label: 'มัธยม', description: 'เพิ่มความท้าทายขึ้นอีกระดับ' },
  { value: 'university', label: 'มหาลัย', description: 'โหมดเต็มรูปแบบสำหรับเตรียมสอบ' },
];
