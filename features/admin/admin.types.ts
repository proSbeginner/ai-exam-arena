import type { ExamQuestion, QuestionStatus, QuizOption } from '@/features/quiz/quiz.types';

export type AdminQuestionInput = Omit<ExamQuestion, 'id'>;

export interface AdminQuestionFormState {
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
