import type { ExamQuestion, QuizMode, QuestionStatus, QuizOption } from '@/features/quiz/quiz.types';

export type AdminQuestionInput = Omit<ExamQuestion, 'id'>;

export interface AdminQuestionFormState {
  mode: QuizMode;
  labels: string[];
  labelInput: string;
  english: string;
  thai_drama: string;
  options: QuizOption[];
  correctOptionId: string;
  funFact: string;
  sourceName: string;
  status: QuestionStatus;
}
