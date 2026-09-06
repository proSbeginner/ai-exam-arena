export type MoodState = 'idle' | 'correct' | 'wrong' | 'passed' | 'failed';

export interface ExamQuestion {
  id: number;
  topic: string;
  english: string;
  thai_drama: string;
  options: string[];
  correctIndex: number;
  hint_keyword: string;
  funFact?: string;
  chapter?: string;
}

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
