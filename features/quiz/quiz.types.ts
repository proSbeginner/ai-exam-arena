import { ATTEMPT_STATUS } from './quiz.constants';

export type MoodState = 'idle' | 'correct' | 'wrong' | 'passed' | 'failed';
export type QuizMode = 'primary' | 'secondary' | 'university';
export type QuestionStatus = 'draft' | 'published';
export type AttemptStatus = (typeof ATTEMPT_STATUS)[keyof typeof ATTEMPT_STATUS];

export interface QuizOption {
  id: string;
  english: string;
  thai_drama: string;
}

export interface QuestionSource {
  name: string;
  url?: string;
  reference?: string;
}

export interface ExamQuestion {
  id: string;
  labels: string[];
  english: string;
  thai_drama: string;
  options: QuizOption[];
  correctOptionId: string;
  funFact?: string;
  source?: QuestionSource;
  status: QuestionStatus;
}

export interface PlayerProfile {
  id: string;
  playerName: string;
}

export interface QuizAttempt {
  id: string;
  playerId: string;
  mode: QuizMode;
  questionLimit: number;
  status: AttemptStatus;
  startedAt: string;
  completedAt?: string;
}

export interface QuizAnswer {
  attemptId: string;
  questionId: string;
  selectedOptionId: string;
  isCorrect: boolean;
  answeredAt: string;
}

export interface QuizSetup {
  mode: QuizMode;
  questionLimit: number | null;
}

export interface QuizState {
  currentQIndex: number;
  score: number;
  streak: number;
  mood: MoodState;
  answeredMap: Map<number, string>;
  summaryVisible: boolean;
  attemptStatus: AttemptStatus;
}

export interface AnswerResult {
  score: number;
  streak: number;
  mood: 'correct' | 'wrong';
  answeredMap: Map<number, string>;
  triggerConfetti: boolean;
  rankChanged: boolean;
}

export interface NextQuestionResult {
  currentQIndex: number;
  isLastQuestion: boolean;
  mood: MoodState;
}
